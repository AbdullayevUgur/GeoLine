"""
Blog posts router for CRUD operations.
"""
from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database import get_db
from app.auth import get_current_active_superuser
from app.models.user import User
from app.models.blog import BlogPost
from app.schemas.blog import BlogPostCreate, BlogPostUpdate, BlogPostResponse
from app.utils.file_upload import save_uploaded_file, delete_file

router = APIRouter(prefix="/api/blog", tags=["blog"])


@router.get("", response_model=List[BlogPostResponse])
async def get_blog_posts(
    skip: int = 0,
    limit: int = 100,
    published_only: bool = False,
    db: Session = Depends(get_db)
):
    """Get all blog posts (public endpoint)."""
    query = db.query(BlogPost)
    if published_only:
        query = query.filter(BlogPost.is_published == True)
    query = query.order_by(desc(BlogPost.created_at))
    posts = query.offset(skip).limit(limit).all()
    return posts


@router.get("/{post_id}", response_model=BlogPostResponse)
async def get_blog_post(post_id: int, db: Session = Depends(get_db)):
    """Get a single blog post by ID."""
    post = db.query(BlogPost).filter(BlogPost.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blog post not found"
        )
    return post


@router.post("", response_model=BlogPostResponse, status_code=status.HTTP_201_CREATED)
async def create_blog_post(
    title: str = Form(...),
    excerpt: str = Form(None),
    content: str = Form(None),
    author: str = Form(None),
    category: str = Form(None),
    is_published: bool = Form(False),
    image: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser)
):
    """Create a new blog post (admin only)."""
    image_path = None
    if image:
        image_path = await save_uploaded_file(image, "blog")
    
    published_at = datetime.utcnow() if is_published else None
    
    post = BlogPost(
        title=title,
        excerpt=excerpt,
        content=content,
        image_path=image_path,
        author=author,
        category=category,
        is_published=is_published,
        published_at=published_at
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return post


@router.put("/{post_id}", response_model=BlogPostResponse)
async def update_blog_post(
    post_id: int,
    post_update: BlogPostUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser)
):
    """Update a blog post (admin only)."""
    post = db.query(BlogPost).filter(BlogPost.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blog post not found"
        )
    
    update_data = post_update.dict(exclude_unset=True)
    
    # Set published_at when publishing for the first time
    if update_data.get("is_published") and not post.is_published and not post.published_at:
        update_data["published_at"] = datetime.utcnow()
    
    for field, value in update_data.items():
        setattr(post, field, value)
    
    db.commit()
    db.refresh(post)
    return post


@router.put("/{post_id}/image", response_model=BlogPostResponse)
async def update_blog_post_image(
    post_id: int,
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser)
):
    """Update blog post image (admin only)."""
    post = db.query(BlogPost).filter(BlogPost.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blog post not found"
        )
    
    if post.image_path:
        delete_file(post.image_path)
    
    post.image_path = await save_uploaded_file(image, "blog")
    db.commit()
    db.refresh(post)
    return post


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_blog_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser)
):
    """Delete a blog post (admin only)."""
    post = db.query(BlogPost).filter(BlogPost.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Blog post not found"
        )
    
    if post.image_path:
        delete_file(post.image_path)
    
    db.delete(post)
    db.commit()
    return None

