const mongoose = require('mongoose');

const occupancySchema = new mongoose.Schema({
    facility: {
        type: String,
        enum: ['library', 'parking'],
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    occupied: {
        type: Number,
        required: true
    },
    available: {
        type: Number,
        required: true
    },
    occupancyPercentage: {
        type: Number,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const MongoOccupancy = mongoose.model('Occupancy', occupancySchema);
const { OccupancyMemory } = require('./memoryStore');

const OccupancyProxy = new Proxy(MongoOccupancy, {
    get(target, prop) {
        if (mongoose.connection.readyState === 1) {
            return target[prop];
        }
        if (prop in OccupancyMemory) {
            return OccupancyMemory[prop];
        }
        return target[prop];
    }
});

module.exports = OccupancyProxy;
