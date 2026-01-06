"""
About content schemas.
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class AboutContentBase(BaseModel):
    """Base about content schema."""
    title: str
    subtitle: Optional[str] = None
    description: Optional[str] = None
    image_path: Optional[str] = None
    is_active: bool = True


class AboutContentCreate(AboutContentBase):
    """About content creation schema."""
    pass


class AboutContentUpdate(BaseModel):
    """About content update schema."""
    title: Optional[str] = None
    subtitle: Optional[str] = None
    description: Optional[str] = None
    image_path: Optional[str] = None
    is_active: Optional[bool] = None


class AboutContentResponse(AboutContentBase):
    """About content response schema."""
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

