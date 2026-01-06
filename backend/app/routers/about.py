"""
About content router for CRUD operations.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import get_current_active_superuser
from app.models.user import User
from app.models.about import AboutContent
from app.schemas.about import AboutContentCreate, AboutContentUpdate, AboutContentResponse
from app.utils.file_upload import save_uploaded_file, delete_file

router = APIRouter(prefix="/api/about", tags=["about"])


@router.get("", response_model=List[AboutContentResponse])
async def get_about_content(
    active_only: bool = False,
    db: Session = Depends(get_db)
):
    """Get about content (public endpoint)."""
    query = db.query(AboutContent)
    if active_only:
        query = query.filter(AboutContent.is_active == True)
    content = query.first()
    return [content] if content else []


@router.get("/{content_id}", response_model=AboutContentResponse)
async def get_about_content_by_id(content_id: int, db: Session = Depends(get_db)):
    """Get a single about content by ID."""
    content = db.query(AboutContent).filter(AboutContent.id == content_id).first()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="About content not found"
        )
    return content


@router.post("", response_model=AboutContentResponse, status_code=status.HTTP_201_CREATED)
async def create_about_content(
    title: str = Form(...),
    subtitle: str = Form(None),
    description: str = Form(None),
    is_active: bool = Form(True),
    image: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser)
):
    """Create about content (admin only)."""
    image_path = None
    if image:
        image_path = await save_uploaded_file(image, "about")
    
    content = AboutContent(
        title=title,
        subtitle=subtitle,
        description=description,
        image_path=image_path,
        is_active=is_active
    )
    db.add(content)
    db.commit()
    db.refresh(content)
    return content


@router.put("/{content_id}", response_model=AboutContentResponse)
async def update_about_content(
    content_id: int,
    content_update: AboutContentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser)
):
    """Update about content (admin only)."""
    content = db.query(AboutContent).filter(AboutContent.id == content_id).first()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="About content not found"
        )
    
    update_data = content_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(content, field, value)
    
    db.commit()
    db.refresh(content)
    return content


@router.put("/{content_id}/image", response_model=AboutContentResponse)
async def update_about_content_image(
    content_id: int,
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser)
):
    """Update about content image (admin only)."""
    content = db.query(AboutContent).filter(AboutContent.id == content_id).first()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="About content not found"
        )
    
    if content.image_path:
        delete_file(content.image_path)
    
    content.image_path = await save_uploaded_file(image, "about")
    db.commit()
    db.refresh(content)
    return content


@router.delete("/{content_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_about_content(
    content_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser)
):
    """Delete about content (admin only)."""
    content = db.query(AboutContent).filter(AboutContent.id == content_id).first()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="About content not found"
        )
    
    if content.image_path:
        delete_file(content.image_path)
    
    db.delete(content)
    db.commit()
    return None

