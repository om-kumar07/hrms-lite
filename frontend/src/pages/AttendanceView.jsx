import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import {
  fetchEmployee,
  fetchAttendance,
  fetchAttendanceSummary,
  markAttendance,
} from "../services/api";

function AttendanceView() {
  const { employeeId } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // mark attendance form
  const today = new Date().toISOString().split("T")[0];
  const [markDate, setMarkDate] = useState(today);
  const [markStatus, setMarkStatus] = useState("Present");
  const [marking, setMarking] = useState(false);

  // date filter
  const [filterStart, setFilterStart] = useState("");
  const [filterEnd, setFilterEnd] = useState("");

  useEffect(() => {
    loadAll();
  }, [employeeId]);

  async function loadAll() {
    try {
      setLoading(true);
      setError(null);
      const [empData, attendanceData, summaryData] = await Promise.all([
        fetchEmployee(employeeId),
        fetchAttendance(employeeId),
        fetchAttendanceSummary(employeeId),
      ]);
      setEmployee(empData);
      setRecords(attendanceData);
      setSummary(summaryData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleMark(e) {
    e.preventDefault();
    try {
      setMarking(true);
      await markAttendance({
        employee_id: employeeId,
        date: markDate,
        status: markStatus,
      });
      showToast("Attendance marked successfully", "success");
      const [attendanceData, summaryData] = await Promise.all([
        fetchAttendance(employeeId, filterStart || undefined, filterEnd || undefined),
        fetchAttendanceSummary(employeeId),
      ]);
      setRecords(attendanceData);
      setSummary(summaryData);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setMarking(false);
    }
  }

  async function applyFilter() {
    try {
      const data = await fetchAttendance(
        employeeId,
        filterStart || undefined,
        filterEnd || undefined
      );
      setRecords(data);
    } catch (err) {
      showToast(err.message, "error");
    }
  }

  function clearFilter() {
    setFilterStart("");
    setFilterEnd("");
    fetchAttendance(employeeId).then(setRecords);
  }

  function showToast(message, type) {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  function getInitials(name) {
    return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  // prepare monthly chart data from records
  function getMonthlyChart() {
    if (records.length === 0) return [];

    const months = {};
    records.forEach((rec) => {
      const d = new Date(rec.date + "T00:00:00");
      const key = d.toLocaleDateString("en-US", { month: "short" });
      if (!months[key]) months[key] = { month: key, present: 0, absent: 0 };
      if (rec.status === "Present") months[key].present++;
      else months[key].absent++;
    });

    return Object.values(months).reverse();
  }

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading attendance data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-wrapper">
        <div className="error-state">
          <p>{error}</p>
          <button className="btn btn-primary" onClick={loadAll}>Retry</button>
        </div>
      </div>
    );
  }

  const monthlyData = getMonthlyChart();

  return (
    <div className="page-wrapper">
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>{toast.message}</div>
        </div>
      )}

      <a
        href="#"
        className="back-link"
        onClick={(e) => { e.preventDefault(); navigate("/employees"); }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to Employees
      </a>

      {/* employee profile header */}
      <div className="attendance-header">
        <div className="employee-profile">
          <div className="profile-avatar">{getInitials(employee?.full_name || "")}</div>
          <div className="employee-info">
            <h3>{employee?.full_name}</h3>
            <p>{employee?.employee_id} &middot; {employee?.department} &middot; {employee?.email}</p>
          </div>
        </div>
        {summary && (
          <div className="summary-chips">
            <div className="summary-chip">
              <div className="chip-value" style={{ color: "var(--accent)" }}>{summary.total_days}</div>
              <div className="chip-label">Total Days</div>
            </div>
            <div className="summary-chip">
              <div className="chip-value" style={{ color: "var(--success)" }}>{summary.present_days}</div>
              <div className="chip-label">Present</div>
            </div>
            <div className="summary-chip">
              <div className="chip-value" style={{ color: "var(--danger)" }}>{summary.absent_days}</div>
              <div className="chip-label">Absent</div>
            </div>
          </div>
        )}
      </div>

      {/* mark attendance */}
      <div className="glass-card mark-attendance-card">
        <h3 style={{ fontSize: "0.95rem", marginBottom: "16px", fontWeight: 600 }}>
          Mark Attendance
        </h3>
        <form onSubmit={handleMark} className="mark-form">
          <div className="form-group">
            <label htmlFor="mark-date">Date</label>
            <input
              id="mark-date"
              type="date"
              value={markDate}
              onChange={(e) => setMarkDate(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="mark-status">Status</label>
            <select
              id="mark-status"
              value={markStatus}
              onChange={(e) => setMarkStatus(e.target.value)}
            >
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary" disabled={marking}>
            {marking ? "Marking..." : "Mark Attendance"}
          </button>
        </form>
      </div>

      {/* monthly chart */}
      {monthlyData.length > 0 && (
        <div className="glass-card chart-card" style={{ marginBottom: "24px" }}>
          <h3>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            Monthly Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--text-muted)", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--text-muted)", fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--bg-card-solid)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  fontSize: "0.82rem",
                }}
              />
              <Bar dataKey="present" fill="#34d399" radius={[4, 4, 0, 0]} name="Present" />
              <Bar dataKey="absent" fill="#f87171" radius={[4, 4, 0, 0]} name="Absent" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* date filter */}
      <div className="filter-bar">
        <label>Filter by date:</label>
        <input type="date" value={filterStart} onChange={(e) => setFilterStart(e.target.value)} />
        <span style={{ color: "var(--text-muted)" }}>to</span>
        <input type="date" value={filterEnd} onChange={(e) => setFilterEnd(e.target.value)} />
        <button className="btn btn-ghost btn-sm" onClick={applyFilter}>Apply</button>
        {(filterStart || filterEnd) && (
          <button className="btn btn-ghost btn-sm" onClick={clearFilter}>Clear</button>
        )}
      </div>

      {/* attendance records table */}
      {records.length === 0 ? (
        <div className="data-table-wrapper">
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <h3>No attendance records</h3>
            <p>Use the form above to start marking attendance</p>
          </div>
        </div>
      ) : (
        <div className="data-table-wrapper">
          <div className="table-header">
            <h3>Attendance Records</h3>
            <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
              {records.length} record{records.length !== 1 ? "s" : ""}
            </span>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((rec) => (
                <tr key={rec.id}>
                  <td>{formatDate(rec.date)}</td>
                  <td>
                    <span className={`badge badge-${rec.status.toLowerCase()}`}>
                      {rec.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AttendanceView;
