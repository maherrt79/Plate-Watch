from app.db.session import SessionLocal
from app.models.sighting import Sighting

db = SessionLocal()
sightings = db.query(Sighting).filter(Sighting.plate_number.ilike("%TRX-713%")).all()
print(f"Found {len(sightings)} sightings for TRX-713")
for s in sightings:
    print(f"- {s.plate_number} at {s.timestamp}")

all_sightings = db.query(Sighting).limit(5).all()
print("\nFirst 5 sightings in DB:")
for s in all_sightings:
    print(f"- {s.plate_number}")
