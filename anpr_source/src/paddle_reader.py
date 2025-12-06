from paddleocr import PaddleOCR
import logging
import re

# Suppress PaddleOCR logging
logging.getLogger("ppocr").setLevel(logging.ERROR)

# Mapping for common misclassifications
DICT_CHAR_TO_NUM = {
    'O': '0', 'I': '1', 'J': '3', 'A': '4', 'G': '6', 'S': '5', 'Z': '2', 'B': '8', 'T': '7'
}
DICT_NUM_TO_CHAR = {
    '0': 'O', '1': 'I', '3': 'J', '4': 'A', '6': 'G', '5': 'S', '2': 'Z', '8': 'B'
}

class PaddleLicenseReader:
    def __init__(self, lang='en'):
        """
        Initialize the PaddleLicenseReader.
        :param lang: Language code (default 'en').
        """
        print("Loading PaddleOCR model...")
        # use_angle_cls=True enables orientation classification (useful for rotated plates)
        self.ocr = PaddleOCR(use_angle_cls=True, lang=lang)

    def format_license(self, text):
        """
        Format the license plate text according to standard UK format (Likely 2001+ format: LLNN LLL).
        Applies character mapping to correct common OCR errors.
        """
        # Remove non-alphanumeric characters
        text = re.sub(r'[^a-zA-Z0-9]', '', text).upper()
        
        # Check for standard UK format length (7 chars)
        if len(text) != 7:
            return text

        # Convert to list for mutability
        text_list = list(text)
        
        # Expected format: L L N N L L L
        # Indices:         0 1 2 3 4 5 6
        
        # Positions 0, 1, 4, 5, 6 should be Letters
        for i in [0, 1, 4, 5, 6]:
            if text_list[i] in DICT_NUM_TO_CHAR:
                text_list[i] = DICT_NUM_TO_CHAR[text_list[i]]
        
        # Positions 2, 3 should be Numbers
        for i in [2, 3]:
            if text_list[i] in DICT_CHAR_TO_NUM:
                text_list[i] = DICT_CHAR_TO_NUM[text_list[i]]
                
        return "".join(text_list)

    def read_text(self, image, det=True, enable_logic=False):
        """
        Read text from an image.
        :param image: Input image (vehicle crop or plate crop).
        :param det: Whether to use Paddle's text detector. Set False if image is already a cropped plate.
        :param enable_logic: Whether to apply UK format logic/correction.
        :return: List of tuples [(text, confidence, box), ...]
        """
        # PaddleOCR returns a list of lists (one per image passed)
        # Structure: [[[[x1,y1],[x2,y2]...], ("text", conf)], ...]
        # If det=False, structure might be simpler (just list of tuples), so we handle that.
        if det:
            result = self.ocr.ocr(image, det=True, cls=True)
        else:
            # Rec only mode
            result = self.ocr.ocr(image, det=False, cls=True)
        
        detections = []
        
        raw_detections = []
        
        if det:
            # Standard mode (Det + Rec)
            if result and result[0]:
                for line in result[0]:
                    box = line[0]
                    text_info = line[1]
                    text = text_info[0]
                    confidence = text_info[1]
                    raw_detections.append((text, confidence, box))
        else:
            # Rec only mode (result is usually [[('text', conf), ...]]) or just [('text', conf)] depending on version
            if result and result[0]:
                 # Warning: logic might vary slightly by version, let's assume standard list of tuples
                 for item in result:  
                     if isinstance(item, list): # handle batch if wrapped
                         for subitem in item:
                             text = subitem[0]
                             confidence = subitem[1]
                             raw_detections.append((text, confidence, None))
                     elif isinstance(item, tuple):
                         text = item[0]
                         confidence = item[1]
                         raw_detections.append((text, confidence, None))

        # Post-process detections
        for text, confidence, box in raw_detections:
            if confidence > 0.5:
                if enable_logic:
                    text = self.format_license(text)
                detections.append((text, confidence, box))
        
        return detections
