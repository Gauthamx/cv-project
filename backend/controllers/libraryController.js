const LibrarySeat = require('../models/Library');
const Occupancy = require('../models/Occupancy');

// @desc    Get current library status
// @route   GET /api/library
exports.getLibraryStatus = async (req, res) => {
    try {
        const totalSeats = await LibrarySeat.countDocuments();
        const occupiedSeats = await LibrarySeat.countDocuments({ status: 'occupied' });
        const availableSeats = Math.max(0, totalSeats - occupiedSeats);
        
        let occupancyPercentage = 0;
        if (totalSeats > 0) {
            occupancyPercentage = Math.round((occupiedSeats / totalSeats) * 100);
        }

        // Get the latest detected time from any seat
        const latestSeat = await LibrarySeat.findOne().sort({ detectedAt: -1 });

        res.json({
            totalSeats,
            occupiedSeats,
            availableSeats,
            occupancyPercentage,
            lastUpdated: latestSeat && latestSeat.detectedAt ? latestSeat.detectedAt : new Date()
        });
    } catch (error) {
        console.error('getLibraryStatus error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get all library seats status
// @route   GET /api/library/seats
exports.getLibrarySeats = async (req, res) => {
    try {
        const seats = await LibrarySeat.find().sort({ seatId: 1 });
        res.json(seats);
    } catch (error) {
        console.error('getLibrarySeats error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update library seat status (used by Vision system)
// @route   POST /api/library/update
exports.updateLibrarySeats = async (req, res) => {
    try {
        const { seats } = req.body;
        
        if (!seats || !Array.isArray(seats)) {
            return res.status(400).json({ message: 'Invalid format. Expected array of seats.' });
        }

        for (const seat of seats) {
            await LibrarySeat.findOneAndUpdate(
                { seatId: seat.seatId },
                { 
                    status: seat.status,
                    confidence: seat.confidence !== undefined ? seat.confidence : 1.0,
                    detectedAt: new Date()
                },
                { upsert: true, new: true }
            );
        }

        // Save Occupancy Record
        const totalSeats = await LibrarySeat.countDocuments();
        const occupiedSeats = await LibrarySeat.countDocuments({ status: 'occupied' });
        
        await Occupancy.create({
            facility: 'library',
            total: totalSeats,
            occupied: occupiedSeats,
            available: Math.max(0, totalSeats - occupiedSeats),
            occupancyPercentage: totalSeats > 0 ? Math.round((occupiedSeats / totalSeats) * 100) : 0,
            timestamp: new Date()
        });

        res.json({ message: 'Library status updated successfully' });
    } catch (error) {
        console.error('updateLibrarySeats error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
