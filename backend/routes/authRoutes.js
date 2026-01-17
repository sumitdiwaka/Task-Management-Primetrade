const express = require('express');
const { registerUser, loginUser,updateUserProfile, deleteUser } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/register', registerUser); 
router.post('/login', loginUser);       
router.route('/profile').put(protect, updateUserProfile).delete(protect, deleteUser);
module.exports = router;