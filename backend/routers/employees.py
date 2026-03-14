from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import Employee
from schemas import EmployeeCreate, EmployeeResponse

router = APIRouter(prefix="/api/employees", tags=["Employees"])


@router.post("/", response_model=EmployeeResponse, status_code=201)
def create_employee(payload: EmployeeCreate, db: Session = Depends(get_db)):
    """Add a new employee to the system."""

    # check if employee_id already exists
    existing = db.query(Employee).filter(Employee.employee_id == payload.employee_id).first()
    if existing:
        raise HTTPException(
            status_code=409,
            detail=f"Employee with ID '{payload.employee_id}' already exists"
        )

    # check if email is already taken
    existing_email = db.query(Employee).filter(Employee.email == payload.email).first()
    if existing_email:
        raise HTTPException(
            status_code=409,
            detail=f"An employee with email '{payload.email}' already exists"
        )

    employee = Employee(
        employee_id=payload.employee_id,
        full_name=payload.full_name,
        email=payload.email,
        department=payload.department,
    )
    db.add(employee)
    db.commit()
    db.refresh(employee)
    return employee


@router.get("/", response_model=List[EmployeeResponse])
def list_employees(db: Session = Depends(get_db)):
    """Fetch all employees, ordered by creation date (newest first)."""
    employees = db.query(Employee).order_by(Employee.created_at.desc()).all()
    return employees


@router.get("/{employee_id}", response_model=EmployeeResponse)
def get_employee(employee_id: str, db: Session = Depends(get_db)):
    """Get details of a specific employee by their employee ID."""
    employee = db.query(Employee).filter(Employee.employee_id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee


@router.delete("/{employee_id}", status_code=200)
def delete_employee(employee_id: str, db: Session = Depends(get_db)):
    """Remove an employee and their associated attendance records."""
    employee = db.query(Employee).filter(Employee.employee_id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    db.delete(employee)
    db.commit()
    return {"message": f"Employee '{employee_id}' has been deleted"}
