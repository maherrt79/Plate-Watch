import time
import random
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class MockVideoProcessor:
    def __init__(self, config, cloud_client):
        self.config = config
        self.cloud_client = cloud_client
        self.location_id = config['locationId']
        self.mock_plates = config.get('mockPlates', [])
        self.mock_locations = config.get('mockLocations', [])
        self.running = False

    def start(self):
        self.running = True
        logger.info("Starting Mock Video Processor...")
        
        while self.running:
            # Simulate processing time
            time.sleep(random.uniform(2.0, 5.0))
            
            # Simulate a sighting
            if random.random() < 0.3: # 30% chance of sighting per loop
                self._trigger_mock_sighting()

    def stop(self):
        self.running = False
        logger.info("Stopping Mock Video Processor...")

    def _trigger_mock_sighting(self):
        if self.mock_plates:
            plate = random.choice(self.mock_plates)
        else:
            plate = self._generate_random_plate()
            
        if self.mock_locations:
            location = random.choice(self.mock_locations)
        else:
            location = self.location_id
            
        timestamp = datetime.utcnow().isoformat() + "Z"
        
        payload = {
            "plateNumber": plate,
            "timestamp": timestamp,
            "locationId": location
        }
        
        logger.info(f"Mock Sighting Detected: {plate} at {location}")
        self.cloud_client.send_sighting(payload)

    def _generate_random_plate(self):
        letters = "".join(random.choices("ABCDEFGHIJKLMNOPQRSTUVWXYZ", k=3))
        numbers = "".join(random.choices("0123456789", k=3))
        return f"{letters}-{numbers}"
