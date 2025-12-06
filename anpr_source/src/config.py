
# --- Configuration & Constants ---
VIDEO_PATH = "tests/test_video.mp4"
FRAME_SKIP_RATE = 7  # Process every Nth frame. Higher = Faster but less smooth.
UK_REGEX = r"^[A-Z]{2}[0-9]{2}\s?[A-Z]{3}$"

# --- Benchmarking / Feature Flags ---
ENABLE_RESOLUTION_WEIGHTING = True # Trust larger plates more (Score = Conf * Area)
ENABLE_CONFIDENCE_WEIGHTING = True # Trust higher confidence more. If False, counts 1 vote per read.
ENABLE_POSITIONAL_VOTING    = True # Check for consensus character-by-character
ENABLE_CHAR_CORRECTION      = True # Fix common OCR errors (0->O, 1->I, etc.)
ENABLE_OCR_LOGIC_LAYER      = True # Enable internal Logic Reader (Auto-correct G->6, etc. in Reader)
ENABLE_STRICT_REGEX         = True # Discard plates that don't match UK format

# Vehicle Colors (BGR)
COLOR_CAR = (0, 255, 0)      # Green
COLOR_TRUCK = (0, 255, 255)  # Yellow
COLOR_BUS = (255, 0, 0)      # Blue
COLOR_DEFAULT = (255, 255, 255)

def get_vehicle_color(class_id):
    """Returns the BGR color tuple for a given vehicle class ID."""
    if class_id == 2: return COLOR_CAR
    if class_id == 7: return COLOR_TRUCK
    if class_id == 5: return COLOR_BUS
    return COLOR_DEFAULT
