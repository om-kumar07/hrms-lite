// Base URL for the API - uses Vite proxy in dev, deployed backend URL in production
const API_BASE = import.meta.env.VITE_API_URL || "";

async function request(url, options = {}) {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const message = errorData?.detail || `Request failed (${response.status})`;
    throw new Error(message);
  }

  // DELETE responses might not have a body
  if (response.status === 204) return null;
  return response.json();
}


// -- Employee API calls --

export function fetchEmployees() {
  return request("/api/employees/");
}

export function fetchEmployee(employeeId) {
  return request(`/api/employees/${employeeId}`);
}

export function createEmployee(data) {
  return request("/api/employees/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function deleteEmployee(employeeId) {
  return request(`/api/employees/${employeeId}`, {
    method: "DELETE",
  });
}

export function updateEmployee(employeeId, data) {
  return request(`/api/employees/${employeeId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}


// -- Attendance API calls --

export function markAttendance(data) {
  return request("/api/attendance/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function fetchAttendance(employeeId, startDate, endDate) {
  let url = `/api/attendance/${employeeId}`;
  const params = new URLSearchParams();
  if (startDate) params.append("start_date", startDate);
  if (endDate) params.append("end_date", endDate);
  if (params.toString()) url += `?${params.toString()}`;
  return request(url);
}

export function fetchAttendanceSummary(employeeId) {
  return request(`/api/attendance/${employeeId}/summary`);
}


// -- Dashboard API calls --

export function fetchDashboardSummary() {
  return request("/api/dashboard/summary");
}
