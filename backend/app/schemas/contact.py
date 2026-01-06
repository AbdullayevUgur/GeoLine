"""
Contact schemas.
"""
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class ContactInfoBase(BaseModel):
    """Base contact info schema."""
    type: str  # 'phone', 'email', 'address', 'hours', 'whatsapp'
    label: str
    value: str
    icon: Optional[str] = None
    order: int = 0
    is_active: bool = True


class ContactInfoCreate(ContactInfoBase):
    """Contact info creation schema."""
    pass


class ContactInfoUpdate(BaseModel):
    """Contact info update schema."""
    type: Optional[str] = None
    label: Optional[str] = None
    value: Optional[str] = None
    icon: Optional[str] = None
    order: Optional[int] = None
    is_active: Optional[bool] = None


class ContactInfoResponse(ContactInfoBase):
    """Contact info response schema."""
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ContactSubmissionCreate(BaseModel):
    """Contact form submission creation schema."""
    name: str
    email: EmailStr
    subject: Optional[str] = None
    message: str


class ContactSubmissionResponse(BaseModel):
    """Contact submission response schema."""
    id: int
    name: str
    email: str
    subject: Optional[str] = None
    message: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

