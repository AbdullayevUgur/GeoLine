"""
Carousel slides router for CRUD operations.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import asc
from app.database import get_db
from app.auth import get_current_active_superuser
from app.models.user import User
from app.models.carousel import CarouselSlide
from app.schemas.carousel import CarouselSlideCreate, CarouselSlideUpdate, CarouselSlideResponse
from app.utils.file_upload import save_uploaded_file, delete_file

router = APIRouter(prefix="/api/carousel", tags=["carousel"])


@router.get("", response_model=List[CarouselSlideResponse])
async def get_carousel_slides(
    skip: int = 0,
    limit: int = 100,
    active_only: bool = False,
    db: Session = Depends(get_db)
):
    """Get all carousel slides (public endpoint)."""
    query = db.query(CarouselSlide)
    if active_only:
        query = query.filter(CarouselSlide.is_active == True)
    query = query.order_by(asc(CarouselSlide.order))
    slides = query.offset(skip).limit(limit).all()
    return slides


@router.get("/{slide_id}", response_model=CarouselSlideResponse)
async def get_carousel_slide(slide_id: int, db: Session = Depends(get_db)):
    """Get a single carousel slide by ID."""
    slide = db.query(CarouselSlide).filter(CarouselSlide.id == slide_id).first()
    if not slide:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Carousel slide not found"
        )
    return slide


@router.post("", response_model=CarouselSlideResponse, status_code=status.HTTP_201_CREATED)
async def create_carousel_slide(
    title: str = Form(...),
    subtitle: str = Form(None),
    button_text: str = Form(None),
    button_link: str = Form(None),
    order: int = Form(0),
    is_active: bool = Form(True),
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser)
):
    """Create a new carousel slide (admin only)."""
    # Save uploaded image
    image_path = await save_uploaded_file(image, "carousel")
    
    slide = CarouselSlide(
        title=title,
        subtitle=subtitle,
        image_path=image_path,
        button_text=button_text,
        button_link=button_link,
        order=order,
        is_active=is_active
    )
    db.add(slide)
    db.commit()
    db.refresh(slide)
    return slide


@router.put("/{slide_id}", response_model=CarouselSlideResponse)
async def update_carousel_slide(
    slide_id: int,
    slide_update: CarouselSlideUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser)
):
    """Update a carousel slide (admin only)."""
    slide = db.query(CarouselSlide).filter(CarouselSlide.id == slide_id).first()
    if not slide:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Carousel slide not found"
        )
    
    update_data = slide_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(slide, field, value)
    
    db.commit()
    db.refresh(slide)
    return slide


@router.put("/{slide_id}/image", response_model=CarouselSlideResponse)
async def update_carousel_slide_image(
    slide_id: int,
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser)
):
    """Update carousel slide image (admin only)."""
    slide = db.query(CarouselSlide).filter(CarouselSlide.id == slide_id).first()
    if not slide:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Carousel slide not found"
        )
    
    # Delete old image
    if slide.image_path:
        delete_file(slide.image_path)
    
    # Save new image
    slide.image_path = await save_uploaded_file(image, "carousel")
    db.commit()
    db.refresh(slide)
    return slide


@router.delete("/{slide_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_carousel_slide(
    slide_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser)
):
    """Delete a carousel slide (admin only)."""
    slide = db.query(CarouselSlide).filter(CarouselSlide.id == slide_id).first()
    if not slide:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Carousel slide not found"
        )
    
    # Delete associated image
    if slide.image_path:
        delete_file(slide.image_path)
    
    db.delete(slide)
    db.commit()
    return None

