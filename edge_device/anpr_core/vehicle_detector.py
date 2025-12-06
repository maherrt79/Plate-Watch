from ultralytics import YOLO
import cv2

class VehicleDetector:
    def __init__(self, model_path="models/yolo11n.pt"):
        """
        Initialize the VehicleDetector with a YOLO model.
        :param model_path: Path to the YOLO model file.
        """
        print(f"Loading YOLO model from {model_path}...")
        self.model = YOLO(model_path)
        # Class IDs for vehicles in COCO dataset:
        # 2: car, 3: motorcycle, 5: bus, 7: truck
        self.vehicle_classes = [2, 3, 5, 7]

    def detect_vehicles(self, frame):
        """
        Detect and track vehicles in the given frame.
        :param frame: Input image frame.
        :return: List of detections [(x1, y1, x2, y2, score, class_id, track_id), ...]
        """
        # Enable tracking with persist=True
        results = self.model.track(frame, persist=True, verbose=False)[0]
        detections = []

        for box in results.boxes:
            class_id = int(box.cls[0])
            if class_id in self.vehicle_classes:
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                score = float(box.conf[0])
                
                # Get track ID if available
                track_id = int(box.id[0]) if box.id is not None else -1
                
                detections.append((x1, y1, x2, y2, score, class_id, track_id))

        return detections
