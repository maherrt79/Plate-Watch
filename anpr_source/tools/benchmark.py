import time
import cv2
import os
import sys

# Ensure we can import from src regardless of where this script is run
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if project_root not in sys.path:
    sys.path.append(project_root)

import src.config as config
from src.video_processor import VideoProcessor
from src.vehicle_detector import VehicleDetector
from src.paddle_reader import PaddleLicenseReader
from src.yolo_plate_detector import YoloPlateDetector
from src.core_logic import process_plate_detection, VehicleTracker

def run_benchmark(run_name, res_weight, conf_weight, pos_vote, char_correct, logic_layer, strict_regex, detector, reader, plate_detector):
    # Inject Config
    config.ENABLE_RESOLUTION_WEIGHTING = res_weight
    config.ENABLE_CONFIDENCE_WEIGHTING = conf_weight
    config.ENABLE_POSITIONAL_VOTING = pos_vote
    config.ENABLE_CHAR_CORRECTION = char_correct
    config.ENABLE_OCR_LOGIC_LAYER = logic_layer
    config.ENABLE_STRICT_REGEX = strict_regex
    
    print(f"\n==================================================")
    print(f"Starting Benchmark: {run_name}")
    print(f"Config: Logic={config.ENABLE_OCR_LOGIC_LAYER}, Voting={config.ENABLE_POSITIONAL_VOTING}, ResWeight={config.ENABLE_RESOLUTION_WEIGHTING}")
    print(f"==================================================")

    # Setup Video
    source = config.VIDEO_PATH if os.path.exists(config.VIDEO_PATH) else 0
    try:
        processor = VideoProcessor(source)
    except ValueError:
        print("Error opening video.")
        return

    tracker = VehicleTracker()
    frame_count = 0
    processed_frames = 0
    
    # Metrics
    total_veh_det_time = 0
    total_plate_det_time = 0
    total_ocr_time = 0
    plate_checks = 0
    
    start_time = time.time()

    while True:
        ret, frame = processor.get_frame()
        if not ret: break
        
        frame_count += 1
        if frame_count % config.FRAME_SKIP_RATE != 0: continue
        processed_frames += 1

        if processed_frames % 10 == 0:
            print(f"  Processed {processed_frames} frames...")
        
        # Vehicle Detection
        t0 = time.time()
        detections = detector.detect_vehicles(frame)
        t1 = time.time()
        total_veh_det_time += (t1 - t0) * 1000
        
        annotated_frame = None # Disable visualization for pure benchmarking speed
        
        if detections:
            for (x1, y1, x2, y2, conf, class_id, track_id) in detections:
                if track_id != -1:
                    tracker.update(track_id, frame_count)
                    
                    # We need to measure time for process_plate_detection, so we wrap it
                    pt0 = time.time()
                    # Note: process_plate_detection internals use time? No, we removed timing from core_logic to keep it clean.
                    # We can't measure exact breakdown easily without modifying core_logic or wrapping calls inside it.
                    # For now, let's measure total plate processing time.
                    
                    plate_text, plate_conf, plate_area = process_plate_detection(
                        frame, (x1, y1, x2, y2), plate_detector, reader, annotated_frame
                    )
                    pt1 = time.time()
                    
                    if plate_text:
                        diff = (pt1 - pt0) * 1000
                        total_plate_det_time += diff # This now includes OCR and Logic
                        plate_checks += 1
                        tracker.add_read(track_id, plate_text, plate_conf, plate_area)

        # Check existing
        # We manually call check_exiting to capture output? 
        # The tracker prints to stdout. We can just let it print or capture it.
        # Ideally we'd want to return results, but for now reproducing exact behavior is fine.
        tracker.check_exiting_vehicles(frame_count)

    end_time = time.time()
    total_time = end_time - start_time
    fps = processed_frames / total_time if total_time > 0 else 0
    
    processor.release()

    # Results
    print(f"\n--- Results for {run_name} ---")
    print(f"Total Time: {total_time:.2f}s | Processed Frames: {processed_frames} | FPS: {fps:.1f}")
    print(f"Avg Vehicle Det: {total_veh_det_time/processed_frames:.2f}ms")
    if plate_checks > 0:
        print(f"Avg Plate+OCR: {total_plate_det_time/plate_checks:.2f}ms")

def main():
    print("Initializing Models...")
    detector = VehicleDetector() 
    reader = PaddleLicenseReader() 
    plate_detector = YoloPlateDetector() 

    # 1. Baseline
    run_benchmark("Baseline (Fast)", res_weight=False, conf_weight=False, pos_vote=False, char_correct=False, logic_layer=False, strict_regex=True, 
                 detector=detector, reader=reader, plate_detector=plate_detector)

    # 2. Logic Only
    run_benchmark("Logic Only", res_weight=False, conf_weight=False, pos_vote=False, char_correct=True, logic_layer=True, strict_regex=True,
                 detector=detector, reader=reader, plate_detector=plate_detector)

    # 3. Full Features
    run_benchmark("Full Features (Best Accuracy)", res_weight=True, conf_weight=True, pos_vote=True, char_correct=True, logic_layer=True, strict_regex=True,
                 detector=detector, reader=reader, plate_detector=plate_detector)

if __name__ == "__main__":
    main()
