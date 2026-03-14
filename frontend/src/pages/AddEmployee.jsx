import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createEmployee } from "../services/api";

// some common departments to pick from
const DEPARTMENTS = [
  "Engineering",
  "Product",
  "Design",
  "Marketing",
  "Sales",
  "Human Resources",
  "Finance",
  "Operations",
  "Support",
  "Other",
];

function AddEmployee() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    employee_id: "",
    full_name: "",
    email: "",
    department: "",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // clear the error for this field as user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  }

  function validate() {
    const newErrors = {};

    if (!formData.employee_id.trim()) {
      newErrors.employee_id = "Employee ID is required";
    }
    if (!formData.full_name.trim()) {
      newErrors.full_name = "Full name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.department) {
      newErrors.department = "Department is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    try {
      setSubmitting(true);
      await createEmployee(formData);
      navigate("/employees");
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-wrapper">
      <a href="#" className="back-link" onClick={(e) => { e.preventDefault(); navigate("/employees"); }}>
        &larr; Back to Employees
      </a>

      <div className="page-header">
        <h2>Add New Employee</h2>
        <p>Fill in the details below to register a new employee</p>
      </div>

      {serverError && (
        <div className="error-state" style={{ padding: "12px 0", alignItems: "flex-start" }}>
          <p>{serverError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="employee_id">Employee ID</label>
            <input
              id="employee_id"
              name="employee_id"
              type="text"
              placeholder="e.g. EMP001"
              value={formData.employee_id}
              onChange={handleChange}
            />
            {errors.employee_id && <small style={{ color: "var(--color-danger)", fontSize: "0.78rem" }}>{errors.employee_id}</small>}
          </div>

          <div className="form-group">
            <label htmlFor="full_name">Full Name</label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              placeholder="e.g. John Doe"
              value={formData.full_name}
              onChange={handleChange}
            />
            {errors.full_name && <small style={{ color: "var(--color-danger)", fontSize: "0.78rem" }}>{errors.full_name}</small>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="e.g. john@company.com"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <small style={{ color: "var(--color-danger)", fontSize: "0.78rem" }}>{errors.email}</small>}
          </div>

          <div className="form-group">
            <label htmlFor="department">Department</label>
            <select
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
            >
              <option value="">Select department</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            {errors.department && <small style={{ color: "var(--color-danger)", fontSize: "0.78rem" }}>{errors.department}</small>}
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Adding..." : "Add Employee"}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/employees")}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddEmployee;
