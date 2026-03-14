from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date

from database import get_db
from models import Employee, Attendance
from schemas import DashboardStats

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/summary", response_model=DashboardStats)
def get_dashboard_summary(db: Session = Depends(get_db)):
    """
    Returns a quick overview of employee and attendance numbers.
    Used by the frontend dashboard page.
    """
    total_employees = db.query(Employee).count()

    today = date.today()

    today_records = (
        db.query(Attendance).filter(Attendance.date == today).all()
    )

    present_today = sum(1 for r in today_records if r.status == "Present")
    absent_today = sum(1 for r in today_records if r.status == "Absent")

    # employees who haven't had their attendance marked yet today
    marked_employee_ids = {r.employee_id for r in today_records}
    not_marked_today = total_employees - len(marked_employee_ids)

    return DashboardStats(
        total_employees=total_employees,
        present_today=present_today,
        absent_today=absent_today,
        not_marked_today=not_marked_today,
    )
