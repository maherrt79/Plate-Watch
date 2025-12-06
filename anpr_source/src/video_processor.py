import cv2
import os

class VideoProcessor:
    def __init__(self, source=0):
        """
        Initialize the VideoProcessor.
        :param source: Path to video file or webcam index (default 0).
        """
        self.cap = cv2.VideoCapture(source)
        if not self.cap.isOpened():
            raise ValueError(f"Could not open video source: {source}")
        
        # Get video properties
        self.width = int(self.cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        self.height = int(self.cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        self.fps = self.cap.get(cv2.CAP_PROP_FPS)
        
        print(f"Video Source Opened: {source}")
        print(f"Resolution: {self.width}x{self.height}")
        print(f"FPS: {self.fps}")

    def get_frame(self):
        """
        Read a single frame from the video source.
        :return: (ret, frame) - ret is True if frame is read correctly, False otherwise.
        """
        return self.cap.read()

    def release(self):
        """
        Release the video source.
        """
        self.cap.release()
