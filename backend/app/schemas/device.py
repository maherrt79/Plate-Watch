from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field

# Shared properties
class DeviceBase(BaseModel):
    locationId: str = Field(..., min_length=1, max_length=100, alias="location_id")
    isActive: bool = Field(True, alias="is_active")

    class Config:
        populate_by_name = True

# Properties to receive on creation
class DeviceCreate(DeviceBase):
    pass

# Properties to return to client
class Device(DeviceBase):
    id: UUID
    apiKeyId: str = Field(..., alias="api_key_id")
    lastSeen: Optional[datetime] = Field(None, alias="last_seen")
    createdAt: datetime = Field(..., alias="created_at")

    class Config:
        from_attributes = True
        populate_by_name = True
