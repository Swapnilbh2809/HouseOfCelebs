require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const connectDB = require('./config/db');
const Booking = require('./models/Booking');
const { razorpayWebhook } = require('./controllers/bookingController');
const { ensureBootstrapAdmin } = require('./controllers/authController');

const app = express();
const passport = require('./auth/googleAuth');
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

app.set('trust proxy', 1);

// Middleware
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true
  })
);
app.use(cookieParser());
app.post('/api/bookings/webhook', express.raw({ type: 'application/json' }), razorpayWebhook);
app.use(express.json()); // Allows parsing JSON bodies

// Express Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'houseofcelebs_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Basic route to test server
app.get('/', (req, res) => {
  res.send('House of Celebs API is running...');
});

// Import Routes
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const userRoutes = require('./routes/userRoutes');
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/user', userRoutes);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await Booking.syncIndexes();
    await ensureBootstrapAdmin();

    app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
