# ANPR Feature Documentation

This document details the advanced features implemented in the ANPR (Automatic Number Plate Recognition) Edge Application to improve accuracy, robustness, and performance.

Each feature includes an explanation of the problem it solves, the solution logic, implementation details, and examples.

---

## 1. Resolution Weighting
**Trusting the "Closest" View**

### 🔴 The Problem
In a video stream, a vehicle appears small when far away and grows larger as it approaches the camera. OCR models (like PaddleOCR) often produce "high confidence" garbage readings on small, blurry plates (e.g., reading "8888" on a blurry grill). If a system processes 10 distant frames and only 1 close-up frame, the 10 bad readings can outvote the 1 good reading.

### 🟢 The Solution
We weight each "vote" by the **pixel area** of the license plate crop. A frame where the plate is 200x60 pixels is worth significantly more than a frame where it is 50x15 pixels.

### ⚙️ Implementation
- **Formula**: `Weight = Plate_Area / Reference_Area` (Reference is set to 5000px).
- **Logic**:
    ```python
    weight = (width * height) / 5000.0
    final_score = confidence * weight
    ```
- **Code Reference**: `check_exiting_vehicles` in `main.py`.

### 📝 Example
- **Frame 1 (Far)**: "AB12 BAD" (Conf: 0.90, Area: 1000px) -> **Score: 0.18**
- **Frame 2 (Close)**: "AB12 GUD" (Conf: 0.80, Area: 10000px) -> **Score: 1.60**
- **Result**: Frame 2 wins easily, despite lower raw OCR confidence.

---

## 2. Confidence-Weighted Voting
**Trusting the "Surest" Read**

### 🔴 The Problem
Standard "Majority Voting" counts every occurrence as 1 vote. A reading of "AB12 CDE" with 51% confidence (barely detected) counts the same as one with 99% confidence.

### 🟢 The Solution
Instead of counting occurrences, we sum the **confidence scores** of all reads.

### ⚙️ Implementation
- **Logic**:
    ```python
    vote_scores[text] = vote_scores.get(text, 0) + confidence
    ```
- **Code Reference**: `check_exiting_vehicles` in `main.py`.

### 📝 Example
- Read 1: "X" (Conf 0.4)
- Read 2: "X" (Conf 0.4)
- Read 3: "Y" (Conf 0.9)
- **Majority Vote**: "X" wins (2 vs 1).
- **Weighted Vote**: "Y" wins (Score 0.9 vs 0.8).

---

## 3. Character-Level Voting (Positional Consensus)
**Reconstructing the Perfect Plate**

### 🔴 The Problem
Sometimes, no single frame captures the *entire* plate perfectly.
- Frame 1: Glare obscures the first letter ("_B12 CDE").
- Frame 2: Shadow obscures the last letter ("AB12 CD_").
- Frame 3: Motion blur makes 'B' look like '8' ("A812 CDE").

A plate-level vote might fail or return a wrong result because the "perfect" string never appeared as a whole.

### 🟢 The Solution
Since the UK format is standard (7 characters), we can vote on **each character position separately** (Index 0 to 6). We look at all frames and find the "consensus" character for column 0, column 1, etc.

### ⚙️ Implementation
- **Logic**:
    Iterate `i` from 0 to 6:
    1. Collect character at `text[i]` from all valid reads.
    2. Sum scores for each candidate character.
    3. Pick the winner for position `i`.
    4. Concatenate winners to form `Consensus_String`.
- **Code Reference**: `check_exiting_vehicles` in `main.py`.

### 📝 Example
- Read 1: **A**B12 CD**X**
- Read 2: **8**B12 CD**E**
- Read 3: **A**B12 CD**E**
- **Pos 0**: 'A' (Score 2.0), '8' (Score 1.0) -> Winner **A**
- **Pos 6**: 'E' (Score 2.0), 'X' (Score 1.0) -> Winner **E**
- **Result**: **AB12 CDE** (Correctly reconstructs the plate).

---

## 4. Positional Character Correction
**Context-Aware OCR Correction**

### 🔴 The Problem
OCR often confuses visually similar characters:
- '0' (Zero) vs 'O' (Letter O)
- '1' (One) vs 'I' (Letter I)
- '8' (Eight) vs 'B' (Letter B)

### 🟢 The Solution
We use the strict syntax of UK plates (**LLNN LLL**) to force corrections.
- If a character at index 0 or 1 (Letters) is '0', it **must** be 'O'.
- If a character at index 2 or 3 (Numbers) is 'I', it **must** be '1'.

### ⚙️ Implementation
- **Logic**:
    ```python
    dict_num_to_char = {'0': 'O', '1': 'I', ...}
    for i in [0, 1, 4, 5, 6]: # Letter positions
        if text[i] in dict_num_to_char: replace...
    ```
- **Code Reference**: `validate_and_clean_plate` in `main.py`.

---

## 5. Global Frame Skipping
**Optimizing Performance**

### 🔴 The Problem
Running YOLO detection + Tracking + OCR on every single video frame (30 FPS) is computationally expensive and unnecessary. Vehicles don't move that fast.

### 🟢 The Solution
We process only every Nth frame (e.g., every 5th or 7th frame). This linearly increases speed (7x faster) with minimal loss in tracking accuracy.

### ⚙️ Implementation
- **Logic**:
    ```python
    if frame_count % FRAME_SKIP_RATE != 0:
        continue
    ```
- **Code Reference**: Main loop in `main.py`.

---

## 6. OCR Logic Layer (Logic Reader)
**Deep Regex Integration**

### 🔴 The Problem
Some OCR errors occur because of the engine's ambiguity (e.g., classifying a fuzzy '6' as a 'G'). Standard post-processing pipelines might miss these if they operate only on the *final* string.

### 🟢 The Solution
We integrated a post-processing "Logic Layer" directly into the `PaddleLicenseReader` classification step. This layer enforces character mapping based on the known valid characters for each position in a standard 7-character UK plate (`LLNN LLL`).

### ⚙️ Implementation
- **Flag**: `ENABLE_OCR_LOGIC_LAYER` in `main.py`.
- **Logic**:
    Does a per-character regex validation and swap:
    - Position 2,3 (Expected Numbers): Swaps 'G'->'6', 'Z'->'2', 'O'->'0', etc.
    - Position 0,1,4,5,6 (Expected Letters): Swaps '6'->'G', '2'->'Z', '0'->'O', etc.

---

## 7. YOLO11 Plate Detection
**State-of-the-Art Detection**

### 🔴 The Problem
Older detection models (Haar Cascades or standard YOLOv8) sometimes produced loose bounding boxes or failed to detect plates in challenging lighting/crop conditions, leading to missing characters in OCR (e.g., cutting off the first letter).

### 🟢 The Solution
We upgraded the plate detector to use a fine-tuned **YOLO11** model (`yolo11n-plate.pt`). This model is lighter, faster, and provides significantly tighter and more accurate bounding boxes, ensuring the entire plate text is passed to the OCR engine.

### ⚙️ Implementation
- **Model used**: `yolo11n-plate.pt`
- **Code Reference**: `YoloPlateDetector` class in `src/plate_yolo_detector.py`.

---

## References & Inspiration
1. **ROVER (Recognizer Output Voting Error Reduction)**: A standard technique in ASR (Speech Recognition) and OCR used to combine outputs from multiple systems. [Fiscus, J. G. (1997)](https://ieeexplore.ieee.org/document/659110)
2. **Levenshtein Distance**: Used implicitly in our logic to align strings (conceptually), though we enforce fixed length for efficiency. [Levenshtein, V. I. (1966)](https://en.wikipedia.org/wiki/Levenshtein_distance)
3. **UK Number Plate Format**: DVLA specifications used for the Regex and Positional corrections. [Gov.uk Displaying Number Plates](https://www.gov.uk/displaying-number-plates)
4. **YOLO (You Only Look Once)**: Real-time object detection system.
