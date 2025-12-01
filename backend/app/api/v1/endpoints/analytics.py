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

@router.get("/od-matrix")
def get_od_matrix(
    db: Session = Depends(deps.get_db),
    start_date: Optional[str] = Query(None, description="Start date (ISO 8601)"),
    end_date: Optional[str] = Query(None, description="End date (ISO 8601)"),
) -> Any:
    """
    Calculate Origin-Destination Matrix.
    Returns a list of {origin, destination, count} objects.
    """
    # 1. Fetch all sightings within range (or last 24h if not specified)
    query = db.query(models.Sighting).order_by(models.Sighting.plate_number, models.Sighting.timestamp)
    
    if start_date:
        query = query.filter(models.Sighting.timestamp >= start_date)
    if end_date:
        query = query.filter(models.Sighting.timestamp <= end_date)
        
    sightings = query.all()
    
    # 2. Process in Python to find trips
    trips = {} # (origin, destination) -> count
    
    if not sightings:
        return []

    current_plate = None
    first_sighting = None
    last_sighting = None

    for sighting in sightings:
        if sighting.plate_number != current_plate:
            # New plate, finalize previous trip if valid
            if current_plate and first_sighting and last_sighting and first_sighting != last_sighting:
                origin = first_sighting.location_id
                dest = last_sighting.location_id
                if origin != dest:
                    trips[(origin, dest)] = trips.get((origin, dest), 0) + 1
            
            # Reset for new plate
            current_plate = sighting.plate_number
            first_sighting = sighting
            last_sighting = sighting
        else:
            # Same plate, update last sighting
            last_sighting = sighting

    # Finalize last plate
    if current_plate and first_sighting and last_sighting and first_sighting != last_sighting:
        origin = first_sighting.location_id
        dest = last_sighting.location_id
        if origin != dest:
            trips[(origin, dest)] = trips.get((origin, dest), 0) + 1

    # 3. Format results
    results = []
    for (origin, dest), count in trips.items():
        results.append({"origin": origin, "destination": dest, "count": count})
        
    return results
