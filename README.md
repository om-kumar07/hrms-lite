# HRMS Lite — HR Management System

A modern, full-stack Human Resource Management System with real-time dashboard analytics, employee lifecycle management, and attendance tracking. Built with **FastAPI** (Python) and **React 18** (Vite).

> **Live Demo**: [hrms-om-kumar.vercel.app](https://hrms-om-kumar.vercel.app)

---

## ✨ Key Features

### Employee Management
- Full **CRUD operations** — Create, Read, Update, Delete employees
- Inline validation with duplicate ID and email checks
- Department-wise color-coded badges
- Search and filter by name, ID, or department
- **CSV export** of employee data with attendance stats

### Attendance Tracking
- Mark daily attendance (Present / Absent) per employee
- Date-range filtering for attendance records
- Monthly attendance breakdown chart (Recharts bar chart)
- Per-employee attendance summary with present/absent counts

### Dashboard & Analytics
- Real-time stat cards — Total Employees, Present, Absent, Not Marked
- Interactive **pie chart** for today's attendance distribution
- **Weekly overview** bar chart with present vs absent trends
- Quick action shortcuts for common tasks
- Active session indicator with live date display

### UI/UX
- **Dual theme** — Light and Dark mode toggle, persisted in localStorage
- **Glassmorphism** design with backdrop blur and gradient accents
- Micro-animations — fade-in pages, hover effects, card lift transitions
- **Cold-start splash screen** with rotating feature tips (handles Render free-tier wake-up)
- Auto-retry with countdown on failed API calls
- Fully responsive — works on desktop, tablet, and mobile

---

## 🛠️ Tech Stack

| Layer      | Technology                            |
|------------|---------------------------------------|
| Frontend   | React 18, Vite, React Router v6      |
| Charts     | Recharts                             |
| Backend    | FastAPI (Python 3.10+)               |
| ORM        | SQLAlchemy                           |
| Database   | PostgreSQL (Neon) / SQLite (dev)     |
| Validation | Pydantic v2                          |
| Styling    | Vanilla CSS with CSS custom properties|
| Hosting    | Vercel (frontend) + Render (backend) |

---

## 📁 Project Structure

```
hrms-lite/
├── backend/
│   ├── main.py                 # FastAPI app, CORS, health check
│   ├── database.py             # SQLAlchemy engine and session
│   ├── models.py               # Employee and Attendance ORM models
│   ├── schemas.py              # Pydantic schemas with validation
│   ├── requirements.txt        # Python dependencies
│   └── routers/
│       ├── employees.py        # CRUD endpoints for employees
│       ├── attendance.py       # Attendance marking and queries
│       └── dashboard.py        # Dashboard summary analytics
├── frontend/
│   ├── index.html              # Entry HTML with Inter font
│   ├── vite.config.js          # Vite config with API proxy
│   ├── vercel.json             # SPA rewrite rules for Vercel
│   ├── package.json
│   └── src/
│       ├── main.jsx            # React entry point
│       ├── App.jsx             # Routes, theme provider, cold-start
│       ├── index.css           # Global styles, themes, animations
│       ├── components/
│       │   ├── Layout.jsx      # Header bar, sidebar, responsive nav
│       │   ├── ThemeContext.jsx # Dark/light theme state management
│       │   └── ColdStartScreen.jsx  # Loading screen for cold starts
│       ├── pages/
│       │   ├── Dashboard.jsx       # Stats, charts, quick actions
│       │   ├── EmployeeList.jsx    # Table with search, filter, export
│       │   ├── AddEmployee.jsx     # Create employee form
│       │   ├── EditEmployee.jsx    # Update employee form
│       │   ├── AttendancePicker.jsx # Employee selection for attendance
│       │   └── AttendanceView.jsx  # Attendance records and marking
│       └── services/
│           └── api.js          # API client with error handling
├── render.yaml                 # Render deployment config
└── README.md
```

---

## 🚀 Running Locally

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm 9+

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API available at `http://localhost:8000` · Swagger docs at `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Opens at `http://localhost:5173`. API calls are proxied to the backend automatically.

---

## 📡 API Reference

| Method | Endpoint                        | Description                 |
|--------|---------------------------------|-----------------------------|
| GET    | `/`                             | Health check                |
| GET    | `/api/employees/`               | List all employees          |
| POST   | `/api/employees/`               | Create new employee         |
| GET    | `/api/employees/{id}`           | Get employee by ID          |
| PUT    | `/api/employees/{id}`           | Update employee details     |
| DELETE | `/api/employees/{id}`           | Delete employee + records   |
| POST   | `/api/attendance/`              | Mark attendance             |
| GET    | `/api/attendance/{id}`          | Get attendance records      |
| GET    | `/api/attendance/{id}/summary`  | Attendance stats per employee|
| GET    | `/api/dashboard/summary`        | Dashboard overview stats    |

---

## 🌐 Deployment

### Frontend → Vercel
- Connected to GitHub for auto-deploy
- Root directory: `frontend`
- Environment variable: `VITE_API_URL` = Render backend URL

### Backend → Render
- Uses `render.yaml` for config
- Environment variables: `DATABASE_URL`, `ALLOWED_ORIGINS`
- Free tier — cold starts after 15min inactivity (handled by splash screen)

---

## 📝 Design Decisions

- **No authentication** — kept simple since this is an employee management demo
- **CSS custom properties** for theming instead of a CSS framework — shows CSS proficiency
- **Recharts** for charting — lightweight, React-native, no D3 dependency overhead
- **SQLAlchemy ORM** with Pydantic v2 — type-safe data layer with automatic validation
- **Cascade deletes** — removing an employee also cleans up their attendance records
- **Cold-start UX** — instead of showing errors, the splash screen keeps users engaged

---

## 📄 License

This project is built for educational and demonstration purposes.
