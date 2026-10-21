const Occupancy = require('../models/Occupancy');

// @desc    Get historical occupancy records
// @route   GET /api/occupancy
exports.getOccupancy = async (req, res) => {
    try {
        const { facility, limit = 50 } = req.query;
        let query = {};
        
        if (facility) {
            query.facility = facility;
        }

        const records = await Occupancy.find(query)
            .sort({ timestamp: -1 })
            .limit(parseInt(limit, 10));

        res.json(records);
    } catch (error) {
        console.error('getOccupancy error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
