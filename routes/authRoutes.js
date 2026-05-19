const express = require('express');
const router = express.Router();
const { registerUser, authUser, getStudents } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', authUser);
router.get('/students', protect, getStudents);

module.exports = router;
