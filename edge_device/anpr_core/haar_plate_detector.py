from ultralytics import YOLO
import cv2
import os

class PlateDetector:
    def __init__(self, model_path="yolo11n-plate.pt"):
        """
        Initialize the PlateDetector with a YOLO model.
        :param model_path: Path to the YOLO model file.
        """
        if not os.path.exists(model_path):
             # Try absolute path if relative fails (assuming it's in the project root)
             root_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', model_path))
             if os.path.exists(root_path):
                 model_path = root_path
             else:
                 print(f"Warning: Model file not found at {model_path}")
        
        self.model = YOLO(model_path)
        print(f"Loaded Plate Detector from {model_path}")

    def detect_plate(self, vehicle_image):
        """
        Detect the license plate in a vehicle image.
        :param vehicle_image: Cropped image of the vehicle.
        :return: (x, y, w, h) of the plate, or None if not found.
        """
        results = self.model(vehicle_image, verbose=False)
        
        best_plate = None
        max_conf = -1

        for r in results:
            for box in r.boxes:
                # box.xyxy is [x1, y1, x2, y2]
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                conf = float(box.conf[0])
                
                # We want the highest confidence plate
                if conf > max_conf:
                    max_conf = conf
                    w = x2 - x1
                    h = y2 - y1
                    best_plate = (x1, y1, w, h)
        
        return best_plate
