import uuid
from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from .base import Base

class Hotlist(Base):
    __tablename__ = "hotlists"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    plate_number = Column(String, index=True, nullable=False)
    description = Column(String, nullable=True)
    category = Column(String, default="info")
    created_at = Column(DateTime, default=datetime.utcnow)
