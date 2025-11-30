import uuid
from sqlalchemy import Column, String, Boolean, DateTime, func
from sqlalchemy.dialects.postgresql import UUID

from app.models.base import Base

class Device(Base):
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    location_id = Column(String(100), unique=True, nullable=False, index=True)
    api_key_id = Column(String(100), nullable=False)
    api_key_hash = Column(String(255), nullable=False)
    is_active = Column(Boolean(), default=True)
    last_seen = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
