// In-memory data store providing seamless fallback when MongoDB is not running
// Implements Mongoose-compatible query interfaces (countDocuments, find, findOne, findOneAndUpdate, insertMany, create, save)

class MemoryRecord {
    constructor(data, store) {
        Object.assign(this, data);
        Object.defineProperty(this, '_store', { value: store, enumerable: false, writable: true });
    }

    async save() {
        if (this._store && this._id) {
            this.updatedAt = new Date();
            this._store.set(this._id, this);
        }
        return this;
    }
}

class QueryHelper {
    constructor(executor) {
        this.executor = executor;
        this._sort = null;
        this._limit = null;
    }

    sort(sortObj) {
        this._sort = sortObj;
        return this;
    }

    limit(num) {
        this._limit = num;
        return this;
    }

    async then(resolve, reject) {
        try {
            const result = await this.executor(this._sort, this._limit);
            resolve(result);
        } catch (err) {
            reject ? reject(err) : Promise.reject(err);
        }
    }
}

// 1. Library Seats Store
const libraryStore = new Map();

const LibrarySeatMemory = {
    async countDocuments(filter = {}) {
        if (!filter || Object.keys(filter).length === 0) {
            return libraryStore.size;
        }
        let count = 0;
        for (const item of libraryStore.values()) {
            let match = true;
            for (const [key, val] of Object.entries(filter)) {
                if (item[key] !== val) { match = false; break; }
            }
            if (match) count++;
        }
        return count;
    },

    find(filter = {}) {
        return new QueryHelper(async (sortObj, limitNum) => {
            let results = [];
            for (const item of libraryStore.values()) {
                let match = true;
                for (const [key, val] of Object.entries(filter)) {
                    if (item[key] !== val) { match = false; break; }
                }
                if (match) results.push(new MemoryRecord(item, libraryStore));
            }

            if (sortObj) {
                const [sortField, sortOrder] = Object.entries(sortObj)[0] || ['seatId', 1];
                results.sort((a, b) => {
                    if (a[sortField] < b[sortField]) return sortOrder === -1 ? 1 : -1;
                    if (a[sortField] > b[sortField]) return sortOrder === -1 ? -1 : 1;
                    return 0;
                });
            }

            if (typeof limitNum === 'number' && limitNum > 0) {
                results = results.slice(0, limitNum);
            }

            return results;
        });
    },

    findOne(filter = {}) {
        return new QueryHelper(async (sortObj) => {
            const results = await LibrarySeatMemory.find(filter).sort(sortObj);
            return results.length > 0 ? results[0] : null;
        });
    },

    async findOneAndUpdate(query, update, options = {}) {
        let found = null;
        for (const item of libraryStore.values()) {
            if (query.seatId && item.seatId === query.seatId) {
                found = item;
                break;
            }
        }

        if (found) {
            Object.assign(found, update);
            found.updatedAt = new Date();
            libraryStore.set(found._id, found);
            return new MemoryRecord(found, libraryStore);
        } else if (options.upsert) {
            const newItem = {
                _id: query.seatId || `lib_${Date.now()}_${Math.random()}`,
                seatId: query.seatId,
                status: update.status || 'available',
                confidence: update.confidence !== undefined ? update.confidence : 1.0,
                detectedAt: update.detectedAt || new Date(),
                createdAt: new Date(),
                updatedAt: new Date()
            };
            libraryStore.set(newItem._id, newItem);
            return new MemoryRecord(newItem, libraryStore);
        }
        return null;
    },

    async insertMany(docs) {
        const created = [];
        for (const doc of docs) {
            const id = doc.seatId || `lib_${Date.now()}_${Math.random()}`;
            const record = {
                _id: id,
                seatId: doc.seatId,
                status: doc.status || 'available',
                confidence: doc.confidence !== undefined ? doc.confidence : 1.0,
                detectedAt: doc.detectedAt || new Date(),
                createdAt: new Date(),
                updatedAt: new Date()
            };
            libraryStore.set(id, record);
            created.push(new MemoryRecord(record, libraryStore));
        }
        return created;
    }
};

// 2. Parking Slots Store
const parkingStore = new Map();

const ParkingSlotMemory = {
    async countDocuments(filter = {}) {
        if (!filter || Object.keys(filter).length === 0) {
            return parkingStore.size;
        }
        let count = 0;
        for (const item of parkingStore.values()) {
            let match = true;
            for (const [key, val] of Object.entries(filter)) {
                if (item[key] !== val) { match = false; break; }
            }
            if (match) count++;
        }
        return count;
    },

    find(filter = {}) {
        return new QueryHelper(async (sortObj, limitNum) => {
            let results = [];
            for (const item of parkingStore.values()) {
                let match = true;
                for (const [key, val] of Object.entries(filter)) {
                    if (item[key] !== val) { match = false; break; }
                }
                if (match) results.push(new MemoryRecord(item, parkingStore));
            }

            if (sortObj) {
                const [sortField, sortOrder] = Object.entries(sortObj)[0] || ['slotId', 1];
                results.sort((a, b) => {
                    if (a[sortField] < b[sortField]) return sortOrder === -1 ? 1 : -1;
                    if (a[sortField] > b[sortField]) return sortOrder === -1 ? -1 : 1;
                    return 0;
                });
            }

            if (typeof limitNum === 'number' && limitNum > 0) {
                results = results.slice(0, limitNum);
            }

            return results;
        });
    },

    findOne(filter = {}) {
        return new QueryHelper(async (sortObj) => {
            const results = await ParkingSlotMemory.find(filter).sort(sortObj);
            return results.length > 0 ? results[0] : null;
        });
    },

    async findOneAndUpdate(query, update, options = {}) {
        let found = null;
        for (const item of parkingStore.values()) {
            if (query.slotId && item.slotId === query.slotId) {
                found = item;
                break;
            }
        }

        if (found) {
            Object.assign(found, update);
            found.updatedAt = new Date();
            parkingStore.set(found._id, found);
            return new MemoryRecord(found, parkingStore);
        } else if (options.upsert) {
            const newItem = {
                _id: query.slotId || `park_${Date.now()}_${Math.random()}`,
                slotId: query.slotId,
                status: update.status || 'available',
                confidence: update.confidence !== undefined ? update.confidence : 1.0,
                detectedAt: update.detectedAt || new Date(),
                createdAt: new Date(),
                updatedAt: new Date()
            };
            parkingStore.set(newItem._id, newItem);
            return new MemoryRecord(newItem, parkingStore);
        }
        return null;
    },

    async insertMany(docs) {
        const created = [];
        for (const doc of docs) {
            const id = doc.slotId || `park_${Date.now()}_${Math.random()}`;
            const record = {
                _id: id,
                slotId: doc.slotId,
                status: doc.status || 'available',
                confidence: doc.confidence !== undefined ? doc.confidence : 1.0,
                detectedAt: doc.detectedAt || new Date(),
                createdAt: new Date(),
                updatedAt: new Date()
            };
            parkingStore.set(id, record);
            created.push(new MemoryRecord(record, parkingStore));
        }
        return created;
    }
};

// 3. Occupancy Store
const occupancyList = [];

const OccupancyMemory = {
    async create(doc) {
        const item = {
            _id: `occ_${Date.now()}_${Math.random()}`,
            facility: doc.facility,
            total: doc.total,
            occupied: doc.occupied,
            available: doc.available,
            occupancyPercentage: doc.occupancyPercentage,
            timestamp: doc.timestamp || new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
        };
        occupancyList.unshift(item); // latest first
        if (occupancyList.length > 500) {
            occupancyList.length = 500;
        }
        return item;
    },

    find(query = {}) {
        return new QueryHelper(async (sortObj, limitNum) => {
            let results = [...occupancyList];
            if (query.facility) {
                results = results.filter(r => r.facility === query.facility);
            }

            if (sortObj && sortObj.timestamp) {
                const order = sortObj.timestamp;
                results.sort((a, b) => {
                    const ta = new Date(a.timestamp).getTime();
                    const tb = new Date(b.timestamp).getTime();
                    return order === -1 ? tb - ta : ta - tb;
                });
            }

            if (typeof limitNum === 'number' && limitNum > 0) {
                results = results.slice(0, limitNum);
            }

            return results;
        });
    }
};

module.exports = {
    LibrarySeatMemory,
    ParkingSlotMemory,
    OccupancyMemory
};
