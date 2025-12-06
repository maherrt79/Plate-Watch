import cv2
import os
import argparse
import src.config as config
from src.video_processor import VideoProcessor
from src.vehicle_detector import VehicleDetector
from src.paddle_reader import PaddleLicenseReader
from src.yolo_plate_detector import YoloPlateDetector
from src.core_logic import process_plate_detection, VehicleTracker

def get_vehicle_color(class_id):
    """Returns the BGR color tuple for a given vehicle class ID."""
    if class_id == 2: return config.COLOR_CAR
    if class_id == 7: return config.COLOR_TRUCK
    if class_id == 5: return config.COLOR_BUS
    return config.COLOR_DEFAULT

def main():
    parser = argparse.ArgumentParser(description="ANPR Edge App")
    parser.add_argument("--headless", action="store_true", help="Run in headless mode (no GUI)")
    args = parser.parse_args()

    # Setup Video Source
    source = config.VIDEO_PATH if os.path.exists(config.VIDEO_PATH) else 0
    print(f"Using video source: {source}")

    try:
        processor = VideoProcessor(source)
        detector = VehicleDetector() 
        reader = PaddleLicenseReader() 
        plate_detector = YoloPlateDetector() 
    except ValueError as e:
        print(f"Error initializing system: {e}")
        return

    print("Loading models... Press 'q' to exit.")
    
    tracker = VehicleTracker()
    frame_count = 0
    
    while True:
        ret, frame = processor.get_frame()
        if not ret:
            print("End of video or error reading frame.")
            break
        
        frame_count += 1
        
        # Global Frame Skipping
        if frame_count % config.FRAME_SKIP_RATE != 0:
            continue
        
        # Vehicle Detection
        detections = detector.detect_vehicles(frame.copy())
        
        annotated_frame = None
        if not args.headless:
            annotated_frame = frame.copy()
        
        if detections:
            for (x1, y1, x2, y2, conf, class_id, track_id) in detections:
                # 1. Visualization
                if not args.headless:
                    color = get_vehicle_color(class_id)
                    label = f"{detector.model.names[class_id]} {conf:.2f} ID: {track_id if track_id != -1 else 'N/A'}"
                    
                    cv2.rectangle(annotated_frame, (x1, y1), (x2, y2), color, 2)
                    cv2.putText(annotated_frame, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
                
                # 2. Processing (if tracked)
                if track_id != -1:
                    tracker.update(track_id, frame_count)
                    
                    # Plate Detection & OCR
                    # Pass annotated_frame (which is None if headless) to allow drawing if needed (handled in core_logic)
                    plate_text, plate_conf, plate_area = process_plate_detection(
                        frame, (x1, y1, x2, y2), plate_detector, reader, annotated_frame
                    )
                    
                    if plate_text:
                        tracker.add_read(track_id, plate_text, plate_conf, plate_area)
                        # Live Feedback
                        if not args.headless:
                            cv2.putText(annotated_frame, f"Read: {plate_text} ({plate_conf:.2f})", (x1, y2 + 20), 
                                      cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)

        # Check for vehicles leaving frame
        tracker.check_exiting_vehicles(frame_count)

        # Display
        if not args.headless:
            cv2.imshow("ANPR Edge App - Refactored", annotated_frame)
            
            # Input Handling
            key = cv2.waitKey(1) & 0xFF
            if key == ord('q'):
                break
            elif key == ord(' '):
                print("Paused. Press space to resume.")
                while cv2.waitKey(1) & 0xFF != ord(' '): pass
                print("Resumed.")

    processor.release()
    cv2.destroyAllWindows()
    print("Application closed.")

if __name__ == "__main__":
    main()
