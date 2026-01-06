"""
Blog post schemas.
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class BlogPostBase(BaseModel):
    """Base blog post schema."""
    title: str
    excerpt: Optional[str] = None
    content: Optional[str] = None
    image_path: Optional[str] = None
    author: Optional[str] = None
    category: Optional[str] = None
    is_published: bool = False


class BlogPostCreate(BlogPostBase):
    """Blog post creation schema."""
    pass


class BlogPostUpdate(BaseModel):
    """Blog post update schema."""
    title: Optional[str] = None
    excerpt: Optional[str] = None
    content: Optional[str] = None
    image_path: Optional[str] = None
    author: Optional[str] = None
    category: Optional[str] = None
    is_published: Optional[bool] = None
    published_at: Optional[datetime] = None


class BlogPostResponse(BlogPostBase):
    """Blog post response schema."""
    id: int
    published_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

