"""
FAQ router for CRUD operations.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import asc
from app.database import get_db
from app.auth import get_current_active_superuser
from app.models.user import User
from app.models.faq import FAQ
from app.schemas.faq import FAQCreate, FAQUpdate, FAQResponse

router = APIRouter(prefix="/api/faqs", tags=["faqs"])


@router.get("", response_model=List[FAQResponse])
async def get_faqs(
    skip: int = 0,
    limit: int = 100,
    active_only: bool = False,
    db: Session = Depends(get_db)
):
    """Get all FAQs (public endpoint)."""
    query = db.query(FAQ)
    if active_only:
        query = query.filter(FAQ.is_active == True)
    query = query.order_by(asc(FAQ.order))
    faqs = query.offset(skip).limit(limit).all()
    return faqs


@router.get("/{faq_id}", response_model=FAQResponse)
async def get_faq(faq_id: int, db: Session = Depends(get_db)):
    """Get a single FAQ by ID."""
    faq = db.query(FAQ).filter(FAQ.id == faq_id).first()
    if not faq:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="FAQ not found"
        )
    return faq


@router.post("", response_model=FAQResponse, status_code=status.HTTP_201_CREATED)
async def create_faq(
    faq: FAQCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser)
):
    """Create a new FAQ (admin only)."""
    db_faq = FAQ(**faq.dict())
    db.add(db_faq)
    db.commit()
    db.refresh(db_faq)
    return db_faq


@router.put("/{faq_id}", response_model=FAQResponse)
async def update_faq(
    faq_id: int,
    faq_update: FAQUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser)
):
    """Update a FAQ (admin only)."""
    faq = db.query(FAQ).filter(FAQ.id == faq_id).first()
    if not faq:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="FAQ not found"
        )
    
    update_data = faq_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(faq, field, value)
    
    db.commit()
    db.refresh(faq)
    return faq


@router.delete("/{faq_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_faq(
    faq_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser)
):
    """Delete a FAQ (admin only)."""
    faq = db.query(FAQ).filter(FAQ.id == faq_id).first()
    if not faq:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="FAQ not found"
        )
    
    db.delete(faq)
    db.commit()
    return None

