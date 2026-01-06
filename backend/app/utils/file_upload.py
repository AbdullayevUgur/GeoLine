"""
File upload utilities for handling image uploads.
"""
import os
import uuid
from pathlib import Path
from typing import Optional
from fastapi import UploadFile, HTTPException, status
from PIL import Image
import aiofiles
import cv2
import numpy as np
from app.config import settings


async def save_uploaded_file(
    file: UploadFile,
    subdirectory: str = "general"
) -> str:
    """
    Save an uploaded file and return its relative path.
    
    Args:
        file: Uploaded file object
        subdirectory: Subdirectory within uploads folder
        
    Returns:
        Relative path to the saved file
        
    Raises:
        HTTPException: If file is invalid or too large
    """
    # Validate file size
    file_content = await file.read()
    file_size = len(file_content)
    
    if file_size > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File size exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE} bytes"
        )
    
    # Validate file type (images only)
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only image files are allowed"
        )
    
    # Generate unique filename
    file_extension = Path(file.filename).suffix if file.filename else ".jpg"
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    
    # Create upload directory if it doesn't exist
    upload_dir = Path(settings.UPLOAD_DIR) / subdirectory
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    # Save file
    file_path = upload_dir / unique_filename
    
    # Reset file pointer
    await file.seek(0)
    
    async with aiofiles.open(file_path, "wb") as f:
        await f.write(file_content)
    
    # Validate and optimize image
    try:
        img = Image.open(file_path)
        # Convert to RGB if necessary
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
        # Save optimized version
        img.save(file_path, "JPEG", quality=85, optimize=True)
    except Exception as e:
        # If image processing fails, delete the file
        os.remove(file_path)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid image file: {str(e)}"
        )
    
    # Return relative path
    return f"{subdirectory}/{unique_filename}"


async def save_uploaded_video(
    file: UploadFile,
    subdirectory: str = "videos"
) -> str:
    """
    Save an uploaded video file and return its relative path.
    
    Args:
        file: Uploaded file object
        subdirectory: Subdirectory within uploads folder
        
    Returns:
        Relative path to the saved file
        
    Raises:
        HTTPException: If file is invalid or too large
    """
    # Validate file size (videos can be larger, allow up to 100MB)
    file_content = await file.read()
    file_size = len(file_content)
    
    max_video_size = 100 * 1024 * 1024  # 100MB
    if file_size > max_video_size:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Video file size exceeds maximum allowed size of {max_video_size / (1024*1024)}MB"
        )
    
    # Validate file type (videos)
    allowed_video_types = [
        "video/mp4",
        "video/webm",
        "video/ogg",
        "video/quicktime",
        "video/x-msvideo"
    ]
    
    if not file.content_type or file.content_type not in allowed_video_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Only video files are allowed (MP4, WebM, OGG, MOV, AVI). Got: {file.content_type}"
        )
    
    # Generate unique filename
    file_extension = Path(file.filename).suffix if file.filename else ".mp4"
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    
    # Create upload directory if it doesn't exist
    upload_dir = Path(settings.UPLOAD_DIR) / subdirectory
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    # Save file
    file_path = upload_dir / unique_filename
    
    # Reset file pointer
    await file.seek(0)
    
    async with aiofiles.open(file_path, "wb") as f:
        await f.write(file_content)
    
    # Return relative path
    return f"{subdirectory}/{unique_filename}"


async def extract_video_thumbnail(
    video_path: str,
    output_subdirectory: str = "services",
    frame_time: float = 1.0
) -> str:
    """
    Extract a thumbnail frame from a video file and save it as an image.
    
    Args:
        video_path: Relative path to the video file (e.g., "services/videos/video.mp4")
        output_subdirectory: Subdirectory to save the thumbnail
        frame_time: Time in seconds to extract frame from (default: 1 second)
        
    Returns:
        Relative path to the saved thumbnail image
        
    Raises:
        HTTPException: If video processing fails
    """
    try:
        # Get full path to video file
        full_video_path = Path(settings.UPLOAD_DIR) / video_path
        if not full_video_path.exists():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Video file not found: {video_path}"
            )
        
        # Open video file
        cap = cv2.VideoCapture(str(full_video_path))
        if not cap.isOpened():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Could not open video file"
            )
        
        # Get video properties
        fps = cap.get(cv2.CAP_PROP_FPS)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        # Calculate frame number (use 1 second or 10% of video, whichever is smaller)
        target_frame = min(int(frame_time * fps), int(total_frames * 0.1))
        if target_frame < 1:
            target_frame = 1
        
        # Set video position to target frame
        cap.set(cv2.CAP_PROP_POS_FRAMES, target_frame)
        
        # Read frame
        ret, frame = cap.read()
        cap.release()
        
        if not ret or frame is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Could not extract frame from video"
            )
        
        # Convert BGR to RGB (OpenCV uses BGR, PIL uses RGB)
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Convert to PIL Image
        pil_image = Image.fromarray(frame_rgb)
        
        # Resize if too large (max width 800px, maintain aspect ratio)
        max_width = 800
        if pil_image.width > max_width:
            ratio = max_width / pil_image.width
            new_height = int(pil_image.height * ratio)
            pil_image = pil_image.resize((max_width, new_height), Image.Resampling.LANCZOS)
        
        # Generate unique filename for thumbnail
        unique_filename = f"{uuid.uuid4()}.jpg"
        
        # Create output directory
        output_dir = Path(settings.UPLOAD_DIR) / output_subdirectory
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # Save thumbnail
        thumbnail_path = output_dir / unique_filename
        pil_image.save(thumbnail_path, "JPEG", quality=85, optimize=True)
        
        # Return relative path
        return f"{output_subdirectory}/{unique_filename}"
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error extracting video thumbnail: {str(e)}"
        )


def delete_file(file_path: str) -> bool:
    """
    Delete a file from the uploads directory.
    
    Args:
        file_path: Relative path to the file
        
    Returns:
        True if file was deleted, False otherwise
    """
    try:
        full_path = Path(settings.UPLOAD_DIR) / file_path
        if full_path.exists():
            os.remove(full_path)
            return True
        return False
    except Exception:
        return False

