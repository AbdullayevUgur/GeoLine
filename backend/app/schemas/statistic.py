"""
Statistic schemas.
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class StatisticBase(BaseModel):
    """Base statistic schema."""
    label: str
    value: int
    icon: Optional[str] = None
    order: int = 0
    is_active: bool = True


class StatisticCreate(StatisticBase):
    """Statistic creation schema."""
    pass


class StatisticUpdate(BaseModel):
    """Statistic update schema."""
    label: Optional[str] = None
    value: Optional[int] = None
    icon: Optional[str] = None
    order: Optional[int] = None
    is_active: Optional[bool] = None


class StatisticResponse(StatisticBase):
    """Statistic response schema."""
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

