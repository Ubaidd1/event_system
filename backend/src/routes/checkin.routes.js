const express = require('express');
const { processCheckIn, getCheckInHistory } = require('../controllers/checkinController');
const { verifyJWT } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(verifyJWT);

router.post('/', processCheckIn);
router.get('/history', getCheckInHistory);

module.exports = router;
