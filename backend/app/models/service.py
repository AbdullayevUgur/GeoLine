"""
Service model for company services.
"""
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from sqlalchemy.sql import func
from app.database import Base


class Service(Base):
    """Service model for company services page."""
    
    __tablename__ = "services"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    image_path = Column(String(500), nullable=False)
    images = Column(Text, nullable=True)  # JSON array of image paths for carousel
    video_url = Column(String(500), nullable=True)
    order = Column(Integer, default=0, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

