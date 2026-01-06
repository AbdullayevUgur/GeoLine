"""
Service schemas.
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ServiceBase(BaseModel):
    """Base service schema."""
    title: str
    description: Optional[str] = None
    image_path: str
    images: Optional[str] = None  # JSON array of image paths for carousel
    video_url: Optional[str] = None
    order: int = 0
    is_active: bool = True


class ServiceCreate(ServiceBase):
    """Service creation schema."""
    pass


class ServiceUpdate(BaseModel):
    """Service update schema."""
    title: Optional[str] = None
    description: Optional[str] = None
    image_path: Optional[str] = None
    images: Optional[str] = None  # JSON array of image paths for carousel
    video_url: Optional[str] = None
    order: Optional[int] = None
    is_active: Optional[bool] = None


class ServiceResponse(ServiceBase):
    """Service response schema."""
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

