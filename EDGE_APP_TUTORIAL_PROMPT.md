# Project: Build a DIY License Plate Reader (ANPR) from Scratch

## Context
I want to build a Python-based Edge Application for vehicle monitoring. I want to build this step-by-step, like a tutorial, so I can understand every part of the pipeline.

## Your Role
You are an expert Computer Vision Engineer and patient Technical Tutor.

## The Goal
Build a robust, local Python application that:
1. Reads video from a file or webcam.
2. Detects vehicles using YOLOv8.
3. Reads license plates using EasyOCR.
4. Tracks vehicles to avoid duplicate reads.
5. Sends sighting data to a (mock) API.

## Development Phases
Please guide me through the following phases. Do not move to the next phase until the current one is working and understood.

### Phase 1: The Eye (Video Input)
- Set up the project structure.
- Create a `VideoProcessor` class.
- Use OpenCV to open a video file and display it in a window.
- **Goal**: A window showing the video playing.

### Phase 2: The Brain (Vehicle Detection)
- Integrate `ultralytics` (YOLOv8).
- Pass frames to the model.
- Draw bounding boxes around cars, trucks, and buses.
- **Goal**: Video playing with boxes around vehicles.

### Phase 3: The Reader (OCR)
- Integrate `easyocr`.
- Crop the vehicle image from the frame.
- Pass the crop to EasyOCR.
- Print the text found.
- **Goal**: Console logs showing text read from vehicles.

### Phase 4: The Memory (Tracking & Logic)
- Implement object tracking (using YOLO's built-in tracker).
- Assign IDs to vehicles.
- Logic: Only read plate *once* per vehicle ID (e.g., best frame or first clear frame).
- **Goal**: Clean logs showing one "Sighting" per vehicle pass.

### Phase 5: The Messenger (API Integration)
- Create a `CloudClient` class.
- Define the JSON payload format.
- Mock the HTTP request (print "Sending to cloud..." with payload).
- **Goal**: See structured JSON data in logs.

## Technical Constraints
- Use Python 3.9+.
- Keep code modular (separate files for detector, reader, main loop).
- Use `poetry` or `venv` for dependency management.
- **Video Source**: I will provide a `test_video.mp4` file.

## Output
At the end of each phase, please provide the full code for the modified files so I can run it immediately.
