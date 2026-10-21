const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const path = require('path');
const os = require('os');

// Models
const LibrarySeat = require('./models/Library');
const ParkingSlot = require('./models/Parking');
const Occupancy = require('./models/Occupancy');

// Load config
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/library', require('./routes/libraryRoutes'));
app.use('/api/parking', require('./routes/parkingRoutes'));
app.use('/api/occupancy', require('./routes/occupancyRoutes'));
app.use('/api/status', require('./routes/statusRoutes'));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// Clean URL routing for pages
app.get('/dashboard', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'dashboard.html'));
});

app.get('/architecture', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'architecture.html'));
});

// JSON 404 for undefined /api routes
app.all('/api/*', (req, res) => {
    res.status(404).json({ message: 'API route not found' });
});

// Catch-all web route -> index.html
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'index.html'));
});

const PORT = process.env.PORT || 5000;
const DEMO_MODE = process.env.DEMO_MODE !== 'false';

function getLocalIp() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return '127.0.0.1';
}

const startServer = async () => {
    await connectDB();
    
    app.listen(PORT, async () => {
        const localIp = getLocalIp();
        console.log(`==================================================`);
        console.log(`👁️  CampusVision Server is Running!`);
        console.log(`   - Local:    http://localhost:${PORT}`);
        console.log(`   - Network:  http://${localIp}:${PORT} (Mobile QR access)`);
        console.log(`   - API:      http://localhost:${PORT}/api/status`);
        console.log(`==================================================`);
        
        if (DEMO_MODE) {
            console.log('[CampusVision] DEMO MODE ENABLED - Initializing simulated data');
            await initDemoData();
            setInterval(updateDemoData, 5000); // Update every 5 seconds
        }
    });
};

startServer();

// Demo Mode Logic
async function initDemoData() {
    try {
        // Initialize 100 library seats
        const libCount = await LibrarySeat.countDocuments();
        if (libCount === 0) {
            const seats = [];
            for (let i = 1; i <= 100; i++) {
                seats.push({
                    seatId: `L${String(i).padStart(3, '0')}`,
                    status: Math.random() > 0.5 ? 'occupied' : 'available',
                    confidence: 0.95,
                    detectedAt: new Date()
                });
            }
            await LibrarySeat.insertMany(seats);
            console.log(`[CampusVision] Initialized 100 library seats`);
        }

        // Initialize 40 parking slots
        const parkCount = await ParkingSlot.countDocuments();
        if (parkCount === 0) {
            const slots = [];
            for (let i = 1; i <= 40; i++) {
                slots.push({
                    slotId: `P${String(i).padStart(2, '0')}`,
                    status: Math.random() > 0.5 ? 'occupied' : 'available',
                    confidence: 0.98,
                    detectedAt: new Date()
                });
            }
            await ParkingSlot.insertMany(slots);
            console.log(`[CampusVision] Initialized 40 parking slots`);
        }

        // Record initial occupancy snapshot
        await recordOccupancySnapshot();
    } catch (err) {
        console.error('[CampusVision] Failed to initialize demo data:', err);
    }
}

async function recordOccupancySnapshot() {
    try {
        const totalSeats = await LibrarySeat.countDocuments();
        const occupiedSeats = await LibrarySeat.countDocuments({ status: 'occupied' });
        await Occupancy.create({
            facility: 'library',
            total: totalSeats,
            occupied: occupiedSeats,
            available: totalSeats - occupiedSeats,
            occupancyPercentage: totalSeats > 0 ? Math.round((occupiedSeats / totalSeats) * 100) : 0,
            timestamp: new Date()
        });

        const totalSlots = await ParkingSlot.countDocuments();
        const occupiedSlots = await ParkingSlot.countDocuments({ status: 'occupied' });
        await Occupancy.create({
            facility: 'parking',
            total: totalSlots,
            occupied: occupiedSlots,
            available: totalSlots - occupiedSlots,
            occupancyPercentage: totalSlots > 0 ? Math.round((occupiedSlots / totalSlots) * 100) : 0,
            timestamp: new Date()
        });
    } catch (err) {
        console.error('[CampusVision] Failed to record occupancy snapshot:', err);
    }
}

async function updateDemoData() {
    try {
        const seats = await LibrarySeat.find();
        const slots = await ParkingSlot.find();

        // Change 1-4 random library seats
        if (seats && seats.length > 0) {
            const numSeatsToChange = Math.floor(Math.random() * 4) + 1;
            for (let i = 0; i < numSeatsToChange; i++) {
                const randomIdx = Math.floor(Math.random() * seats.length);
                const seat = seats[randomIdx];
                seat.status = seat.status === 'occupied' ? 'available' : 'occupied';
                seat.detectedAt = new Date();
                await seat.save();
            }
        }

        // Change 1-3 random parking slots
        if (slots && slots.length > 0) {
            const numSlotsToChange = Math.floor(Math.random() * 3) + 1;
            for (let i = 0; i < numSlotsToChange; i++) {
                const randomIdx = Math.floor(Math.random() * slots.length);
                const slot = slots[randomIdx];
                slot.status = slot.status === 'occupied' ? 'available' : 'occupied';
                slot.detectedAt = new Date();
                await slot.save();
            }
        }

        // Record history snapshot
        await recordOccupancySnapshot();
    } catch(err) {
        console.error('[CampusVision] Demo data update failed:', err);
    }
}
