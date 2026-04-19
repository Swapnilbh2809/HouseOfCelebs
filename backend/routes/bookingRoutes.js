const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/authMiddleware');
const {
  createBookingOrder,
  verifyPayment,
  markPaymentFailed,
  getAvailability,
  getBookings,
  updateBooking,
  cancelBooking,
  deleteBooking,
  togglePaymentStatus,
  getCalendarData
} = require('../controllers/bookingController');

// Payment routes
router.get('/availability', getAvailability);
router.post('/create-order', createBookingOrder);
router.post('/verify-payment', verifyPayment);
router.post('/payment-failed', markPaymentFailed);

// Route for getting all bookings (Admin)
router.get('/', requireAuth, requireRole('admin'), getBookings);

// Administrative edit routes
router.put('/:id', requireAuth, requireRole('admin'), updateBooking);
router.patch('/:id/cancel', requireAuth, requireRole('admin'), cancelBooking);
router.patch('/:id/payment-status', requireAuth, requireRole('admin'), togglePaymentStatus);
router.delete('/:id', requireAuth, requireRole('admin'), deleteBooking);

// Calendar grouping endpoint
router.get('/calendar', requireAuth, requireRole('admin'), getCalendarData);

module.exports = router;
