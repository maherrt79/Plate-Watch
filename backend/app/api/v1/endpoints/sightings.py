from typing import List, Any
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
    sighting = models.Sighting(
        plate_number=sighting_in.plateNumber,
        timestamp=sighting_in.timestamp,
        location_id=sighting_in.locationId
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
) -> Any:
    """
    Retrieve sightings.
    """
    sightings = db.query(models.Sighting).offset(skip).limit(limit).all()
    return sightings
