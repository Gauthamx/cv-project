import cv2
import time
import os

class Camera:
    def __init__(self, source=0):
        """
        Initialize the camera module.
        :param source: integer (for webcam) or string (for IP camera / video file)
        """
        self.source = source
        self.cap = None

        # On Windows, try cv2.CAP_DSHOW for faster, more reliable webcam opening
        if isinstance(self.source, int) and os.name == 'nt':
            self.cap = cv2.VideoCapture(self.source, cv2.CAP_DSHOW)
            if not self.cap.isOpened():
                self.cap = cv2.VideoCapture(self.source)
        else:
            self.cap = cv2.VideoCapture(self.source)
        
        if not self.cap or not self.cap.isOpened():
            raise ValueError(f"Unable to open camera source: {self.source}")
            
    def get_frame(self):
        """
        Capture a single frame from the camera.
        """
        if not self.cap or not self.cap.isOpened():
            return None
        ret, frame = self.cap.read()
        if not ret:
            return None
        return frame
        
    def release(self):
        """
        Release the camera resource.
        """
        if self.cap and self.cap.isOpened():
            self.cap.release()
            
    def reconnect(self):
        """
        Attempt to reconnect to the camera source.
        """
        self.release()
        time.sleep(2)
        if isinstance(self.source, int) and os.name == 'nt':
            self.cap = cv2.VideoCapture(self.source, cv2.CAP_DSHOW)
            if not self.cap.isOpened():
                self.cap = cv2.VideoCapture(self.source)
        else:
            self.cap = cv2.VideoCapture(self.source)
