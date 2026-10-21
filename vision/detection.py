import os
try:
    from ultralytics import YOLO
except ImportError:
    YOLO = None

class ObjectDetector:
    def __init__(self, model_path="models/best.pt", conf_thresh=0.5):
        """
        Initialize the YOLO object detector.
        """
        self.model_path = model_path
        self.conf_thresh = conf_thresh
        self.model = None
        
        if YOLO is None:
            print("[CampusVision AI] WARNING: ultralytics package not installed. Running in mock detection mode.")
            return

        if not os.path.exists(self.model_path):
            print(f"[CampusVision AI] Custom model not found at '{self.model_path}'.")
            print("[CampusVision AI] Falling back to standard pretrained 'yolov8n.pt'...")
            try:
                self.model = YOLO("yolov8n.pt")
                print("[CampusVision AI] Loaded pretrained YOLOv8n model.")
            except Exception as e:
                print(f"[CampusVision AI] Notice: Could not load yolov8n.pt ({e}). Mock detection will be used.")
        else:
            try:
                self.model = YOLO(self.model_path)
                print(f"[CampusVision AI] Loaded custom YOLO model from {self.model_path}")
            except Exception as e:
                print(f"[CampusVision AI] Error loading model from {self.model_path}: {e}")

    def detect(self, frame):
        """
        Run inference on a single frame.
        Returns a list of detections: [(x, y, w, h, conf, class_id), ...]
        """
        if self.model is None or frame is None:
            return []
            
        try:
            results = self.model(frame, conf=self.conf_thresh, verbose=False)
            
            detections = []
            for r in results:
                boxes = r.boxes
                for box in boxes:
                    # get box coordinates in (x, y, w, h) format
                    b = box.xywh[0].cpu().numpy()
                    x, y, w, h = int(b[0] - b[2]/2), int(b[1] - b[3]/2), int(b[2]), int(b[3])
                    conf = float(box.conf[0])
                    cls = int(box.cls[0])
                    
                    detections.append((x, y, w, h, conf, cls))
                    
            return detections
        except Exception as e:
            print(f"[CampusVision AI] Detection inference error: {e}")
            return []
