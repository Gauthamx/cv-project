const mongoose = require('mongoose');

const parkingSlotSchema = new mongoose.Schema({
    slotId: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['available', 'occupied'],
        default: 'available'
    },
    confidence: {
        type: Number,
        default: 1.0
    },
    detectedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const MongoParkingSlot = mongoose.model('ParkingSlot', parkingSlotSchema);
const { ParkingSlotMemory } = require('./memoryStore');

const ParkingSlotProxy = new Proxy(MongoParkingSlot, {
    get(target, prop) {
        if (mongoose.connection.readyState === 1) {
            return target[prop];
        }
        if (prop in ParkingSlotMemory) {
            return ParkingSlotMemory[prop];
        }
        return target[prop];
    }
});

module.exports = ParkingSlotProxy;
