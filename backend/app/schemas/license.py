"""
License schemas.
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class LicenseBase(BaseModel):
    """Base license schema."""
    title: str
    image_path: str
    description: Optional[str] = None
    order: int = 0
    is_active: bool = True


class LicenseCreate(LicenseBase):
    """License creation schema."""
    pass


class LicenseUpdate(BaseModel):
    """License update schema."""
    title: Optional[str] = None
    image_path: Optional[str] = None
    description: Optional[str] = None
    order: Optional[int] = None
    is_active: Optional[bool] = None


class LicenseResponse(LicenseBase):
    """License response schema."""
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

