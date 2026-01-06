"""
Portfolio project model for projects showcase.
"""
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Enum
from sqlalchemy.sql import func
import enum
from app.database import Base


class ProjectStatus(str, enum.Enum):
    """Project status enumeration."""
    COMPLETED = "completed"
    IN_PROGRESS = "in_progress"
    FUTURE = "future"


class PortfolioProject(Base):
    """Portfolio project model for projects page."""
    
    __tablename__ = "portfolio_projects"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    image_path = Column(String(500), nullable=False)
    status = Column(Enum(ProjectStatus), nullable=False, default=ProjectStatus.FUTURE)
    order = Column(Integer, default=0, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

