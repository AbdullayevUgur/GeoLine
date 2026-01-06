"""
FAQ schemas.
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class FAQBase(BaseModel):
    """Base FAQ schema."""
    question: str
    answer: str
    order: int = 0
    is_active: bool = True


class FAQCreate(FAQBase):
    """FAQ creation schema."""
    pass


class FAQUpdate(BaseModel):
    """FAQ update schema."""
    question: Optional[str] = None
    answer: Optional[str] = None
    order: Optional[int] = None
    is_active: Optional[bool] = None


class FAQResponse(FAQBase):
    """FAQ response schema."""
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

