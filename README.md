# CampusVision 👁️

**AI-Powered Smart Campus Facility Availability System**

CampusVision is a full-stack real-time web application that tracks and displays the live availability of library study seats and campus parking spaces using computer vision and smart status analytics.

---

## 🌟 Key Features

- **Live Facility Availability Dashboard**: Real-time visualization of library seats and parking slots with occupancy percentages and instant status updates.
- **Smart QR Code Mobile Access**: Scan the QR code directly from your laptop screen using your smartphone to instantly monitor campus availability on your mobile browser.
- **Zero-Friction Demo Mode & Resilient In-Memory Storage**: Works immediately out-of-the-box! If MongoDB is not installed or running, the backend seamlessly falls back to a high-speed in-memory store with live simulation.
- **MongoDB Persistence**: Connects automatically to local MongoDB or MongoDB Atlas whenever available to persist status and historical analytics.
- **AI-Powered Computer Vision Module**: Python pipeline using OpenCV and YOLO object detection with fallback support to `yolov8n.pt` for real-time camera tracking.
- **RESTful API**: Fast and modular Node.js/Express API with historical occupancy tracking.

---

## 📁 System Architecture

```
Physical Camera Feed (or Simulation)
          ↓
OpenCV Preprocessing (DirectShow / Resizing / Contrast)
          ↓
YOLO Object Detection (YOLOv8 / Pretrained weights)
          ↓
Occupancy Analysis (Centroid ROI Mapping)
          ↓
REST API Ingestion (POST /api/library/update, POST /api/parking/update)
          ↓
MongoDB / In-Memory Resilient Store
          ↓
CampusVision Web Application & Mobile View
```

---

## 📂 Project Structure

```
campusvision/
├── backend/
│   ├── config/
│   │   └── db.js               # Resilient DB connection with fast timeout
│   ├── controllers/
│   │   ├── libraryController.js   # Library status & seat updates
│   │   ├── parkingController.js   # Parking status & slot updates
│   │   ├── occupancyController.js # Historical analytics
│   │   └── statusController.js    # System status & network IP
│   ├── models/
│   │   ├── Library.js          # Library seat model (Mongoose + Memory fallback)
│   │   ├── Parking.js          # Parking slot model (Mongoose + Memory fallback)
│   │   ├── Occupancy.js        # Occupancy history model
│   │   └── memoryStore.js      # In-memory query engine
│   ├── routes/
│   ├── package.json
│   └── server.js               # Express application entry
├── frontend/
│   ├── css/
│   │   ├── style.css           # Glassmorphism dark mode design system
│   │   └── responsive.css      # Mobile, tablet, & desktop responsive layouts
│   ├── js/
│   │   ├── api.js              # Environment-aware API client
│   │   ├── app.js              # Landing page logic & dynamic mobile QR code
│   │   └── dashboard.js        # Live polling, grids, & safe date formatting
│   ├── index.html              # Landing page
│   ├── dashboard.html          # Real-time facility availability dashboard
│   └── architecture.html       # System architecture documentation
├── vision/
│   ├── camera.py               # Robust webcam capture with Windows DirectShow
│   ├── preprocessing.py        # Frame normalization & ROI visualization
│   ├── detection.py            # YOLO detector with yolov8n fallback
│   ├── occupancy.py            # ROI centroid occupancy calculation
│   ├── api_client.py           # Backend sync client
│   ├── main.py                 # Vision pipeline loop with simulation mode
│   └── requirements.txt        # Python dependencies
├── .env                        # Root environment configuration
└── README.md
```

---

## 🚀 Quick Start Guide (Run In 30 Seconds)

You do **not** need MongoDB or Python installed just to run and test the complete application!

### Step 1: Start the Backend Server

Open your terminal (PowerShell or Command Prompt):

```bash
cd d:\PROJECT\campusvision\backend
npm start
```

You will see:
```text
👁️  CampusVision Server is Running!
   - Local:    http://localhost:5000
   - Network:  http://192.168.1.X:5000 (Mobile QR access)
   - API:      http://localhost:5000/api/status
```

### Step 2: Open in Your Browser

- **Home page**: [http://localhost:5000](http://localhost:5000)
- **Live Dashboard**: [http://localhost:5000/dashboard](http://localhost:5000/dashboard)
- **Architecture**: [http://localhost:5000/architecture](http://localhost:5000/architecture)

### Step 3: Scan on Mobile (Real-Time Campus Mobility)

Open the home page or dashboard on your laptop, and scan the QR code using your phone camera (ensure your phone is connected to the same Wi-Fi network). It will open the live dashboard directly on your smartphone!

---

## 🛠️ Complete Setup: What to Do to Make Everything Work

If you want to run the full production setup with persistent MongoDB and real-time AI webcam detection:

### 1. MongoDB Setup (Optional - for Persistent Storage)

The backend runs automatically in **In-Memory Mode** if MongoDB is offline. To persist data across server restarts:

#### Option A: Local MongoDB
1. Download and install [MongoDB Community Server](https://www.mongodb.com/try/download/community).
2. Start the MongoDB service.
3. The backend will detect MongoDB on `mongodb://127.0.0.1:27017/campusvision` and automatically use it.

#### Option B: Free Cloud Database (MongoDB Atlas)
1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Copy your connection string: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/campusvision`.
3. Open `backend/.env` and update:
   ```env
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/campusvision
   ```
4. Restart the server: `npm start`.

---

### 2. Python Computer Vision Module (Optional - for Real Camera AI)

To feed live video from a webcam or IP camera through the YOLO detection pipeline:

#### Step 1: Install Python
Ensure Python 3.9, 3.10, 3.11, or 3.12 is installed and added to your system `PATH` (check with `python --version`).

#### Step 2: Create a Virtual Environment and Install Dependencies
```bash
cd d:\PROJECT\campusvision\vision
python -m venv venv

# Windows:
venv\Scripts\activate

# Install dependencies:
pip install -r requirements.txt
```

#### Step 3: Run the Vision Pipeline
```bash
python main.py
```
- If a webcam is connected on index `0`, it captures live frames.
- If you have a custom trained YOLO model, place it at `vision/models/best.pt`.
- If no custom model is placed, it automatically loads `yolov8n.pt` or runs in simulation mode.
- Every 5 seconds, it sends live seat and slot occupancies to `http://localhost:5000/api/library/update` and `http://localhost:5000/api/parking/update`.
- Watch the web dashboard update live in response to the camera!

---

## 📡 REST API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/api/status` | Returns system status, database mode, and LAN IP |
| `GET`  | `/api/library` | Returns total, available, occupied library seats & last updated time |
| `GET`  | `/api/library/seats` | Returns status array for all individual seats (`L001` - `L100`) |
| `POST` | `/api/library/update` | Updates seat statuses (used by AI Vision module) |
| `GET`  | `/api/parking` | Returns total, available, occupied parking slots |
| `GET`  | `/api/parking/slots` | Returns status array for all individual slots (`P01` - `P40`) |
| `POST` | `/api/parking/update` | Updates slot statuses (used by AI Vision module) |
| `GET`  | `/api/occupancy` | Returns historical occupancy logs (`?facility=library&limit=20`) |

---

## 🐞 Summary of Errors Fixed

1. **MongoDB Connection Crash**:
   - *Problem*: Backend crashed immediately (`process.exit(1)`) on startup if MongoDB was not installed or running locally.
   - *Fix*: Created a dual-mode storage engine (`memoryStore.js`) and fast-timeout connection (`db.js`). The app boots instantly and functions 100% in resilient In-Memory mode without crashing.
2. **SPA Catch-All Route HTML Collision**:
   - *Problem*: `app.get('*')` returned `index.html` for missing `/api/*` endpoints and `/dashboard` without `.html`.
   - *Fix*: Added clean URL handlers for `/dashboard` and `/architecture`, plus a proper JSON 404 response for unknown `/api/*` routes.
3. **Frontend `Invalid Date` Exception**:
   - *Problem*: `dashboard.js` called `.toISOString()` on unvalidated date inputs, throwing `RangeError: Invalid time value` and triggering a false "Unable to connect" error.
   - *Fix*: Added safe timestamp parsing and defensive defaults in `updateTimeAgo()`.
4. **QR Code Generation Mobile Failure**:
   - *Problem*: QR code used `localhost:5000`, which fails when scanned on a mobile phone because phones treat `localhost` as themselves. Also, if the CDN failed, an uncaught error stopped the homepage stats from loading.
   - *Fix*: Server now broadcasts its local LAN IP (`192.168.x.x`), and `app.js` safely embeds the mobile-accessible network URL.
5. **Historical Occupancy Gap**:
   - *Problem*: Simulated updates in `server.js` never saved `Occupancy` records, leaving `/api/occupancy` empty.
   - *Fix*: Added automatic periodic snapshots to populate real-time trend analytics.
6. **Windows Camera Freeze**:
   - *Problem*: `cv2.VideoCapture(0)` on Windows could hang or fail without DirectShow.
   - *Fix*: Enabled `cv2.CAP_DSHOW` in `camera.py` with automatic fallback and synthetic frame simulation.
7. **Python Dependency Incompatibilities**:
   - *Problem*: Rigidly pinned packages (`ultralytics==8.0.200`, `numpy==1.26.1`) failed to build on modern Python.
   - *Fix*: Modernized requirements with compatible version ranges.
