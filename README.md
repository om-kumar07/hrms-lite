# HRMS Lite

A lightweight Human Resource Management System built as a full-stack web application. It allows an admin to manage employee records and track daily attendance.

## Tech Stack

| Layer     | Technology               |
|-----------|--------------------------|
| Frontend  | React 18, Vite, React Router |
| Backend   | FastAPI (Python)         |
| Database  | SQLite (dev) / PostgreSQL (prod) |
| ORM       | SQLAlchemy               |
| Styling   | Vanilla CSS (custom dark theme) |

## Features

- **Employee Management** – Add, view, and delete employees with validation
- **Attendance Tracking** – Mark daily attendance (Present/Absent), view records per employee
- **Dashboard** – Summary stats for total employees, today's attendance breakdown
- **Date Filtering** – Filter attendance records by date range
- **Attendance Summary** – Per-employee present/absent day counts
- **Validation** – Duplicate employee ID and email checks, required fields, email format
- **Error Handling** – Proper HTTP status codes, meaningful error messages, UI error states

## Project Structure

```
hrms-lite/
├── backend/
│   ├── main.py              # FastAPI app entry point
│   ├── database.py          # DB engine and session setup
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # Pydantic request/response schemas
│   ├── requirements.txt
│   └── routers/
│       ├── employees.py     # Employee CRUD endpoints
│       ├── attendance.py    # Attendance endpoints
│       └── dashboard.py     # Dashboard summary endpoint
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── components/
│       │   └── Layout.jsx
│       ├── pages/
│       │   ├── Dashboard.jsx
│       │   ├── EmployeeList.jsx
│       │   ├── AddEmployee.jsx
│       │   └── AttendanceView.jsx
│       └── services/
│           └── api.js
└── README.md
```

## Running Locally

### Prerequisites

- Python 3.10+
- Node.js 18+
- npm

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`. API calls are proxied to the backend during local development.

## API Endpoints

| Method | Endpoint                           | Description              |
|--------|------------------------------------|--------------------------|
| GET    | `/api/employees`                   | List all employees       |
| POST   | `/api/employees/`                  | Add new employee         |
| GET    | `/api/employees/{id}`              | Get employee by ID       |
| DELETE | `/api/employees/{id}`              | Delete employee          |
| POST   | `/api/attendance/`                 | Mark attendance          |
| GET    | `/api/attendance/{id}`             | Get attendance records   |
| GET    | `/api/attendance/{id}/summary`     | Attendance stats         |
| GET    | `/api/dashboard/summary`           | Dashboard overview       |

## Assumptions and Limitations

- Single admin user; no authentication or role-based access
- Leave management, payroll, and other advanced HR features are out of scope
- SQLite is used for local development; PostgreSQL recommended for production
- Attendance can only be marked once per employee per day
- Employee ID and email must be unique across the system
