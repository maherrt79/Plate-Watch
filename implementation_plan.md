# Edge App Local Implementation Plan

## Goal
Implement the actual Edge Device logic (Computer Vision pipeline) to run locally on the developer's machine. This will replace the random data generation (`MockVideoProcessor`) with real video processing using YOLOv8 for vehicle detection and EasyOCR for license plate recognition.

## User Review Required
> [!IMPORTANT]
> **Performance Note**: Running OCR on every frame or every detected vehicle can be resource-intensive. The implementation will include logic to only process frames at a certain interval or only process new tracks to maintain performance on a laptop.

> [!NOTE]
> **Video Source**: You will need a video file named `test_video.mp4` in the `edge_device` directory.
> **Download Options**:
> - [Coverr - Traffic Videos](https://coverr.co/s?q=traffic+license+plate) (Look for clips with visible plates)
> - [Vecteezy - License Plate Footage](https://www.vecteezy.com/free-videos/car-license-plate)
> - Or use your own video file.
> Alternatively, change `cameraSource` in `config/device_config.yaml` to `0` to use your webcam.

## Proposed Changes

### Edge Device Component

#### [NEW] `edge_device/models/vehicle_detector.py`
- Wrapper around `ultralytics.YOLO`.
- Loads `yolov8n.pt` (nano model) for efficiency.
- Returns bounding boxes and class IDs for vehicles (car, truck, bus, motorcycle).

#### [NEW] `edge_device/models/plate_reader.py`
- Wrapper around `easyocr.Reader`.
- Method `read_plate(image)` that returns text and confidence.
- Includes basic text filtering to remove noise (e.g., too short, unwanted characters).

#### [NEW] `edge_device/models/object_tracker.py`
- Wrapper for YOLOv8's built-in tracking.
- Handles ID assignment to track vehicles across frames.

#### [NEW] `edge_device/core/real_video_processor.py`
- Implements the `VideoProcessor` class.
- **Init**: Loads config, initializes Detector and PlateReader.
- **Start**: Opens video source (file or webcam).
- **Loop**:
    1. Read frame.
    2. Run YOLOv8 tracking to get vehicles and IDs.
    3. For each *new* or *unprocessed* vehicle ID:
        - Crop the vehicle image.
        - Run PlateReader on the crop.
        - If a valid plate is found:
            - Send sighting to CloudClient.
            - Mark ID as processed to avoid duplicate alerts for the same vehicle pass.
    4. Display the frame with annotations (cv2.imshow) for local debugging/demo.

#### [MODIFY] `edge_device/main.py`
- Import `RealVideoProcessor`.
- Switch based on `simulationMode` config.
- If `simulationMode` is false, instantiate and start `RealVideoProcessor`.

#### [MODIFY] `edge_device/config/device_config.yaml`
- Ensure `simulationMode` can be toggled.
- Add `detectionInterval` or similar settings if needed.
- Set `cameraSource` to `test_video.mp4` by default.

## Verification Plan

### Manual Verification
1. **Setup**:
    - Install dependencies: `pip install -r edge_device/requirements.txt`
    - Download `yolov8n.pt` (automatic on first run).
    - **Action Required**: Download a traffic video and save it as `edge_device/test_video.mp4`.
2. **Execution**:
    - Run `python edge_device/main.py`.
    - Verify a window opens showing the video with bounding boxes.
    - Verify terminal logs show "Vehicle detected", "Plate read: ...".
    - Verify sightings are sent to the local backend (check backend logs or web app dashboard).
