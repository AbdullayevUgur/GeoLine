"""
Contact router for contact info and form submissions.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import asc
from app.database import get_db
from app.auth import get_current_active_superuser
from app.models.user import User
from app.models.contact import ContactInfo, ContactSubmission
from app.schemas.contact import (
    ContactInfoCreate, ContactInfoUpdate, ContactInfoResponse,
    ContactSubmissionCreate, ContactSubmissionResponse
)

router = APIRouter(prefix="/api/contact", tags=["contact"])


# Contact Info Endpoints
@router.get("/info", response_model=List[ContactInfoResponse])
async def get_contact_info(
    active_only: bool = False,
    db: Session = Depends(get_db)
):
    """Get contact information (public endpoint)."""
    query = db.query(ContactInfo)
    if active_only:
        query = query.filter(ContactInfo.is_active == True)
    query = query.order_by(asc(ContactInfo.order))
    info = query.all()
    return info


@router.get("/info/{info_id}", response_model=ContactInfoResponse)
async def get_contact_info_by_id(info_id: int, db: Session = Depends(get_db)):
    """Get a single contact info by ID."""
    info = db.query(ContactInfo).filter(ContactInfo.id == info_id).first()
    if not info:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact info not found"
        )
    return info


@router.post("/info", response_model=ContactInfoResponse, status_code=status.HTTP_201_CREATED)
async def create_contact_info(
    info: ContactInfoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser)
):
    """Create contact info (admin only)."""
    db_info = ContactInfo(**info.dict())
    db.add(db_info)
    db.commit()
    db.refresh(db_info)
    return db_info


@router.put("/info/{info_id}", response_model=ContactInfoResponse)
async def update_contact_info(
    info_id: int,
    info_update: ContactInfoUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser)
):
    """Update contact info (admin only)."""
    info = db.query(ContactInfo).filter(ContactInfo.id == info_id).first()
    if not info:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact info not found"
        )
    
    update_data = info_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(info, field, value)
    
    db.commit()
    db.refresh(info)
    return info


@router.delete("/info/{info_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_contact_info(
    info_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser)
):
    """Delete contact info (admin only)."""
    info = db.query(ContactInfo).filter(ContactInfo.id == info_id).first()
    if not info:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact info not found"
        )
    
    db.delete(info)
    db.commit()
    return None


# Contact Form Submission Endpoints
@router.post("/submit", response_model=ContactSubmissionResponse, status_code=status.HTTP_201_CREATED)
async def submit_contact_form(
    submission: ContactSubmissionCreate,
    db: Session = Depends(get_db)
):
    """Submit contact form (public endpoint)."""
    db_submission = ContactSubmission(**submission.dict())
    db.add(db_submission)
    db.commit()
    db.refresh(db_submission)
    return db_submission


@router.get("/submissions", response_model=List[ContactSubmissionResponse])
async def get_contact_submissions(
    skip: int = 0,
    limit: int = 100,
    unread_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser)
):
    """Get all contact form submissions (admin only)."""
    query = db.query(ContactSubmission)
    if unread_only:
        query = query.filter(ContactSubmission.is_read == False)
    query = query.order_by(ContactSubmission.created_at.desc())
    submissions = query.offset(skip).limit(limit).all()
    return submissions


@router.get("/submissions/{submission_id}", response_model=ContactSubmissionResponse)
async def get_contact_submission(
    submission_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser)
):
    """Get a single contact submission by ID (admin only)."""
    submission = db.query(ContactSubmission).filter(ContactSubmission.id == submission_id).first()
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact submission not found"
        )
    return submission


@router.put("/submissions/{submission_id}/read", response_model=ContactSubmissionResponse)
async def mark_submission_as_read(
    submission_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser)
):
    """Mark a contact submission as read (admin only)."""
    submission = db.query(ContactSubmission).filter(ContactSubmission.id == submission_id).first()
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact submission not found"
        )
    
    submission.is_read = True
    db.commit()
    db.refresh(submission)
    return submission


@router.delete("/submissions/{submission_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_contact_submission(
    submission_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser)
):
    """Delete a contact submission (admin only)."""
    submission = db.query(ContactSubmission).filter(ContactSubmission.id == submission_id).first()
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact submission not found"
        )
    
    db.delete(submission)
    db.commit()
    return None

