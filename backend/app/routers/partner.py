"""
Partners router for CRUD operations.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import asc
from app.database import get_db
from app.auth import get_current_active_superuser
from app.models.user import User
from app.models.partner import Partner
from app.schemas.partner import PartnerCreate, PartnerUpdate, PartnerResponse
from app.utils.file_upload import save_uploaded_file, delete_file

router = APIRouter(prefix="/api/partners", tags=["partners"])


@router.get("", response_model=List[PartnerResponse])
async def get_partners(
    skip: int = 0,
    limit: int = 100,
    active_only: bool = False,
    db: Session = Depends(get_db)
):
    """Get all partners (public endpoint)."""
    query = db.query(Partner)
    if active_only:
        query = query.filter(Partner.is_active == True)
    query = query.order_by(asc(Partner.order))
    partners = query.offset(skip).limit(limit).all()
    return partners


@router.get("/{partner_id}", response_model=PartnerResponse)
async def get_partner(partner_id: int, db: Session = Depends(get_db)):
    """Get a single partner by ID."""
    partner = db.query(Partner).filter(Partner.id == partner_id).first()
    if not partner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Partner not found"
        )
    return partner


@router.post("", response_model=PartnerResponse, status_code=status.HTTP_201_CREATED)
async def create_partner(
    name: str = Form(...),
    website_url: str = Form(None),
    order: int = Form(0),
    is_active: bool = Form(True),
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser)
):
    """Create a new partner (admin only)."""
    image_path = await save_uploaded_file(image, "partners")
    
    partner = Partner(
        name=name,
        image_path=image_path,
        website_url=website_url,
        order=order,
        is_active=is_active
    )
    db.add(partner)
    db.commit()
    db.refresh(partner)
    return partner


@router.put("/{partner_id}", response_model=PartnerResponse)
async def update_partner(
    partner_id: int,
    partner_update: PartnerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser)
):
    """Update a partner (admin only)."""
    partner = db.query(Partner).filter(Partner.id == partner_id).first()
    if not partner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Partner not found"
        )
    
    update_data = partner_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(partner, field, value)
    
    db.commit()
    db.refresh(partner)
    return partner


@router.put("/{partner_id}/image", response_model=PartnerResponse)
async def update_partner_image(
    partner_id: int,
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser)
):
    """Update partner image (admin only)."""
    partner = db.query(Partner).filter(Partner.id == partner_id).first()
    if not partner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Partner not found"
        )
    
    if partner.image_path:
        delete_file(partner.image_path)
    
    partner.image_path = await save_uploaded_file(image, "partners")
    db.commit()
    db.refresh(partner)
    return partner


@router.delete("/{partner_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_partner(
    partner_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser)
):
    """Delete a partner (admin only)."""
    partner = db.query(Partner).filter(Partner.id == partner_id).first()
    if not partner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Partner not found"
        )
    
    if partner.image_path:
        delete_file(partner.image_path)
    
    db.delete(partner)
    db.commit()
    return None

