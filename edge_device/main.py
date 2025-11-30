import yaml
import logging
import sys
import time
from core.video_processor import MockVideoProcessor
from transmission.cloud_client import CloudClient

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)

def load_config(path="config/device_config.yaml"):
    with open(path, 'r') as f:
        return yaml.safe_load(f)

def main():
    try:
        config = load_config()
        logger.info(f"Loaded configuration for device: {config['locationId']}")
        
        client = CloudClient(config)
        
        if config.get('simulationMode', False):
            processor = MockVideoProcessor(config, client)
        else:
            # Real processor would go here
            logger.error("Real VideoProcessor not implemented yet. Use simulationMode: true")
            return

        try:
            processor.start()
        except KeyboardInterrupt:
            processor.stop()
            
    except Exception as e:
        logger.error(f"Fatal error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
