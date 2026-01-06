"""
Partner schemas.
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class PartnerBase(BaseModel):
    """Base partner schema."""
    name: str
    image_path: str
    website_url: Optional[str] = None
    order: int = 0
    is_active: bool = True


class PartnerCreate(PartnerBase):
    """Partner creation schema."""
    pass


class PartnerUpdate(BaseModel):
    """Partner update schema."""
    name: Optional[str] = None
    image_path: Optional[str] = None
    website_url: Optional[str] = None
    order: Optional[int] = None
    is_active: Optional[bool] = None


class PartnerResponse(PartnerBase):
    """Partner response schema."""
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

