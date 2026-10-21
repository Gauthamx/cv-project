const express = require('express');
const router = express.Router();
const { getParkingStatus, getParkingSlots, updateParkingSlots } = require('../controllers/parkingController');

router.get('/', getParkingStatus);
router.get('/slots', getParkingSlots);
router.post('/update', updateParkingSlots);

module.exports = router;
