from fastapi import APIRouter

from app.api.v1.endpoints import sightings, hotlists

api_router = APIRouter()
api_router.include_router(sightings.router, prefix="/sightings", tags=["sightings"])
api_router.include_router(hotlists.router, prefix="/hotlists", tags=["hotlists"])
