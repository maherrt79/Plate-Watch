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
            time.sleep(random.uniform(0.5, 1.5))
            
            # Simulate a sighting
            if random.random() < 0.5: # 50% chance of sighting per loop
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
            
        # Simulate MMC (Probabilistic - 80% chance)
        vehicle_make = None
        vehicle_model = None
        vehicle_color = None
        
        if random.random() < 0.8:
            makes = ["Toyota", "Honda", "Ford", "Chevrolet", "BMW", "Mercedes", "Tesla"]
            models_map = {
                "Toyota": ["Camry", "Corolla", "RAV4"],
                "Honda": ["Civic", "Accord", "CR-V"],
                "Ford": ["F-150", "Mustang", "Explorer"],
                "Chevrolet": ["Silverado", "Malibu", "Equinox"],
                "BMW": ["3 Series", "5 Series", "X5"],
                "Mercedes": ["C-Class", "E-Class", "GLC"],
                "Tesla": ["Model 3", "Model Y", "Model S"]
            }
            colors = ["White", "Black", "Silver", "Gray", "Red", "Blue", "Green"]

            vehicle_make = random.choice(makes)
            vehicle_model = random.choice(models_map[vehicle_make])
            vehicle_color = random.choice(colors)

        # Simulate Direction of Travel (Probabilistic - 90% chance)
        direction = None
        if random.random() < 0.9:
            direction = random.choice(["Entering", "Exiting"])

        sighting = {
            "plateNumber": plate,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "locationId": location,
            "vehicleMake": vehicle_make,
            "vehicleModel": vehicle_model,
            "vehicleColor": vehicle_color,
            "direction": direction
        }
        
        logger.info(f"Mock Sighting Detected: {plate} at {location}")
        self.cloud_client.send_sighting(sighting)

    def _generate_random_plate(self):
        letters = "".join(random.choices("ABCDEFGHIJKLMNOPQRSTUVWXYZ", k=3))
        numbers = "".join(random.choices("0123456789", k=3))
        return f"{letters}-{numbers}"

import cv2
import sys
import os

# Ensure we can import from anpr_core
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if project_root not in sys.path:
    sys.path.append(project_root)

from anpr_core.vehicle_detector import VehicleDetector
from anpr_core.paddle_reader import PaddleLicenseReader
from anpr_core.yolo_plate_detector import YoloPlateDetector
from anpr_core.core_logic import process_plate_detection, VehicleTracker
import anpr_core.config as anpr_config

class RealVideoProcessor(MockVideoProcessor):
    def __init__(self, config, cloud_client):
        super().__init__(config, cloud_client)
        self.camera_source = config.get('cameraSource')
        
        logger.info("Initializing ANPR Core Models...")
        self.vehicle_detector = VehicleDetector(model_path="models/yolov8n.pt") # Using standard model for vehicles
        self.reader = PaddleLicenseReader(lang='en')
        self.plate_detector = YoloPlateDetector(model_path="models/license_plate_detector.pt") # Custom plate model
        self.tracker = VehicleTracker()
        
        # Override ANPR Config with Device Config if needed
        anpr_config.FRAME_SKIP_RATE = 5 

    def start(self):
        self.running = True
        logger.info(f"Starting Real Video Processor using source: {self.camera_source}")
        
        cap = cv2.VideoCapture(self.camera_source)
        if not cap.isOpened():
            logger.error(f"Failed to open video source: {self.camera_source}")
            return

        frame_count = 0
        while self.running and cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                logger.info("End of video stream. Looping...")
                cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                continue

            frame_count += 1
            if frame_count % anpr_config.FRAME_SKIP_RATE == 0:
                self.process_frame(frame, frame_count)
            
            # Allow clean exit
            time.sleep(0.001)

        cap.release()

    def process_frame(self, frame, frame_count):
        # 1. Detect Vehicles
        detections = self.vehicle_detector.detect_vehicles(frame)
        
        if detections:
            for (x1, y1, x2, y2, conf, class_id, track_id) in detections:
                if track_id != -1:
                    self.tracker.update(track_id, frame_count)
                    
                    # 2. Detect & Read Plate on Tracked Vehicle
                    # Pass frame and vehicle bbox to core logic
                    plate_text, plate_conf, plate_area = process_plate_detection(
                        frame, (x1, y1, x2, y2), self.plate_detector, self.reader, None
                    )
                    
                    if plate_text:
                        self.tracker.add_read(track_id, plate_text, plate_conf, plate_area)

        # 3. Check for Exiting Vehicles & Finalize
        exiting_vehicles = self.tracker.check_exiting_vehicles(frame_count)
        
        for vehicle_id, plate_data in exiting_vehicles.items():
            final_plate = plate_data['best_plate']
            confidence = plate_data['confidence']
            history = plate_data['history']
            
            logger.info(f"FINALIZED PLATE: {final_plate} (Conf: {confidence:.2f}, Reads: {len(history)})")
            
            # Randomize Location if mock locations are provided
            location = self.location_id
            if self.mock_locations:
                location = random.choice(self.mock_locations)

            sighting = {
                "plateNumber": final_plate,
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "locationId": location,
                "vehicleMake": None, # Could infer from class_id if we tracked it
                "vehicleModel": None,
                "vehicleColor": None,
                "direction": "Exiting" # Inferred from "check_exiting_vehicles"
            }
            self.cloud_client.send_sighting(sighting)
