"""
Partner model for partners section.
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.database import Base


class Partner(Base):
    """Partner model for partners section."""
    
    __tablename__ = "partners"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    image_path = Column(String(500), nullable=False)
    website_url = Column(String(500), nullable=True)
    order = Column(Integer, default=0, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

