"""
Contact models for contact information and submissions.
"""
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from sqlalchemy.sql import func
from app.database import Base


class ContactInfo(Base):
    """Contact information model for top bar and footer."""
    
    __tablename__ = "contact_info"
    
    id = Column(Integer, primary_key=True, index=True)
    type = Column(String(50), nullable=False)  # 'phone', 'email', 'address', 'hours', 'whatsapp'
    label = Column(String(100), nullable=False)
    value = Column(String(500), nullable=False)
    icon = Column(String(100), nullable=True)
    order = Column(Integer, default=0, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class ContactSubmission(Base):
    """Contact form submission model."""
    
    __tablename__ = "contact_submissions"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False)
    subject = Column(String(200), nullable=True)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

