import requests
import json
import time
import logging

logger = logging.getLogger(__name__)

class CloudClient:
    def __init__(self, config):
        self.api_url = config['apiEndpoint']
        self.api_key = config['apiKey']
        self.headers = {
            "x-api-key": self.api_key,
            "Content-Type": "application/json"
        }

    def send_sighting(self, payload):
        url = f"{self.api_url}/sightings/"
        try:
            response = requests.post(url, headers=self.headers, json=payload, timeout=5)
            if response.status_code == 201:
                logger.info(f"Successfully sent sighting: {payload['plateNumber']}")
                return True
            else:
                logger.error(f"Failed to send sighting. Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            logger.error(f"Error sending sighting: {str(e)}")
            return False
