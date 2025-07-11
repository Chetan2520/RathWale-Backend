require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({
  origin: 'https://rath-wale-frontend-v52g-i42gsi010-chetan-mankers-projects.vercel.app', // Your frontend URL
  exposedHeaders: ['Content-Disposition']
}));
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)

.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

// Routes
const authRoutes = require('./routes/auth');
const entryRoutes = require('./routes/entries');

app.use('/api/auth', authRoutes);
app.use('/api/entries', entryRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('Bookkeeping API running');
});

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
