from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID

from app import schemas, models
from app.api import deps

router = APIRouter()

@router.get("/", response_model=List[schemas.Hotlist])
def read_hotlists(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve hotlists.
    """
    hotlists = db.query(models.Hotlist).offset(skip).limit(limit).all()
    return hotlists

@router.post("/", response_model=schemas.Hotlist, status_code=201)
def create_hotlist(
    *,
    db: Session = Depends(deps.get_db),
    hotlist_in: schemas.HotlistCreate,
) -> Any:
    """
    Create new hotlist entry.
    """
    # Check for duplicates
    existing = db.query(models.Hotlist).filter(models.Hotlist.plate_number == hotlist_in.plate_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="Plate already exists in hotlist")

    hotlist = models.Hotlist(
        plate_number=hotlist_in.plate_number,
        description=hotlist_in.description,
        category=hotlist_in.category
    )
    db.add(hotlist)
    db.commit()
    db.refresh(hotlist)
    return hotlist

@router.delete("/{id}", response_model=schemas.Hotlist)
def delete_hotlist(
    *,
    db: Session = Depends(deps.get_db),
    id: UUID,
) -> Any:
    """
    Delete a hotlist entry.
    """
    hotlist = db.query(models.Hotlist).filter(models.Hotlist.id == id).first()
    if not hotlist:
        raise HTTPException(status_code=404, detail="Hotlist not found")
    db.delete(hotlist)
    db.commit()
    return hotlist
