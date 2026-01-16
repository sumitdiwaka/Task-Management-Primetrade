const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token for secure sessions [cite: 17, 28, 33]
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc Register new user
exports.registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const user = await User.create({ name, email, password });
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id) // Send token to frontend [cite: 33]
        });
    } catch (error) {
    console.log("REGISTRATION ERROR:", error); // Check your terminal for this!
    res.status(500).json({ message: error.message });
}
};

// @desc Login user
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Update user profile
exports.updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            if (req.body.password) {
                user.password = req.body.password;
            }
            const updatedUser = await user.save();
            res.json({ _id: updatedUser._id, name: updatedUser.name, email: updatedUser.email });
        }
    } catch (error) {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc Delete user account
exports.deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.user._id);
        // Also delete all tasks associated with this user
        const Task = require('../models/Task');
        await Task.deleteMany({ user: req.user._id });
        res.json({ message: 'User and all tasks deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};