require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// ✅ CORS Configuration
app.use(cors({
  origin: [
    'https://rath-wale-indore.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Disposition']
}));

// ✅ Middleware
app.use(express.json());

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// ✅ Routes
const authRoutes = require('./routes/auth');
const entryRoutes = require('./routes/entries');

app.use('/api/auth', authRoutes);
app.use('/api/entries', entryRoutes);

// ✅ Default Route
app.get('/', (req, res) => {
  res.send('Bookkeeping API running');
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
