from fastapi import APIRouter

from app.api.v1.endpoints import sightings

api_router = APIRouter()
api_router.include_router(sightings.router, prefix="/sightings", tags=["sightings"])
