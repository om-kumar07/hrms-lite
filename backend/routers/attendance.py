from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from database import get_db
from models import Employee, Attendance
from schemas import AttendanceCreate, AttendanceResponse, AttendanceSummary

router = APIRouter(prefix="/api/attendance", tags=["Attendance"])


@router.post("/", response_model=AttendanceResponse, status_code=201)
def mark_attendance(payload: AttendanceCreate, db: Session = Depends(get_db)):
    """Mark attendance (Present/Absent) for an employee on a specific date."""

    # make sure the employee actually exists
    employee = db.query(Employee).filter(Employee.employee_id == payload.employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    # check if attendance was already marked for this date
    existing = (
        db.query(Attendance)
        .filter(
            Attendance.employee_id == payload.employee_id,
            Attendance.date == payload.date,
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=409,
            detail=f"Attendance already marked for {payload.employee_id} on {payload.date}"
        )

    record = Attendance(
        employee_id=payload.employee_id,
        date=payload.date,
        status=payload.status,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.get("/{employee_id}", response_model=List[AttendanceResponse])
def get_attendance(
    employee_id: str,
    start_date: Optional[date] = Query(None, description="Filter from this date"),
    end_date: Optional[date] = Query(None, description="Filter up to this date"),
    db: Session = Depends(get_db),
):
    """
    Get attendance records for a specific employee.
    Optionally filter by date range using start_date and end_date query params.
    """
    # verify employee exists first
    employee = db.query(Employee).filter(Employee.employee_id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    query = db.query(Attendance).filter(Attendance.employee_id == employee_id)

    if start_date:
        query = query.filter(Attendance.date >= start_date)
    if end_date:
        query = query.filter(Attendance.date <= end_date)

    records = query.order_by(Attendance.date.desc()).all()
    return records


@router.get("/{employee_id}/summary", response_model=AttendanceSummary)
def get_attendance_summary(employee_id: str, db: Session = Depends(get_db)):
    """Get aggregated present/absent day counts for a specific employee."""

    employee = db.query(Employee).filter(Employee.employee_id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    records = db.query(Attendance).filter(Attendance.employee_id == employee_id).all()

    present_count = sum(1 for r in records if r.status == "Present")
    absent_count = sum(1 for r in records if r.status == "Absent")

    return AttendanceSummary(
        total_days=len(records),
        present_days=present_count,
        absent_days=absent_count,
    )
