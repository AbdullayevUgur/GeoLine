"""
Blog post model for news/blog section.
"""
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime
from sqlalchemy.sql import func
from app.database import Base


class BlogPost(Base):
    """Blog post model for blog/news section."""
    
    __tablename__ = "blog_posts"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    excerpt = Column(Text, nullable=True)
    content = Column(Text, nullable=True)
    image_path = Column(String(500), nullable=True)
    author = Column(String(100), nullable=True)
    category = Column(String(100), nullable=True)
    is_published = Column(Boolean, default=False)
    published_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

