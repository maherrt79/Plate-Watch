import easyocr
import cv2

class LicenseReader:
    def __init__(self, languages=['en']):
        """
        Initialize the LicenseReader with EasyOCR.
        :param languages: List of languages to support (default ['en']).
        """
        print("Loading EasyOCR model...")
        self.reader = easyocr.Reader(languages)

    def preprocess_image(self, image):
        """
        Preprocess the image to improve OCR accuracy.
        :param image: Input image.
        :return: Preprocessed image.
        """
        # 1. Upscale the image (2x)
        image = cv2.resize(image, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)
        
        # 2. Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # 3. Apply Otsu's thresholding
        # This automatically finds the best threshold value to separate foreground/background
        _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        return binary

    def read_text(self, image_crop):
        """
        Read text from an image crop.
        :param image_crop: Cropped image containing the vehicle or plate.
        :return: List of tuples [(text, confidence), ...]
        """
        # Preprocess the image
        processed_image = self.preprocess_image(image_crop)
        
        # EasyOCR returns a list of tuples: (bbox, text, confidence)
        results = self.reader.readtext(processed_image)
        
        detections = []
        for (bbox, text, prob) in results:
            if prob > 0.3: # Filter low confidence
                detections.append((text, prob))
        
        return detections
