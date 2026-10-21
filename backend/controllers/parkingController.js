const ParkingSlot = require('../models/Parking');
const Occupancy = require('../models/Occupancy');

// @desc    Get current parking status
// @route   GET /api/parking
exports.getParkingStatus = async (req, res) => {
    try {
        const totalSlots = await ParkingSlot.countDocuments();
        const occupiedSlots = await ParkingSlot.countDocuments({ status: 'occupied' });
        const availableSlots = Math.max(0, totalSlots - occupiedSlots);
        
        let occupancyPercentage = 0;
        if (totalSlots > 0) {
            occupancyPercentage = Math.round((occupiedSlots / totalSlots) * 100);
        }

        const latestSlot = await ParkingSlot.findOne().sort({ detectedAt: -1 });

        res.json({
            totalSlots,
            occupiedSlots,
            availableSlots,
            occupancyPercentage,
            lastUpdated: latestSlot && latestSlot.detectedAt ? latestSlot.detectedAt : new Date()
        });
    } catch (error) {
        console.error('getParkingStatus error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get all parking slots status
// @route   GET /api/parking/slots
exports.getParkingSlots = async (req, res) => {
    try {
        const slots = await ParkingSlot.find().sort({ slotId: 1 });
        res.json(slots);
    } catch (error) {
        console.error('getParkingSlots error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update parking slot status (used by Vision system)
// @route   POST /api/parking/update
exports.updateParkingSlots = async (req, res) => {
    try {
        const { slots } = req.body;
        
        if (!slots || !Array.isArray(slots)) {
            return res.status(400).json({ message: 'Invalid format. Expected array of slots.' });
        }

        for (const slot of slots) {
            await ParkingSlot.findOneAndUpdate(
                { slotId: slot.slotId },
                { 
                    status: slot.status,
                    confidence: slot.confidence !== undefined ? slot.confidence : 1.0,
                    detectedAt: new Date()
                },
                { upsert: true, new: true }
            );
        }

        // Save Occupancy Record
        const totalSlots = await ParkingSlot.countDocuments();
        const occupiedSlots = await ParkingSlot.countDocuments({ status: 'occupied' });
        
        await Occupancy.create({
            facility: 'parking',
            total: totalSlots,
            occupied: occupiedSlots,
            available: Math.max(0, totalSlots - occupiedSlots),
            occupancyPercentage: totalSlots > 0 ? Math.round((occupiedSlots / totalSlots) * 100) : 0,
            timestamp: new Date()
        });

        res.json({ message: 'Parking status updated successfully' });
    } catch (error) {
        console.error('updateParkingSlots error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
