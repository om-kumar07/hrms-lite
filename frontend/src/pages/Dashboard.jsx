import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchDashboardSummary, fetchEmployees } from "../services/api";

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
        <div className="error-state">
          <p>{error}</p>
          <button className="btn btn-primary" onClick={loadData}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Overview of your workforce and today's attendance</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-label">Total Employees</div>
          <div className="stat-value">{stats?.total_employees || 0}</div>
        </div>
        <div className="stat-card success">
          <div className="stat-label">Present Today</div>
          <div className="stat-value">{stats?.present_today || 0}</div>
        </div>
        <div className="stat-card danger">
          <div className="stat-label">Absent Today</div>
          <div className="stat-value">{stats?.absent_today || 0}</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-label">Not Marked</div>
          <div className="stat-value">{stats?.not_marked_today || 0}</div>
        </div>
      </div>

      {/* recent employees section */}
      <div className="page-header" style={{ marginTop: "16px" }}>
        <h2 style={{ fontSize: "1.15rem" }}>Recent Employees</h2>
      </div>

      {employees.length === 0 ? (
        <div className="data-table-wrapper">
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
            <h3>No employees yet</h3>
            <p>Add your first employee to get started</p>
            <button
              className="btn btn-primary"
              style={{ marginTop: "12px" }}
              onClick={() => navigate("/employees/new")}
            >
              Add Employee
            </button>
          </div>
        </div>
      ) : (
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Department</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {employees.slice(0, 5).map((emp) => (
                <tr
                  key={emp.employee_id}
                  className="clickable-row"
                  onClick={() => navigate(`/attendance/${emp.employee_id}`)}
                >
                  <td>{emp.employee_id}</td>
                  <td>{emp.full_name}</td>
                  <td>{emp.department}</td>
                  <td>{emp.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
