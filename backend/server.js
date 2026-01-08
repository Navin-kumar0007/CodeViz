require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db'); // 
const codeRoutes = require('./routes/codeRoutes'); 
const userRoutes = require('./routes/userRoutes');
const snippetRoutes = require('./routes/snippetRoutes');

// 1. Connect to Database
connectDB();

const app = express();

// 2. Middleware
app.use(cors());
app.use(express.json());

// 3. Routes
// This keeps your existing CodeViz engine working!
app.use('/', codeRoutes); 
app.use('/api/users', userRoutes);
app.use('/api/snippets', snippetRoutes);

// 4. Test Route
app.get('/', (req, res) => {
    res.send('API is running...');
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});