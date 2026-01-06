"""
Portfolio project schemas.
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.portfolio import ProjectStatus


class PortfolioProjectBase(BaseModel):
    """Base portfolio project schema."""
    title: str
    description: Optional[str] = None
    image_path: str
    status: ProjectStatus = ProjectStatus.FUTURE
    order: int = 0
    is_active: bool = True


class PortfolioProjectCreate(PortfolioProjectBase):
    """Portfolio project creation schema."""
    pass


class PortfolioProjectUpdate(BaseModel):
    """Portfolio project update schema."""
    title: Optional[str] = None
    description: Optional[str] = None
    image_path: Optional[str] = None
    status: Optional[ProjectStatus] = None
    order: Optional[int] = None
    is_active: Optional[bool] = None


class PortfolioProjectResponse(PortfolioProjectBase):
    """Portfolio project response schema."""
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

