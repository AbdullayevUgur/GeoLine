"""
Carousel slide schemas.
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class CarouselSlideBase(BaseModel):
    """Base carousel slide schema."""
    title: str
    subtitle: Optional[str] = None
    image_path: str
    button_text: Optional[str] = None
    button_link: Optional[str] = None
    order: int = 0
    is_active: bool = True


class CarouselSlideCreate(CarouselSlideBase):
    """Carousel slide creation schema."""
    pass


class CarouselSlideUpdate(BaseModel):
    """Carousel slide update schema."""
    title: Optional[str] = None
    subtitle: Optional[str] = None
    image_path: Optional[str] = None
    button_text: Optional[str] = None
    button_link: Optional[str] = None
    order: Optional[int] = None
    is_active: Optional[bool] = None


class CarouselSlideResponse(CarouselSlideBase):
    """Carousel slide response schema."""
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

