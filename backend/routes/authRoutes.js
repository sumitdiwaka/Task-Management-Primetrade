const express = require('express');
const { registerUser, loginUser,updateUserProfile, deleteUser } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/register', registerUser); // API: /api/auth/register [cite: 17]
router.post('/login', loginUser);       // API: /api/auth/login [cite: 17]
router.route('/profile').put(protect, updateUserProfile).delete(protect, deleteUser);
module.exports = router;