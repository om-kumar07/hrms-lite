import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchEmployees } from "../services/api";

function AttendancePicker() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadEmployees();
  }, []);

  async function loadEmployees() {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchEmployees();
      setEmployees(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function getInitials(name) {
    return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  }

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading employees...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-wrapper">
        <div className="page-header">
          <h2>Attendance</h2>
          <p>Select an employee to view or mark attendance</p>
        </div>
        <RetryCard message={error} onRetry={loadEmployees} />
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h2>Attendance</h2>
        <p>Select an employee to view or mark attendance</p>
      </div>

      {employees.length === 0 ? (
        <div className="data-table-wrapper">
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
            </div>
            <h3>No employees yet</h3>
            <p>Add employees first, then you can track attendance</p>
            <button className="btn btn-primary" onClick={() => navigate("/employees/new")}>
              Add Employee
            </button>
          </div>
        </div>
      ) : (
        <div className="employee-grid">
          {employees.map((emp) => (
            <div
              key={emp.employee_id}
              className="employee-card glass-card"
              onClick={() => navigate(`/attendance/${emp.employee_id}`)}
            >
              <div className="employee-card-avatar">{getInitials(emp.full_name)}</div>
              <div className="employee-card-info">
                <h4>{emp.full_name}</h4>
                <p>{emp.department}</p>
                <span className="employee-card-id">{emp.employee_id}</span>
              </div>
              <svg className="employee-card-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// reusable retry card component
function RetryCard({ message, onRetry }) {
  const [countdown, setCountdown] = useState(10);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoRetry();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  async function handleAutoRetry() {
    setRetrying(true);
    await onRetry();
  }

  async function handleManualRetry() {
    setRetrying(true);
    setCountdown(0);
    await onRetry();
  }

  return (
    <div className="retry-card glass-card">
      <div className="retry-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h3>Unable to load data</h3>
      <p className="retry-message">{message}</p>
      {countdown > 0 && !retrying && (
        <p className="retry-countdown">Retrying automatically in {countdown}s...</p>
      )}
      {retrying && (
        <div className="retry-spinner">
          <div className="spinner"></div>
        </div>
      )}
      <div className="retry-actions">
        <button className="btn btn-primary" onClick={handleManualRetry} disabled={retrying}>
          {retrying ? "Retrying..." : "Retry Now"}
        </button>
      </div>
    </div>
  );
}

export { RetryCard };
export default AttendancePicker;
