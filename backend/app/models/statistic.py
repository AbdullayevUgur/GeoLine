"""
Statistic model for homepage statistics/facts section.
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.database import Base


class Statistic(Base):
    """Statistic model for homepage facts/statistics section."""
    
    __tablename__ = "statistics"
    
    id = Column(Integer, primary_key=True, index=True)
    label = Column(String(200), nullable=False)
    value = Column(Integer, nullable=False)
    icon = Column(String(100), nullable=True)
    order = Column(Integer, default=0, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

