import time
import os
# pyrefly: ignore [missing-import]
import cv2
# pyrefly: ignore [missing-import]
from dotenv import load_dotenv

# pyrefly: ignore [missing-import]
import numpy as np

from camera import Camera
from preprocessing import preprocess_frame, define_roi
from detection import ObjectDetector
from occupancy import calculate_occupancy
from api_client import APIClient

# Load environment variables
load_dotenv()

MODEL_PATH = os.getenv("MODEL_PATH", "models/best.pt")
CONFIDENCE_THRESHOLD = float(os.getenv("CONFIDENCE_THRESHOLD", "0.5"))

# Dummy ROIs for demonstration
LIBRARY_ROIS = {
    "L001": (50, 50, 100, 100),
    "L002": (200, 50, 100, 100),
    "L003": (350, 50, 100, 100)
}

PARKING_ROIS = {
    "P01": (50, 200, 150, 250),
    "P02": (250, 200, 150, 250)
}

def main():
    print("Starting CampusVision AI Module...")
    
    # Initialize components
    detector = ObjectDetector(model_path=MODEL_PATH, conf_thresh=CONFIDENCE_THRESHOLD)
    api = APIClient()
    
    # For a real deployment, you'd use a camera index like 0, or an RTSP stream URL
    # We will simulate a loop here as a demonstration
    try:
        cam = Camera(0)
    except ValueError as e:
        print(f"Could not initialize camera: {e}")
        print("Running in simulation mode without real camera feed.")
        cam = None

    frame_count = 0
    
    while True:
        try:
            if cam:
                frame = cam.get_frame()
            else:
                # Create a dummy frame if no camera is available
                import numpy as np
                frame = np.zeros((480, 640, 3), dtype=np.uint8)

            processed_frame = preprocess_frame(frame)
            
            # Run detection
            detections = detector.detect(processed_frame)
            
            # Process library
            lib_occupancy = calculate_occupancy(detections, LIBRARY_ROIS)
            
            # Process parking
            park_occupancy = calculate_occupancy(detections, PARKING_ROIS)
            
            # Every ~5 seconds, send update to backend
            if frame_count % 150 == 0:  # Assuming ~30 fps
                api.update_library_status(lib_occupancy)
                api.update_parking_status(park_occupancy)
                
            frame_count += 1
            
            # (Optional) visualization for local debugging
            # if processed_frame is not None:
            #     vis_frame = define_roi(processed_frame, LIBRARY_ROIS)
            #     cv2.imshow("CampusVision Detection", vis_frame)
            #     if cv2.waitKey(1) & 0xFF == ord('q'):
            #         break

            time.sleep(0.033) # Simulating 30fps wait
            
        except KeyboardInterrupt:
            print("\nShutting down CampusVision AI Module.")
            break
        except Exception as e:
            print(f"Error in main loop: {e}")
            time.sleep(5) # Wait before retrying

    if cam:
        cam.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
