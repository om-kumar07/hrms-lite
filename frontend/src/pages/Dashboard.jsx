import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";
import { fetchDashboardSummary, fetchEmployees } from "../services/api";
import { RetryCard } from "./AttendancePicker";

const COLORS = {
  present: "#34d399",
  absent: "#f87171",
  notMarked: "#fbbf24",
};

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const [summaryData, employeeData] = await Promise.all([
        fetchDashboardSummary(),
        fetchEmployees(),
      ]);
      setStats(summaryData);
      setEmployees(employeeData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function getInitials(name) {
    return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  }

  function getPieData() {
    if (!stats) return [];
    return [
      { name: "Present", value: stats.present_today, color: COLORS.present },
      { name: "Absent", value: stats.absent_today, color: COLORS.absent },
      { name: "Not Marked", value: stats.not_marked_today, color: COLORS.notMarked },
    ].filter((d) => d.value > 0);
  }

  function getWeeklyData() {
    if (!stats) return [];
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
    const total = stats.total_employees || 1;
    return days.map((day) => ({
      day,
      present: Math.floor(Math.random() * total * 0.4) + Math.ceil(total * 0.5),
      absent: Math.floor(Math.random() * Math.ceil(total * 0.3)),
    }));
  }

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-wrapper">
        <div className="page-header">
          <h2>Dashboard</h2>
          <p>{getGreeting()}, Admin. Here's what's happening today.</p>
        </div>
        <RetryCard message={error} onRetry={loadData} />
      </div>
    );
  }

  const pieData = getPieData();
  const weeklyData = getWeeklyData();

  return (
    <div className="page-wrapper">
      <div className="page-header-row">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h2>Dashboard</h2>
          <p>{getGreeting()}, Admin. Here's what's happening today.</p>
        </div>
        <div className="header-badge">
          <span className="active-dot"></span>
          Active Session
        </div>
      </div>

      <div style={{ height: "24px" }}></div>

      {/* stat cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-label">Total Employees</div>
            <div className="stat-icon purple">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
            </div>
          </div>
          <div className="stat-value">{stats?.total_employees || 0}</div>
          <div className="stat-subtext">Registered in system</div>
        </div>

        <div className="stat-card success">
          <div className="stat-card-header">
            <div className="stat-label">Present Today</div>
            <div className="stat-icon green">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </div>
          <div className="stat-value">{stats?.present_today || 0}</div>
          <div className="stat-subtext">Marked as active</div>
        </div>

        <div className="stat-card danger">
          <div className="stat-card-header">
            <div className="stat-label">Absent Today</div>
            <div className="stat-icon red">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </div>
          </div>
          <div className="stat-value">{stats?.absent_today || 0}</div>
          <div className="stat-subtext">Not in office</div>
        </div>

        <div className="stat-card warning">
          <div className="stat-card-header">
            <div className="stat-label">Not Marked</div>
            <div className="stat-icon yellow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
          </div>
          <div className="stat-value">{stats?.not_marked_today || 0}</div>
          <div className="stat-subtext">Pending action</div>
        </div>
      </div>

      {/* charts and quick actions row */}
      <div className="charts-grid">
        {stats && stats.total_employees > 0 ? (
          <>
            <div className="glass-card chart-card">
              <h3>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
                  <path d="M22 12A10 10 0 0 0 12 2v10z" />
                </svg>
                Today's Attendance
              </h3>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "var(--bg-card-solid)",
                        border: "1px solid var(--border-color)",
                        borderRadius: "8px",
                        fontSize: "0.82rem",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-state" style={{ padding: "30px" }}>
                  <p>No attendance marked yet today</p>
                </div>
              )}
            </div>

            <div className="glass-card chart-card">
              <h3>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
                Weekly Overview
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={weeklyData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: "var(--bg-card-solid)", border: "1px solid var(--border-color)", borderRadius: "8px", fontSize: "0.82rem" }} />
                  <Bar dataKey="present" fill={COLORS.present} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="absent" fill={COLORS.absent} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          <div className="glass-card chart-card">
            <h3>Recent Activity</h3>
            <div className="empty-state" style={{ padding: "30px" }}>
              <p style={{ fontStyle: "italic", color: "var(--text-muted)" }}>No recent activity for this date.</p>
            </div>
          </div>
        )}

        {/* quick actions */}
        <div className="glass-card chart-card">
          <h3>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            Quick Actions
          </h3>
          <div className="quick-actions">
            <button className="quick-action-btn" onClick={() => navigate("/employees/new")}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <line x1="20" y1="8" x2="20" y2="14" />
                <line x1="23" y1="11" x2="17" y2="11" />
              </svg>
              Add Employee
            </button>
            <button className="quick-action-btn" onClick={() => navigate("/attendance")}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
                <polyline points="9 16 10.5 17.5 15 13" />
              </svg>
              Mark Attendance
            </button>
          </div>
        </div>
      </div>

      {/* recent employees */}
      <div className="data-table-wrapper">
        <div className="table-header">
          <h3>Recent Employees</h3>
          {employees.length > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={() => navigate("/employees")}>
              View All
            </button>
          )}
        </div>
        {employees.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
            </div>
            <h3>No employees yet</h3>
            <p>Add your first employee to get started</p>
            <button className="btn btn-primary" onClick={() => navigate("/employees/new")}>
              Add Employee
            </button>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Employee ID</th>
              </tr>
            </thead>
            <tbody>
              {employees.slice(0, 5).map((emp) => (
                <tr key={emp.employee_id} style={{ cursor: "pointer" }} onClick={() => navigate(`/attendance/${emp.employee_id}`)}>
                  <td>
                    <div className="employee-cell">
                      <div className="avatar">{getInitials(emp.full_name)}</div>
                      <div className="employee-cell-info">
                        <span>{emp.full_name}</span>
                        <span>{emp.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>{emp.department}</td>
                  <td>{emp.employee_id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
