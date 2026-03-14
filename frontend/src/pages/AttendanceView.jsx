import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

      // refresh the data
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
    // reload without filters
    fetchAttendance(employeeId).then(setRecords);
  }

  function showToast(message, type) {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
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

  return (
    <div className="page-wrapper">
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>{toast.message}</div>
        </div>
      )}

      <a href="#" className="back-link" onClick={(e) => { e.preventDefault(); navigate("/employees"); }}>
        &larr; Back to Employees
      </a>

      {/* employee info header */}
      <div className="attendance-header">
        <div className="employee-info">
          <h3>{employee?.full_name}</h3>
          <p>{employee?.employee_id} &middot; {employee?.department} &middot; {employee?.email}</p>
        </div>
        {summary && (
          <div className="summary-chips">
            <div className="summary-chip">
              <div className="chip-value" style={{ color: "var(--color-primary)" }}>
                {summary.total_days}
              </div>
              <div className="chip-label">Total Days</div>
            </div>
            <div className="summary-chip">
              <div className="chip-value" style={{ color: "var(--color-success)" }}>
                {summary.present_days}
              </div>
              <div className="chip-label">Present</div>
            </div>
            <div className="summary-chip">
              <div className="chip-value" style={{ color: "var(--color-danger)" }}>
                {summary.absent_days}
              </div>
              <div className="chip-label">Absent</div>
            </div>
          </div>
        )}
      </div>

      {/* mark attendance form */}
      <div className="form-card" style={{ maxWidth: "100%", marginBottom: "24px" }}>
        <h3 style={{ fontSize: "0.95rem", marginBottom: "14px", fontWeight: 600 }}>
          Mark Attendance
        </h3>
        <form onSubmit={handleMark} style={{ display: "flex", alignItems: "flex-end", gap: "12px", flexWrap: "wrap" }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="mark-date">Date</label>
            <input
              id="mark-date"
              type="date"
              value={markDate}
              onChange={(e) => setMarkDate(e.target.value)}
              required
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
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
            {marking ? "Marking..." : "Mark"}
          </button>
        </form>
      </div>

      {/* date filter */}
      <div className="filter-bar">
        <label>Filter:</label>
        <input
          type="date"
          value={filterStart}
          onChange={(e) => setFilterStart(e.target.value)}
          placeholder="Start date"
        />
        <span style={{ color: "var(--color-text-muted)" }}>to</span>
        <input
          type="date"
          value={filterEnd}
          onChange={(e) => setFilterEnd(e.target.value)}
          placeholder="End date"
        />
        <button className="btn btn-secondary btn-sm" onClick={applyFilter}>
          Apply
        </button>
        {(filterStart || filterEnd) && (
          <button className="btn btn-secondary btn-sm" onClick={clearFilter}>
            Clear
          </button>
        )}
      </div>

      {/* attendance records table */}
      {records.length === 0 ? (
        <div className="data-table-wrapper">
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <h3>No attendance records</h3>
            <p>Use the form above to start marking attendance</p>
          </div>
        </div>
      ) : (
        <div className="data-table-wrapper">
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
