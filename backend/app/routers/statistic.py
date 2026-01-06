"""
Statistics router for CRUD operations.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import asc
from app.database import get_db
from app.auth import get_current_active_superuser
from app.models.user import User
from app.models.statistic import Statistic
from app.schemas.statistic import StatisticCreate, StatisticUpdate, StatisticResponse

router = APIRouter(prefix="/api/statistics", tags=["statistics"])


@router.get("", response_model=List[StatisticResponse])
async def get_statistics(
    skip: int = 0,
    limit: int = 100,
    active_only: bool = False,
    db: Session = Depends(get_db)
):
    """Get all statistics (public endpoint)."""
    query = db.query(Statistic)
    if active_only:
        query = query.filter(Statistic.is_active == True)
    query = query.order_by(asc(Statistic.order))
    statistics = query.offset(skip).limit(limit).all()
    return statistics


@router.get("/{statistic_id}", response_model=StatisticResponse)
async def get_statistic(statistic_id: int, db: Session = Depends(get_db)):
    """Get a single statistic by ID."""
    statistic = db.query(Statistic).filter(Statistic.id == statistic_id).first()
    if not statistic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Statistic not found"
        )
    return statistic


@router.post("", response_model=StatisticResponse, status_code=status.HTTP_201_CREATED)
async def create_statistic(
    statistic: StatisticCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser)
):
    """Create a new statistic (admin only)."""
    db_statistic = Statistic(**statistic.dict())
    db.add(db_statistic)
    db.commit()
    db.refresh(db_statistic)
    return db_statistic


@router.put("/{statistic_id}", response_model=StatisticResponse)
async def update_statistic(
    statistic_id: int,
    statistic_update: StatisticUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser)
):
    """Update a statistic (admin only)."""
    statistic = db.query(Statistic).filter(Statistic.id == statistic_id).first()
    if not statistic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Statistic not found"
        )
    
    update_data = statistic_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(statistic, field, value)
    
    db.commit()
    db.refresh(statistic)
    return statistic


@router.delete("/{statistic_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_statistic(
    statistic_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser)
):
    """Delete a statistic (admin only)."""
    statistic = db.query(Statistic).filter(Statistic.id == statistic_id).first()
    if not statistic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Statistic not found"
        )
    
    db.delete(statistic)
    db.commit()
    return None

