"""
Licenses router for CRUD operations.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import asc
from app.database import get_db
from app.auth import get_current_active_superuser
from app.models.user import User
from app.models.license import License
from app.schemas.license import LicenseCreate, LicenseUpdate, LicenseResponse
from app.utils.file_upload import save_uploaded_file, delete_file

router = APIRouter(prefix="/api/licenses", tags=["licenses"])


@router.get("", response_model=List[LicenseResponse])
async def get_licenses(
    skip: int = 0,
    limit: int = 100,
    active_only: bool = False,
    db: Session = Depends(get_db)
):
    """Get all licenses (public endpoint)."""
    query = db.query(License)
    if active_only:
        query = query.filter(License.is_active == True)
    query = query.order_by(asc(License.order))
    licenses = query.offset(skip).limit(limit).all()
    return licenses


@router.get("/{license_id}", response_model=LicenseResponse)
async def get_license(license_id: int, db: Session = Depends(get_db)):
    """Get a single license by ID."""
    license = db.query(License).filter(License.id == license_id).first()
    if not license:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="License not found"
        )
    return license


@router.post("", response_model=LicenseResponse, status_code=status.HTTP_201_CREATED)
async def create_license(
    title: str = Form(...),
    description: str = Form(None),
    order: int = Form(0),
    is_active: bool = Form(True),
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser)
):
    """Create a new license (admin only)."""
    image_path = await save_uploaded_file(image, "licenses")
    
    license = License(
        title=title,
        image_path=image_path,
        description=description,
        order=order,
        is_active=is_active
    )
    db.add(license)
    db.commit()
    db.refresh(license)
    return license


@router.put("/{license_id}", response_model=LicenseResponse)
async def update_license(
    license_id: int,
    license_update: LicenseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser)
):
    """Update a license (admin only)."""
    license = db.query(License).filter(License.id == license_id).first()
    if not license:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="License not found"
        )
    
    update_data = license_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(license, field, value)
    
    db.commit()
    db.refresh(license)
    return license


@router.put("/{license_id}/image", response_model=LicenseResponse)
async def update_license_image(
    license_id: int,
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser)
):
    """Update license image (admin only)."""
    license = db.query(License).filter(License.id == license_id).first()
    if not license:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="License not found"
        )
    
    if license.image_path:
        delete_file(license.image_path)
    
    license.image_path = await save_uploaded_file(image, "licenses")
    db.commit()
    db.refresh(license)
    return license


@router.delete("/{license_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_license(
    license_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser)
):
    """Delete a license (admin only)."""
    license = db.query(License).filter(License.id == license_id).first()
    if not license:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="License not found"
        )
    
    if license.image_path:
        delete_file(license.image_path)
    
    db.delete(license)
    db.commit()
    return None

