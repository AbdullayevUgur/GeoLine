"""
Services router for CRUD operations.
"""
import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import asc
from app.database import get_db
from app.auth import get_current_active_superuser
from app.models.user import User
from app.models.service import Service
from app.schemas.service import ServiceCreate, ServiceUpdate, ServiceResponse
from app.utils.file_upload import save_uploaded_file, save_uploaded_video, extract_video_thumbnail, delete_file

router = APIRouter(prefix="/api/services", tags=["services"])


@router.get("", response_model=List[ServiceResponse])
async def get_services(
    skip: int = 0,
    limit: int = 100,
    active_only: bool = False,
    db: Session = Depends(get_db)
):
    """Get all services (public endpoint)."""
    query = db.query(Service)
    if active_only:
        query = query.filter(Service.is_active == True)
    query = query.order_by(asc(Service.order))
    services = query.offset(skip).limit(limit).all()
    return services


@router.get("/{service_id}", response_model=ServiceResponse)
async def get_service(service_id: int, db: Session = Depends(get_db)):
    """Get a single service by ID."""
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )
    return service


@router.post("", response_model=ServiceResponse, status_code=status.HTTP_201_CREATED)
async def create_service(
    title: str = Form(...),
    description: str = Form(None),
    video_url: str = Form(None),
    order: int = Form(0),
    is_active: bool = Form(True),
    image: UploadFile = File(None),
    images_json: str = Form(None),  # JSON string of image paths
    video_file: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser)
):
    """Create a new service (admin only)."""
    # Handle video first: either uploaded file or URL
    video_url_value = None
    if video_file and video_file.filename:
        # Upload video file
        video_url_value = await save_uploaded_video(video_file, "services/videos")
    elif video_url and video_url.strip():
        # Use provided URL (YouTube/Vimeo embed URL)
        video_url_value = video_url.strip()
    
    # Handle images: support multiple images
    images_value = None
    image_path = None
    
    # If images_json is provided, use it (from admin panel - already uploaded images)
    if images_json and images_json.strip():
        try:
            # Validate JSON format
            parsed = json.loads(images_json)
            if isinstance(parsed, list) and len(parsed) > 0:
                images_value = images_json
                # Use first image as main image_path
                image_path = parsed[0] if isinstance(parsed[0], str) else parsed[0].get('path', '')
        except json.JSONDecodeError:
            pass
    
    # If single image is uploaded, use it (and add to images array)
    if image and image.filename:
        uploaded_path = await save_uploaded_file(image, "services")
        if not image_path:
            image_path = uploaded_path
        # If images_json exists, add this image; otherwise create new array
        if images_value:
            try:
                parsed = json.loads(images_value)
                if uploaded_path not in parsed:
                    parsed.insert(0, uploaded_path)  # Add as first image
                images_value = json.dumps(parsed)
            except:
                images_value = json.dumps([uploaded_path])
        else:
            images_value = json.dumps([uploaded_path])
    
    # If no images provided, try to extract from video or use placeholder
    if not image_path:
        if video_url_value and not video_url_value.startswith(('http://', 'https://')):
            # Extract thumbnail from uploaded video file
            try:
                image_path = await extract_video_thumbnail(video_url_value, "services")
                if not images_value:
                    images_value = json.dumps([image_path])
            except Exception as e:
                # If thumbnail extraction fails, use default placeholder
                image_path = "services/default-placeholder.jpg"
        else:
            # Use default placeholder image
            image_path = "services/default-placeholder.jpg"
    
    service = Service(
        title=title,
        description=description,
        image_path=image_path,
        images=images_value,
        video_url=video_url_value,
        order=order,
        is_active=is_active
    )
    db.add(service)
    db.commit()
    db.refresh(service)
    return service


@router.put("/{service_id}", response_model=ServiceResponse)
async def update_service(
    service_id: int,
    service_update: ServiceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser)
):
    """Update a service (admin only)."""
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )
    
    update_data = service_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(service, field, value)
    
    db.commit()
    db.refresh(service)
    return service


@router.put("/{service_id}/image", response_model=ServiceResponse)
async def update_service_image(
    service_id: int,
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser)
):
    """Update service image (admin only)."""
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )
    
    if service.image_path:
        delete_file(service.image_path)
    
    service.image_path = await save_uploaded_file(image, "services")
    db.commit()
    db.refresh(service)
    return service


@router.post("/upload-images")
async def upload_service_images(
    images: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser)
):
    """Upload multiple images for services (admin only). Returns list of image paths."""
    uploaded_paths = []
    for image in images:
        try:
            path = await save_uploaded_file(image, "services")
            uploaded_paths.append(path)
        except Exception as e:
            # Continue with other images even if one fails
            continue
    return uploaded_paths


@router.put("/{service_id}/images", response_model=ServiceResponse)
async def update_service_images(
    service_id: int,
    images_json: str = Form(...),  # JSON array of image paths
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser)
):
    """Update service images (admin only). Accepts JSON array of image paths."""
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )
    
    # Validate JSON format
    try:
        parsed = json.loads(images_json)
        if not isinstance(parsed, list):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="images_json must be a JSON array"
            )
        # Use first image as main image_path if not already set
        if parsed and len(parsed) > 0:
            first_image = parsed[0] if isinstance(parsed[0], str) else parsed[0].get('path', '')
            if first_image and not service.image_path:
                service.image_path = first_image
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid JSON format for images"
        )
    
    service.images = images_json
    db.commit()
    db.refresh(service)
    return service


@router.put("/{service_id}/video", response_model=ServiceResponse)
async def update_service_video(
    service_id: int,
    video_file: UploadFile = File(None),
    video_url: str = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser)
):
    """Update service video (admin only). Can upload file or provide URL."""
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )
    
    # Delete old video file if it exists and is a local file
    if service.video_url and not service.video_url.startswith(('http://', 'https://')):
        delete_file(service.video_url)
    
    # Handle new video: either uploaded file or URL
    video_url_value = None
    if video_file and video_file.filename:
        # Upload video file
        video_url_value = await save_uploaded_video(video_file, "services/videos")
        
        # Extract thumbnail and update image if current image is placeholder
        if service.image_path == "services/default-placeholder.jpg":
            try:
                thumbnail_path = await extract_video_thumbnail(video_url_value, "services")
                # Delete old placeholder if it exists
                if service.image_path:
                    delete_file(service.image_path)
                service.image_path = thumbnail_path
            except Exception:
                # If thumbnail extraction fails, keep existing image
                pass
    elif video_url and video_url.strip():
        # Use provided URL (YouTube/Vimeo embed URL)
        video_url_value = video_url.strip()
    elif video_url == "":
        # Empty string means remove video
        video_url_value = None
    
    service.video_url = video_url_value
    db.commit()
    db.refresh(service)
    return service


@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_service(
    service_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_superuser)
):
    """Delete a service (admin only)."""
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found"
        )
    
    if service.image_path:
        delete_file(service.image_path)
    
    # Delete video file if it's a local file (not URL)
    if service.video_url and not service.video_url.startswith(('http://', 'https://')):
        delete_file(service.video_url)
    
    db.delete(service)
    db.commit()
    return None

