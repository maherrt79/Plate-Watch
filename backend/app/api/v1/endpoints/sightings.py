from datetime import datetime
from typing import List, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session

from app import schemas, models
from app.api import deps
from app.core.config import settings

router = APIRouter()

def validate_api_key(x_api_key: str = Header(...)):
    """
    Mock API Key validation for local development.
    In production, this would check against the database or AWS API Gateway.
    """
    if settings.USE_MOCK_AUTH:
        if x_api_key != settings.MOCK_API_KEY:
            raise HTTPException(status_code=401, detail="Invalid API Key")
    return x_api_key

from sqlalchemy import func

@router.get("/stats", response_model=schemas.SightingStats)
def get_stats(
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Get sighting statistics.
    """
    total = db.query(models.Sighting).count()
    alerts = db.query(models.Sighting).filter(models.Sighting.is_hot == True).count()
    
    # Group by category
    rows = db.query(models.Sighting.hotlist_category, func.count(models.Sighting.id)).filter(models.Sighting.is_hot == True).group_by(models.Sighting.hotlist_category).all()
    
    category_counts = {row[0]: row[1] for row in rows if row[0]}
    
    return {
        "total_sightings": total,
        "total_alerts": alerts,
        "alerts_by_category": category_counts
    }

@router.post("/", response_model=schemas.Sighting, status_code=201)
def create_sighting(
    *,
    db: Session = Depends(deps.get_db),
    sighting_in: schemas.SightingCreate,
    api_key: str = Depends(validate_api_key)
) -> Any:
    """
    Create new sighting.
    """
    # Check if plate is in hotlist
    is_hot = False
    hotlist_category = None
    hotlist_entry = db.query(models.Hotlist).filter(models.Hotlist.plate_number == sighting_in.plateNumber).first()
    if hotlist_entry:
        is_hot = True
        hotlist_category = hotlist_entry.category
        print(f"ALERT: Hotlist match for {sighting_in.plateNumber} ({hotlist_entry.category})")

    sighting = models.Sighting(
        plate_number=sighting_in.plateNumber,
        timestamp=sighting_in.timestamp,
        location_id=sighting_in.locationId,
        is_hot=is_hot,
        hotlist_category=hotlist_category,
        vehicle_make=sighting_in.vehicleMake,
        vehicle_model=sighting_in.vehicleModel,
        vehicle_color=sighting_in.vehicleColor,
        direction=sighting_in.direction
    )
    db.add(sighting)
    db.commit()
    db.refresh(sighting)
    return sighting

@router.get("/", response_model=List[schemas.Sighting])
def read_sightings(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    plateNumber: Optional[str] = None,
    locationId: Optional[str] = None,
    startDate: Optional[datetime] = None,
    endDate: Optional[datetime] = None,
    hotlistCategory: Optional[str] = None,
) -> Any:
    """
    Retrieve sightings.
    """
    query = db.query(models.Sighting)
    
    if plateNumber:
        query = query.filter(models.Sighting.plate_number.ilike(f"%{plateNumber}%"))
    
    if locationId:
        query = query.filter(models.Sighting.location_id == locationId)
        
    if startDate:
        query = query.filter(models.Sighting.timestamp >= startDate)
        
    if endDate:
        query = query.filter(models.Sighting.timestamp <= endDate)

    if hotlistCategory:
        if hotlistCategory == "All Alerts":
             query = query.filter(models.Sighting.is_hot == True)
        elif hotlistCategory != "All":
             query = query.filter(models.Sighting.hotlist_category == hotlistCategory)
        
    sightings = query.order_by(models.Sighting.timestamp.desc()).offset(skip).limit(limit).all()
    return sightings
