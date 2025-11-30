from typing import Optional
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel

class HotlistBase(BaseModel):
    plate_number: str
    description: Optional[str] = None
    category: Optional[str] = "info"

class HotlistCreate(HotlistBase):
    pass

class Hotlist(HotlistBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
