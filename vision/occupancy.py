def calculate_occupancy(detections, rois, iou_threshold=0.3):
    """
    Determine which ROIs (seats/slots) are occupied based on detections.
    detections: list of (x, y, w, h, conf, class_id)
    rois: dict mapping seat/slot ID to (x, y, w, h)
    
    Returns a dict mapping ID to {'status': 'occupied'/'available', 'confidence': float}
    """
    status_map = {}
    
    # Initialize all as available
    for roi_id in rois.keys():
        status_map[roi_id] = {
            'status': 'available',
            'confidence': 1.0
        }
        
    # Simple bounding box overlap logic
    for det in detections:
        dx, dy, dw, dh, conf, cls = det
        
        # In a real scenario, calculate Intersection over Union (IoU)
        # between detection and ROI. Here we use a simpler centroid check for demonstration.
        center_x = dx + dw / 2
        center_y = dy + dh / 2
        
        for roi_id, (rx, ry, rw, rh) in rois.items():
            # If the center of the detection is within the ROI
            if rx <= center_x <= rx + rw and ry <= center_y <= ry + rh:
                status_map[roi_id] = {
                    'status': 'occupied',
                    'confidence': float(conf)
                }
                break
                
    return status_map
