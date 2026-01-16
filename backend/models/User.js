const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePicture: { type: String, default: "" } 
}, { timestamps: true });

// Security: Hash password before saving to database 
userSchema.pre('save', async function () {
    // If the password isn't being changed, just stop here
    if (!this.isModified('password')) return;

    // Generate a "salt" (security layer)
    const salt = await bcrypt.genSalt(10);
    
    // Hash the password
    this.password = await bcrypt.hash(this.password, salt);
    
    // Notice: NO next() here! Mongoose handles it automatically for async functions.
});

// Helper: Check if entered password matches hashed password [cite: 41]
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);