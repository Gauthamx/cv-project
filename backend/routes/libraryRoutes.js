const express = require('express');
const router = express.Router();
const { getLibraryStatus, getLibrarySeats, updateLibrarySeats } = require('../controllers/libraryController');

router.get('/', getLibraryStatus);
router.get('/seats', getLibrarySeats);
router.post('/update', updateLibrarySeats);

module.exports = router;
