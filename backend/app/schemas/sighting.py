from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field

# Shared properties
class SightingBase(BaseModel):
    plateNumber: str = Field(..., min_length=1, max_length=20, alias="plate_number")
    timestamp: datetime
    locationId: str = Field(..., min_length=1, max_length=100, alias="location_id")
    vehicleMake: Optional[str] = Field(None, alias="vehicle_make")
    vehicleModel: Optional[str] = Field(None, alias="vehicle_model")
    vehicleColor: Optional[str] = Field(None, alias="vehicle_color")
    direction: Optional[str] = None
    
    class Config:
        populate_by_name = True

# Properties to receive on creation
class SightingCreate(SightingBase):
    pass

# Properties to return to client
class Sighting(SightingBase):
    id: UUID
    createdAt: datetime = Field(..., alias="created_at")
    isHot: bool = Field(False, alias="is_hot")
    hotlistCategory: Optional[str] = Field(None, alias="hotlist_category")

    class Config:
        from_attributes = True
        populate_by_name = True
