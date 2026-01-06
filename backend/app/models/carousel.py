"""
Carousel slide model for homepage carousel.
"""
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from sqlalchemy.sql import func
from app.database import Base


class CarouselSlide(Base):
    """Carousel slide model for homepage banner."""
    
    __tablename__ = "carousel_slides"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    subtitle = Column(String(200), nullable=True)
    image_path = Column(String(500), nullable=False)
    button_text = Column(String(50), nullable=True)
    button_link = Column(String(500), nullable=True)
    order = Column(Integer, default=0, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

