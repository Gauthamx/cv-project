const mongoose = require('mongoose');

const librarySeatSchema = new mongoose.Schema({
    seatId: {
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

const MongoLibrarySeat = mongoose.model('LibrarySeat', librarySeatSchema);
const { LibrarySeatMemory } = require('./memoryStore');

const LibrarySeatProxy = new Proxy(MongoLibrarySeat, {
    get(target, prop) {
        if (mongoose.connection.readyState === 1) {
            return target[prop];
        }
        if (prop in LibrarySeatMemory) {
            return LibrarySeatMemory[prop];
        }
        return target[prop];
    }
});

module.exports = LibrarySeatProxy;
