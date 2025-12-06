from ultralytics import YOLO

class YoloPlateDetector:
    def __init__(self, model_path="models/yolo11n-plate.pt"):
        """
        Initialize the YoloPlateDetector.
        :param model_path: Path to the YOLO model file trained on plates.
        """
        print(f"Loading YOLO Plate model from {model_path}...")
        self.model = YOLO(model_path)

    def detect_plate(self, image):
        """
        Detect license plate in the given image (usually a vehicle crop).
        :param image: Input image.
        :return: Bounding box [x, y, w, h] of the best plate, or None.
        """
        results = self.model(image, verbose=False)[0]
        
        best_box = None
        max_conf = 0.0

        for box in results.boxes:
            # We assume the model only has one class (license plate)
            # or we take the highest confidence one.
            conf = float(box.conf[0])
            if conf > max_conf:
                max_conf = conf
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                best_box = [x1, y1, x2 - x1, y2 - y1] # Return x, y, w, h

        return best_box
