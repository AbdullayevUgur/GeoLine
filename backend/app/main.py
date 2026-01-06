"""
FastAPI application main file.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from app.database import engine, Base
from app.config import settings

# Import routers
from app.routers import (
    auth, carousel, service, portfolio, blog, faq,
    about, contact, statistic, partner, license
)

# Create database tables
Base.metadata.create_all(bind=engine)

# Create uploads directory if it doesn't exist
Path(settings.UPLOAD_DIR).mkdir(parents=True, exist_ok=True)

# Initialize FastAPI app
app = FastAPI(
    title="GeoLine CMS API",
    description="Content Management System API for GeoLine Engineering Website",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for uploaded images
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Register routers
app.include_router(auth.router)
app.include_router(carousel.router)
app.include_router(service.router)
app.include_router(portfolio.router)
app.include_router(blog.router)
app.include_router(faq.router)
app.include_router(about.router)
app.include_router(contact.router)
app.include_router(statistic.router)
app.include_router(partner.router)
app.include_router(license.router)


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "GeoLine CMS API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "redoc": "/redoc"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}

