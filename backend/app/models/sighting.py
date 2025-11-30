import uuid
from sqlalchemy import Column, String, DateTime, func, Boolean
from sqlalchemy.dialects.postgresql import UUID

from app.models.base import Base

class Sighting(Base):
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    plate_number = Column(String(20), nullable=False, index=True)
    timestamp = Column(DateTime(timezone=True), nullable=False, index=True)
    location_id = Column(String(100), nullable=False, index=True)
    is_hot = Column(Boolean, default=False)
    hotlist_category = Column(String, nullable=True)
    vehicle_make = Column(String, nullable=True)
    vehicle_model = Column(String, nullable=True)
    vehicle_color = Column(String, nullable=True)
    direction = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
