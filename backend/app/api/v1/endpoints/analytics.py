from typing import Any, List, Optional
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app import models, schemas
from app.api import deps

router = APIRouter()

@router.get("/convoy")
def get_convoy_analysis(
    db: Session = Depends(deps.get_db),
    plate_number: str = Query(..., description="Target plate number to analyze"),
    time_window_seconds: int = Query(5, description="Time window in seconds to consider as a convoy"),
) -> Any:
    """
    Analyze sightings to find potential convoys for a specific plate.
    Returns a list of 'convoy groups' where the target plate was seen with other vehicles.
    """
    # 1. Find all sightings of the target plate
    target_sightings = db.query(models.Sighting).filter(
        models.Sighting.plate_number == plate_number
    ).order_by(models.Sighting.timestamp.desc()).all()

    results = []

    for sighting in target_sightings:
        # 2. For each sighting, find other vehicles at the same location within the time window
        window = timedelta(seconds=time_window_seconds)
        start_time = sighting.timestamp - window
        end_time = sighting.timestamp + window

        followers = db.query(models.Sighting).filter(
            models.Sighting.location_id == sighting.location_id,
            models.Sighting.timestamp >= start_time,
            models.Sighting.timestamp <= end_time,
            models.Sighting.plate_number != plate_number # Exclude self
        ).all()

        if followers:
            results.append({
                "leader_sighting": sighting,
                "followers": followers
            })

    return results
