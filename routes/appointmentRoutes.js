const express = require('express');
const router = express.Router();
const { getSlots, bookAppointment, getMyAppointments, cancelAppointment } = require('../controllers/appointmentController');
const { protect } = require('../middleware/authMiddleware');

router.get('/slots', getSlots);
router.route('/').post(protect, bookAppointment).get(protect, getMyAppointments);
router.route('/:id/cancel').put(protect, cancelAppointment);

module.exports = router;
