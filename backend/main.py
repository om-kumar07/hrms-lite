import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
from routers import employees, attendance, dashboard

# create all database tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="HRMS Lite API",
    description="A lightweight HR Management System with employee CRUD, attendance tracking, and dashboard analytics",
    version="2.0.0",
)

# CORS setup - allow the frontend to talk to this backend
# In production, you'd want to restrict this to your actual frontend domain
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# register route handlers
app.include_router(employees.router)
app.include_router(attendance.router)
app.include_router(dashboard.router)


@app.get("/")
def health_check():
    """Health check endpoint used by the frontend cold-start screen."""
    return {"status": "ok", "service": "HRMS Lite API", "version": "2.0.0"}
