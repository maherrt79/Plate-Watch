import yaml
import logging
import sys
import time
import warnings
import os

# Suppress Paddle/Ccache warnings
warnings.filterwarnings("ignore", category=UserWarning, module="paddle")
os.environ['PADDLE_NO_LOGGING'] = '1' # Suppress Paddle C++ logs

# Configure logging IMMEDIATELY
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)],
    force=True
)
logger = logging.getLogger(__name__)

from core.video_processor import MockVideoProcessor
from transmission.cloud_client import CloudClient

# Re-assert logging level after imports (in case libraries messed it up)
logging.getLogger().setLevel(logging.INFO)
# Ensure root handlers are present
if not logging.getLogger().handlers:
    logging.getLogger().addHandler(logging.StreamHandler(sys.stdout))

def load_config(path="config/device_config.yaml"):
    with open(path, 'r') as f:
        return yaml.safe_load(f)

import argparse

# ... existing imports ...

def main():
    # Parse CLI Arguments
    parser = argparse.ArgumentParser(description="Plate-Watch Edge Device")
    parser.add_argument("--mode", choices=['camera', 'video', 'mock'], help="Run mode: camera, video, or mock")
    args = parser.parse_args()

    try:
        config = load_config()
        logger.info(f"Loaded configuration for device: {config['locationId']}")
        
        client = CloudClient(config)
        
        # Determine Input Mode (CLI > Config > Default)
        if args.mode:
            mode_map = {'camera': 'WEBCAM', 'video': 'VIDEO', 'mock': 'MOCK'}
            input_mode = mode_map[args.mode.lower()]
            logger.info(f"CLI Override: Mode set to {input_mode}")
        else:
            input_mode = config.get('inputMode', 'MOCK').upper()
            
            # Backwards compatibility
            if config.get('simulationMode', False) is True:
                input_mode = 'MOCK'

        print(f"[SYSTEM] Starting Edge Device in {input_mode} mode...") # Immediate feedback
        logger.info(f"Starting in {input_mode} mode")

        if input_mode == 'MOCK':
            processor = MockVideoProcessor(config, client)
        else:
            from core.video_processor import RealVideoProcessor
            
            # Handle source overrides
            if input_mode == 'WEBCAM':
                config['cameraSource'] = config.get('webcamIndex', 0)
            elif input_mode == 'VIDEO':
                pass # Use config['cameraSource'] as defined
                
            processor = RealVideoProcessor(config, client)

        try:
            processor.start()
        except KeyboardInterrupt:
            processor.stop()
            
    except Exception as e:
        logger.error(f"Fatal error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
