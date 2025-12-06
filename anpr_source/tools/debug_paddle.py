import cv2
import numpy as np
import os
import sys

# Ensure we can import from src
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if project_root not in sys.path:
    sys.path.append(project_root)

from src.paddle_reader import PaddleLicenseReader

def create_test_image():
    # Create a white image
    img = np.ones((100, 300, 3), dtype=np.uint8) * 255
    
    # Put some text on it
    font = cv2.FONT_HERSHEY_SIMPLEX
    cv2.putText(img, 'ABC-1234', (50, 60), font, 1.5, (0, 0, 0), 3, cv2.LINE_AA)
    
    return img

def main():
    print("Creating test image...")
    img = create_test_image()
    cv2.imwrite("test_ocr.jpg", img)
    
    print("Initializing PaddleLicenseReader...")
    reader = PaddleLicenseReader()
    
    print("Reading text...")
    results = reader.read_text(img)
    
    print(f"Results: {results}")

if __name__ == "__main__":
    main()
