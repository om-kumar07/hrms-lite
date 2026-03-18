import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { fetchEmployees, deleteEmployee, fetchAttendanceSummary } from "../services/api";

function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [summaries, setSummaries] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All Departments");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);
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

      // fetch attendance summaries for all employees
      const summaryMap = {};
      await Promise.all(
        data.map(async (emp) => {
          try {
            const s = await fetchAttendanceSummary(emp.employee_id);
            summaryMap[emp.employee_id] = s;
          } catch {
            summaryMap[emp.employee_id] = { present_days: 0, absent_days: 0 };
          }
        })
      );
      setSummaries(summaryMap);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // get unique departments
  const departments = useMemo(() => {
    const depts = [...new Set(employees.map((e) => e.department))];
    return depts.sort();
  }, [employees]);

  // filtered employees
  const filtered = useMemo(() => {
    return employees.filter((emp) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        emp.full_name.toLowerCase().includes(q) ||
        emp.employee_id.toLowerCase().includes(q) ||
        emp.email.toLowerCase().includes(q);
      const matchesDept =
        departmentFilter === "All Departments" ||
        emp.department === departmentFilter;
      return matchesSearch && matchesDept;
    });
  }, [employees, searchQuery, departmentFilter]);

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteEmployee(deleteTarget);
      setDeleteTarget(null);
      showToast("Employee deleted successfully", "success");
      loadEmployees();
    } catch (err) {
      showToast(err.message, "error");
      setDeleteTarget(null);
    }
  }

  function exportCSV() {
    if (employees.length === 0) return;
    const headers = ["Employee ID", "Full Name", "Email", "Department", "Present", "Absent"];
    const rows = employees.map((emp) => {
      const s = summaries[emp.employee_id] || { present_days: 0, absent_days: 0 };
      return [emp.employee_id, emp.full_name, emp.email, emp.department, s.present_days, s.absent_days];
    });
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "employees.csv";
    a.click();
    URL.revokeObjectURL(url);
    showToast("CSV exported successfully", "success");
  }

  function showToast(message, type) {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  function getDeptColor(dept) {
    const colors = {
      Engineering: "#818cf8",
      Product: "#f472b6",
      Design: "#fb923c",
      Marketing: "#34d399",
      Sales: "#60a5fa",
      "Human Resources": "#c084fc",
      Finance: "#fbbf24",
      Operations: "#22d3ee",
      Support: "#a78bfa",
      HR: "#c084fc",
    };
    return colors[dept] || "#818cf8";
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

  return (
    <div className="page-wrapper">
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>{toast.message}</div>
        </div>
      )}

      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Employee</h3>
            <p>
              Are you sure you want to delete <strong>{deleteTarget}</strong>?
              This will also remove all their attendance records.
            </p>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <div className="page-header-row">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h2>Employees</h2>
          <p>Manage your workforce efficiently.</p>
        </div>
        <div className="header-actions">
          {employees.length > 0 && (
            <button className="btn btn-ghost" onClick={exportCSV}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Export CSV
            </button>
          )}
          <button className="btn btn-primary" onClick={() => navigate("/employees/new")}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Employee
          </button>
        </div>
      </div>

      <div style={{ height: "20px" }}></div>

      {error && (
        <div className="error-state" style={{ padding: "24px" }}>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={loadEmployees}>Retry</button>
        </div>
      )}

      {!error && employees.length === 0 && (
        <div className="data-table-wrapper">
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
            </div>
            <h3>No employees found</h3>
            <p>Start by adding your first employee</p>
            <button className="btn btn-primary" onClick={() => navigate("/employees/new")}>Add Employee</button>
          </div>
        </div>
      )}

      {!error && employees.length > 0 && (
        <div className="data-table-wrapper">
          <div className="table-header">
            <div className="table-search-wrapper">
              <input
                className="search-input"
                type="text"
                placeholder="Search employees by name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="dept-filter"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="All Departments">All Departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Full Name</th>
                <th>Department</th>
                <th>Attendance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp) => {
                const s = summaries[emp.employee_id] || { present_days: 0, absent_days: 0 };
                return (
                  <tr key={emp.employee_id}>
                    <td>
                      <div className="id-cell">
                        <span className="id-value">{emp.employee_id}</span>
                        <span className="id-email">{emp.email}</span>
                      </div>
                    </td>
                    <td>
                      <span className="name-bold">{emp.full_name}</span>
                    </td>
                    <td>
                      <span
                        className="dept-badge"
                        style={{
                          color: getDeptColor(emp.department),
                          background: getDeptColor(emp.department) + "18",
                        }}
                      >
                        {emp.department}
                      </span>
                    </td>
                    <td>
                      <div className="attendance-counts">
                        <div className="att-count present">
                          <span className="att-label">PRESENT</span>
                          <span className="att-num">{s.present_days}</span>
                        </div>
                        <div className="att-count absent">
                          <span className="att-label">ABSENT</span>
                          <span className="att-num">{s.absent_days}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="inline-actions">
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => navigate(`/employees/${emp.employee_id}/edit`)}
                          title="Edit Employee"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => navigate(`/attendance/${emp.employee_id}`)}
                          title="View Attendance"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                            <rect x="3" y="4" width="18" height="18" rx="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                        </button>
                        <button
                          className="icon-btn-danger"
                          onClick={() => setDeleteTarget(emp.employee_id)}
                          title="Delete Employee"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
                    No employees match your search
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default EmployeeList;
