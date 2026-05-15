const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Booking = require('../models/Booking');
const verifyUserToken = require('../middleware/verifyUserToken');

// GET /api/user/me
router.get('/me', verifyUserToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('name email avatar role');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/user/bookings
router.get('/bookings', verifyUserToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const bookings = await Booking.find({ email: user.email }).sort({ date: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/user/bookings/:id/cancel
router.post('/bookings/:id/cancel', verifyUserToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.email !== user.email) return res.status(403).json({ error: 'Unauthorized' });
    
    const bookingDate = new Date(booking.date);
    const [hours, minutes] = booking.startTime.split(':');
    bookingDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0);
    
    const timeDiff = bookingDate.getTime() - Date.now();
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    
    if (hoursDiff < 24) {
      return res.status(400).json({ error: 'Cannot cancel within 24 hours of the booking time' });
    }
    
    booking.status = 'cancelled';
    booking.cancellationReason = 'Cancelled by user';
    booking.cancelledAt = new Date();
    await booking.save();
    
    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
