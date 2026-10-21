try:
    import requests
except ImportError:
    requests = None
import json
import time

class APIClient:
    def __init__(self, base_url="http://localhost:5000/api"):
        self.base_url = base_url
        if requests is None:
            print("[CampusVision APIClient] WARNING: 'requests' package is not installed. API sync disabled. Run: pip install requests")
        
    def update_library_status(self, occupancy_data):
        """
        Send updated library seats status to the backend.
        occupancy_data: dict mapping seat_id to {'status': '...', 'confidence': ...}
        """
        url = f"{self.base_url}/library/update"
        payload = {
            "seats": [
                {
                    "seatId": seat_id,
                    "status": info["status"],
                    "confidence": info["confidence"]
                }
                for seat_id, info in occupancy_data.items()
            ]
        }
        
        if requests is None:
            return

        try:
            headers = {'Content-Type': 'application/json'}
            response = requests.post(url, data=json.dumps(payload), headers=headers, timeout=5)
            response.raise_for_status()
            print(f"[{time.strftime('%X')}] Successfully updated Library status.")
        except requests.exceptions.RequestException as e:
            print(f"Error updating Library status: {e}")

    def update_parking_status(self, occupancy_data):
        """
        Send updated parking slots status to the backend.
        occupancy_data: dict mapping slot_id to {'status': '...', 'confidence': ...}
        """
        if requests is None:
            return

        url = f"{self.base_url}/parking/update"
        payload = {
            "slots": [
                {
                    "slotId": slot_id,
                    "status": info["status"],
                    "confidence": info["confidence"]
                }
                for slot_id, info in occupancy_data.items()
            ]
        }
        
        try:
            headers = {'Content-Type': 'application/json'}
            response = requests.post(url, data=json.dumps(payload), headers=headers, timeout=5)
            response.raise_for_status()
            print(f"[{time.strftime('%X')}] Successfully updated Parking status.")
        except requests.exceptions.RequestException as e:
            print(f"Error updating Parking status: {e}")
