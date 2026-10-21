const mongoose = require('mongoose');
const os = require('os');

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

// @desc    Get system status
// @route   GET /api/status
exports.getSystemStatus = (req, res) => {
    const localIp = getLocalIp();
    const port = process.env.PORT || 5000;
    res.json({
        status: 'online',
        database: mongoose.connection.readyState === 1 ? 'mongodb' : 'in-memory',
        demoMode: process.env.DEMO_MODE === 'true',
        networkIp: localIp,
        networkUrl: `http://${localIp}:${port}`,
        timestamp: new Date()
    });
};
