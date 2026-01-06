"""
License model for licenses/certifications page.
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.database import Base


class License(Base):
    """License model for licenses/certifications page."""
    
    __tablename__ = "licenses"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    image_path = Column(String(500), nullable=False)
    description = Column(String(500), nullable=True)
    order = Column(Integer, default=0, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

