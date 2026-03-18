from pydantic import BaseModel, EmailStr, field_validator
from datetime import date, datetime
from typing import Optional


# -- Employee Schemas --

class EmployeeCreate(BaseModel):
    employee_id: str
    full_name: str
    email: EmailStr
    department: str

    @field_validator("employee_id", "full_name", "department")
    @classmethod
    def must_not_be_blank(cls, value, info):
        if not value or not value.strip():
            raise ValueError(f"{info.field_name} cannot be empty")
        return value.strip()

    @field_validator("employee_id")
    @classmethod
    def validate_employee_id_format(cls, value):
        # basic sanity check - employee IDs shouldn't be too long or have weird chars
        cleaned = value.strip()
        if len(cleaned) > 50:
            raise ValueError("Employee ID is too long (max 50 characters)")
        return cleaned


class EmployeeUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    department: Optional[str] = None

    @field_validator("full_name", "department")
    @classmethod
    def must_not_be_blank_if_provided(cls, value, info):
        if value is not None and (not value or not value.strip()):
            raise ValueError(f"{info.field_name} cannot be empty")
        return value.strip() if value else value


class EmployeeResponse(BaseModel):
    id: int
    employee_id: str
    full_name: str
    email: str
    department: str
    created_at: datetime

    class Config:
        from_attributes = True


# -- Attendance Schemas --

class AttendanceCreate(BaseModel):
    employee_id: str
    date: date
    status: str

    @field_validator("status")
    @classmethod
    def validate_status(cls, value):
        allowed = ["Present", "Absent"]
        if value not in allowed:
            raise ValueError(f"Status must be one of: {', '.join(allowed)}")
        return value

    @field_validator("employee_id")
    @classmethod
    def must_not_be_blank(cls, value):
        if not value or not value.strip():
            raise ValueError("employee_id cannot be empty")
        return value.strip()


class AttendanceResponse(BaseModel):
    id: int
    employee_id: str
    date: date
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


# -- Dashboard / Summary Schemas --

class AttendanceSummary(BaseModel):
    total_days: int
    present_days: int
    absent_days: int


class DashboardStats(BaseModel):
    total_employees: int
    present_today: int
    absent_today: int
    not_marked_today: int
