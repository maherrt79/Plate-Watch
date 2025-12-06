import cv2
import os
import sys

# Ensure we can import from src regardless of where this script is run
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if project_root not in sys.path:
    sys.path.append(project_root)

from src.yolo_plate_detector import YoloPlateDetector
from src.paddle_reader import PaddleLicenseReader
import sys

# Define the images
# Assuming images are in tests/assets or similar. For now, using absolute for debug, but ideally relative.
# Updating to point to tests/ folder structure if needed, but user didn't move the debug images explicitly, just "files used for test".
# If the debug images were in assets or root, they might have been moved.
# Let's check where they are first? No, I see the path was absolute.
image_dir = "/Users/maher/.gemini/antigravity/brain/6f461f9d-4a88-46ac-8391-c56fd2f79e41"
output_dir = "/Users/maher/.gemini/antigravity/brain/6f461f9d-4a88-46ac-8391-c56fd2f79e41/debug_plates"

if not os.path.exists(output_dir):
    os.makedirs(output_dir)

images = [
    "uploaded_image_0_1765006546200.png",
    "uploaded_image_1_1765006546200.png",
    "uploaded_image_2_1765006546200.png",
    "uploaded_image_3_1765006546200.png"
]

def test_class_detection(model_name):
    print(f"\n--- Testing YoloPlateDetector & OCR with model: {model_name} ---")
    
    try:
        detector = YoloPlateDetector(model_path=model_name) 
        reader = PaddleLicenseReader(lang='en')
    except Exception as e:
        print(f"Failed to initialize: {e}")
        return

    for img_name in images:
        img_path = os.path.join(image_dir, img_name)
        if not os.path.exists(img_path):
            print(f"Skipping {img_name} (not found)")
            continue
            
        img = cv2.imread(img_path)
        if img is None:
            print(f"Failed to load {img_name}")
            continue
            
        # Note: YoloPlateDetector.detect_plate returns [x, y, w, h] list, or None.
        # It is compatible with this script.
        result = detector.detect_plate(img)
        
        if result:
            x, y, w, h = result
            print(f"Image {img_name}: Found plate at x={x}, y={y}, w={w}, h={h}")
            
            # Crop the plate
            pad = 0
            x1 = max(0, x - pad)
            y1 = max(0, y - pad)
            x2 = min(img.shape[1], x + w + pad)
            y2 = min(img.shape[0], y + h + pad)
            
            plate_img = img[y1:y2, x1:x2]
            
            # Run OCR on the crop
            # ocr_results = reader.read_text(plate_img, det=True)
            # for text, conf, box in ocr_results:
            #     print(f"    [Det+Rec] Result: '{text}' (conf={conf:.2f})")
            
            print(f"  Running OCR (det=False)...")
            rec_results = reader.read_text(plate_img, det=False)
            for text, conf, box in rec_results:
                print(f"    [Rec Only] Result: '{text}' (conf={conf:.2f})")
                
        else:
            print(f"Image {img_name}: No plate found")

if __name__ == "__main__":
    # Updated paths for models in 'models/' directory
    models = ["models/license_plate_detector.pt", "models/yolo11n-plate.pt"]
    for m in models:
        test_class_detection(m)
