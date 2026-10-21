try:
    import cv2
except ImportError:
    cv2 = None

def preprocess_frame(frame, width=640, height=480):
    """
    Preprocess the frame for YOLO detection.
    Includes resizing and optional filtering (e.g., histogram equalization)
    if lighting conditions are poor.
    """
    if frame is None or cv2 is None:
        return frame
        
    # Resize frame
    resized_frame = cv2.resize(frame, (width, height))
    return resized_frame

def define_roi(frame, rois):
    """
    Draw Regions of Interest (ROIs) on the frame for debugging/visualization.
    rois: dict mapping id to (x, y, w, h)
    """
    if frame is None or cv2 is None:
        return frame

    for roi_id, (x, y, w, h) in rois.items():
        cv2.rectangle(frame, (x, y), (x+w, y+h), (255, 0, 0), 2)
        cv2.putText(frame, str(roi_id), (x, y-5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 1)
        
    return frame

def draw_occupancy_overlay(frame, rois, occupancy_status, detections=None):
    """
    Draw color-coded ROIs (Green for available, Red for occupied)
    and optional YOLO detection boxes on the frame.
    """
    if frame is None or cv2 is None:
        return frame
        
    annotated = frame.copy()
    
    # 1. Draw detection boxes (thin cyan / yellow)
    if detections:
        for det in detections:
            dx, dy, dw, dh, conf, cls = det
            cv2.rectangle(annotated, (dx, dy), (dx + dw, dy + dh), (255, 255, 0), 1)
            label = f"Class {cls} {int(conf * 100)}%"
            cv2.putText(annotated, label, (dx, dy - 4), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 0), 1)

    # 2. Draw ROIs with occupancy color
    for roi_id, (rx, ry, rw, rh) in rois.items():
        info = occupancy_status.get(roi_id, {'status': 'available'})
        is_occupied = info.get('status') == 'occupied'
        
        # Red if occupied, Green if available
        color = (0, 0, 220) if is_occupied else (0, 200, 0)
        status_text = "OCCUPIED" if is_occupied else "AVAILABLE"
        
        cv2.rectangle(annotated, (rx, ry), (rx + rw, ry + rh), color, 2)
        cv2.putText(annotated, f"{roi_id}: {status_text}", (rx, ry - 6),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.45, color, 1)
                    
    return annotated
