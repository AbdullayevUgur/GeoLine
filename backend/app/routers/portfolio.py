"""
Portfolio projects router for CRUD operations.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import asc
from app.database import get_db
from app.auth import get_current_active_superuser
from app.models.user import User
from app.models.portfolio import PortfolioProject, ProjectStatus
from app.schemas.portfolio import PortfolioProjectCreate, PortfolioProjectUpdate, PortfolioProjectResponse
from app.utils.file_upload import save_uploaded_file, delete_file

router = APIRouter(prefix="/api/portfolio", tags=["portfolio"])


@router.get("", response_model=List[PortfolioProjectResponse])
async def get_portfolio_projects(
    skip: int = 0,
    limit: int = 100,
    active_only: bool = False,
    status_filter: ProjectStatus = None,
    db: Session = Depends(get_db)
):
    """Get all portfolio projects (public endpoint)."""
    query = db.query(PortfolioProject)
    if active_only:
        query = query.filter(PortfolioProject.is_active == True)
    if status_filter:
        query = query.filter(PortfolioProject.status == status_filter)
    query = query.order_by(asc(PortfolioProject.order))
    projects = query.offset(skip).limit(limit).all()
    return projects


@router.get("/{project_id}", response_model=PortfolioProjectResponse)
async def get_portfolio_project(project_id: int, db: Session = Depends(get_db)):
    """Get a single portfolio project by ID."""
    project = db.query(PortfolioProject).filter(PortfolioProject.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio project not found"
        )
    return project


@router.post("", response_model=PortfolioProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_portfolio_project(
    title: str = Form(...),
    description: str = Form(None),
    status: ProjectStatus = Form(ProjectStatus.FUTURE),
    order: int = Form(0),
    is_active: bool = Form(True),
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser)
):
    """Create a new portfolio project (admin only)."""
    image_path = await save_uploaded_file(image, "portfolio")
    
    project = PortfolioProject(
        title=title,
        description=description,
        image_path=image_path,
        status=status,
        order=order,
        is_active=is_active
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@router.put("/{project_id}", response_model=PortfolioProjectResponse)
async def update_portfolio_project(
    project_id: int,
    project_update: PortfolioProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser)
):
    """Update a portfolio project (admin only)."""
    project = db.query(PortfolioProject).filter(PortfolioProject.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio project not found"
        )
    
    update_data = project_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(project, field, value)
    
    db.commit()
    db.refresh(project)
    return project


@router.put("/{project_id}/image", response_model=PortfolioProjectResponse)
async def update_portfolio_project_image(
    project_id: int,
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser)
):
    """Update portfolio project image (admin only)."""
    project = db.query(PortfolioProject).filter(PortfolioProject.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio project not found"
        )
    
    if project.image_path:
        delete_file(project.image_path)
    
    project.image_path = await save_uploaded_file(image, "portfolio")
    db.commit()
    db.refresh(project)
    return project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_portfolio_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser)
):
    """Delete a portfolio project (admin only)."""
    project = db.query(PortfolioProject).filter(PortfolioProject.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Portfolio project not found"
        )
    
    if project.image_path:
        delete_file(project.image_path)
    
    db.delete(project)
    db.commit()
    return None

