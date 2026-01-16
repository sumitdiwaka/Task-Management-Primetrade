require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db'); // 1. Import the db file
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');





// 2. Connect to Database
connectDB();

const app = express();
app.use(cors({
    origin: 'https://task-management-primetrade.vercel.app', // Paste your URL here
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json());

//  routes
app.use('/api/auth', authRoutes);

app.use('/api/tasks', taskRoutes);

app.get('/', (req, res) => {
    res.send('API is running and DB is connected!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));