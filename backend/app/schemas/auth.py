"""
Authentication schemas.
"""
from pydantic import BaseModel, EmailStr


class Token(BaseModel):
    """Token response schema."""
    access_token: str
    token_type: str


class TokenData(BaseModel):
    """Token data schema."""
    username: str | None = None


class UserLogin(BaseModel):
    """User login request schema."""
    username: str
    password: str


class UserCreate(BaseModel):
    """User creation schema."""
    username: str
    email: EmailStr
    password: str
    is_superuser: bool = False


class UserResponse(BaseModel):
    """User response schema."""
    id: int
    username: str
    email: str
    is_active: bool
    is_superuser: bool

    class Config:
        from_attributes = True

