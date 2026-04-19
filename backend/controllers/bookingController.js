const crypto = require('crypto');
const Razorpay = require('razorpay');
const Booking = require('../models/Booking');
const { sendBookingNotification } = require('../services/notificationService');
const {
  buildBookingDate,
  buildAvailabilitySlots,
  bookingsOverlap,
  calculateBookingDetails,
  getDateRange,
  isActiveBooking
} = require('../utils/bookingUtils');

const PENDING_HOLD_MINUTES = 15;

const getRazorpayInstance = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay credentials are not configured');
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
};

const buildReceiptId = () => `hoc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const toDateOnlyString = (dateValue) => new Date(dateValue).toISOString().split('T')[0];

const releaseExpiredPendingBookings = async ({ roomType, date }) => {
  const expiryCutoff = new Date(Date.now() - PENDING_HOLD_MINUTES * 60 * 1000);
  const { start, end } = getDateRange(date);

  await Booking.updateMany(
    {
      roomType,
      date: { $gte: start, $lt: end },
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: { $lt: expiryCutoff }
    },
    {
      $set: {
        paymentStatus: 'failed',
        paymentFailureReason: 'Pending hold expired before payment completion'
      }
    }
  );
};

const getRoomBookingsForDate = async ({ roomType, date, excludeBookingId }) => {
  const { start, end } = getDateRange(date);
  const query = {
    roomType,
    date: { $gte: start, $lt: end }
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  return Booking.find(query).sort({ createdAt: 1 });
};

const findOverlappingBookings = (bookings, targetBooking) => (
  bookings.filter((booking) => isActiveBooking(booking) && bookingsOverlap(booking, targetBooking))
);

const sendNotificationSafely = async (payload) => {
  try {
    await sendBookingNotification(payload);
  } catch (error) {
    console.error('Notification error:', error.message);
  }
};

const validateRequiredBookingFields = ({
  customerName,
  phone,
  roomType,
  date,
  startTime,
  endTime
}) => {
  if (!customerName || !phone || !roomType || !date || !startTime || !endTime) {
    throw new Error('Please provide all required fields');
  }
};

// @desc    Get public slot availability for a room and date
// @route   GET /api/bookings/availability
// @access  Public
const getAvailability = async (req, res) => {
  try {
    const { roomType, date } = req.query;

    if (!roomType || !date) {
      return res.status(400).json({ message: 'roomType and date are required' });
    }

    await releaseExpiredPendingBookings({ roomType, date });
    const bookings = await getRoomBookingsForDate({ roomType, date });
    const activeBookings = bookings.filter(isActiveBooking);
    const slots = buildAvailabilitySlots(activeBookings);

    res.json({
      success: true,
      roomType,
      date,
      minimumDurationHours: 2,
      blockedRanges: activeBookings.map((booking) => ({
        id: booking._id,
        startTime: booking.startTime,
        endTime: booking.endTime,
        status: booking.status,
        paymentStatus: booking.paymentStatus
      })),
      availableSlots: slots.filter((slot) => slot.available),
      suggestedSlots: slots.slice(0, 8)
    });
  } catch (error) {
    if (error.message === 'Invalid booking date') {
      return res.status(400).json({ message: error.message });
    }

    console.error('Availability error:', error);
    res.status(500).json({ message: 'Server error while fetching availability' });
  }
};

// @desc    Create Razorpay order and initialize booking
// @route   POST /api/bookings/create-order
// @access  Public
const createBookingOrder = async (req, res) => {
  try {
    const {
      customerName,
      phone,
      email,
      specialRequests,
      roomType,
      date,
      startTime,
      endTime,
      addons = []
    } = req.body;

    validateRequiredBookingFields({ customerName, phone, roomType, date, startTime, endTime });

    const bookingDate = buildBookingDate(date);
    await releaseExpiredPendingBookings({ roomType, date });

    const pricing = calculateBookingDetails({ roomType, startTime, endTime, addons });
    const razorpay = getRazorpayInstance();
    const existingBookings = await getRoomBookingsForDate({ roomType, date });
    const overlappingBookings = findOverlappingBookings(existingBookings, { startTime, endTime });

    const retryBooking = overlappingBookings.find(
      (booking) =>
        booking.customerName === customerName &&
        booking.phone === phone &&
        booking.status === 'pending' &&
        booking.paymentStatus === 'pending'
    );

    const hardConflict = overlappingBookings.find((booking) => {
      if (!retryBooking) {
        return true;
      }

      return booking._id.toString() !== retryBooking._id.toString();
    });
    if (hardConflict) {
      const isPaidConflict = hardConflict.status === 'confirmed' && hardConflict.paymentStatus === 'completed';
      const conflictMessage = isPaidConflict
        ? 'This time slot overlaps with an already confirmed booking.'
        : 'This time slot is currently being held by another customer.';

      return res.status(409).json({ message: conflictMessage });
    }

    const order = await razorpay.orders.create({
      amount: pricing.totalAmount * 100,
      currency: 'INR',
      receipt: buildReceiptId(),
      notes: {
        customerName,
        phone,
        roomType,
        bookingDate: bookingDate.toISOString().split('T')[0]
      }
    });

    const bookingPayload = {
      customerName,
      phone,
      email: email || undefined,
      specialRequests: specialRequests || undefined,
      roomType,
      date: bookingDate,
      startTime,
      endTime,
      duration: pricing.duration,
      basePrice: pricing.basePrice,
      extraHours: pricing.extraHours,
      extraCharge: pricing.extraCharge,
      addons,
      totalAmount: pricing.totalAmount,
      paymentStatus: 'pending',
      status: 'pending',
      razorpayOrderId: order.id,
      razorpayPaymentId: undefined,
      paymentFailureReason: undefined
    };

    let booking;
    if (retryBooking) {
      retryBooking.set(bookingPayload);
      booking = await retryBooking.save();
    } else {
      booking = await Booking.create(bookingPayload);
    }

    await sendNotificationSafely({
      subject: `Pending booking created for ${booking.roomType}`,
      booking
    });

    res.status(201).json({
      success: true,
      key: process.env.RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      orderId: order.id,
      bookingId: booking._id,
      bookingDetails: {
        customerName,
        phone,
        email,
        specialRequests,
        roomType,
        date,
        startTime,
        endTime,
        addons,
        totalAmount: pricing.totalAmount
      }
    });
  } catch (error) {
    if (
      [
        'Minimum booking duration is 2 hours',
        'End time must be after start time',
        'Invalid room type selected',
        'Invalid booking date',
        'Please provide all required fields'
      ].includes(error.message)
    ) {
      return res.status(400).json({ message: error.message });
    }

    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error while creating payment order' });
  }
};

// @desc    Verify Razorpay payment signature and confirm booking
// @route   POST /api/bookings/verify-payment
// @access  Public
const verifyPayment = async (req, res) => {
  try {
    const {
      bookingId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    if (!bookingId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Missing payment verification fields' });
    }

    const booking = await Booking.findById(bookingId);
    const razorpay = getRazorpayInstance();
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({ message: 'Order ID mismatch' });
    }

    await releaseExpiredPendingBookings({
      roomType: booking.roomType,
      date: toDateOnlyString(booking.date)
    });

    const conflictingBookings = await getRoomBookingsForDate({
      roomType: booking.roomType,
      date: toDateOnlyString(booking.date),
      excludeBookingId: booking._id
    });

    const overlapConflict = findOverlappingBookings(conflictingBookings, booking)[0];
    if (overlapConflict) {
      booking.paymentStatus = 'failed';
      booking.paymentFailureReason = 'This slot was taken before payment verification completed';
      await booking.save();
      return res.status(409).json({ message: 'This slot is no longer available. Payment cannot be confirmed.' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      booking.paymentStatus = 'failed';
      booking.paymentFailureReason = 'Signature verification failed';
      await booking.save();
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    if (!payment || !['authorized', 'captured'].includes(payment.status)) {
      booking.paymentStatus = 'failed';
      booking.paymentFailureReason = payment?.error_description || 'Payment not authorized';
      await booking.save();
      return res.status(400).json({ message: 'Payment was not completed successfully' });
    }

    booking.paymentStatus = 'completed';
    booking.status = 'confirmed';
    booking.razorpayPaymentId = razorpay_payment_id;
    booking.paymentFailureReason = undefined;
    await booking.save();

    await sendNotificationSafely({
      subject: `Booking confirmed for ${booking.customerName}`,
      booking,
      includeCustomer: true
    });

    res.json({
      success: true,
      message: 'Payment verified successfully',
      booking: {
        bookingId: booking._id,
        customerName: booking.customerName,
        phone: booking.phone,
        email: booking.email,
        roomType: booking.roomType,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        addons: booking.addons,
        totalAmount: booking.totalAmount
      }
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ message: 'Server error while verifying payment' });
  }
};

// @desc    Mark payment as failed/cancelled by user
// @route   POST /api/bookings/payment-failed
// @access  Public
const markPaymentFailed = async (req, res) => {
  try {
    const { bookingId, reason } = req.body;

    if (!bookingId) {
      return res.status(400).json({ message: 'Booking ID is required' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.paymentStatus === 'completed') {
      return res.json({ success: true, message: 'Booking already paid' });
    }

    booking.paymentStatus = 'failed';
    booking.paymentFailureReason = reason || 'Payment was cancelled or failed';
    await booking.save();

    res.json({ success: true, message: 'Payment failure recorded' });
  } catch (error) {
    console.error('Payment failed handler error:', error);
    res.status(500).json({ message: 'Server error while updating payment status' });
  }
};

// @desc    Get all bookings (For Admin Dashboard)
// @route   GET /api/bookings
// @access  Private (Needs Auth)
const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({}).sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching bookings' });
  }
};

// @desc    Update a booking (For Admin Dashboard)
// @route   PUT /api/bookings/:id
// @access  Private (Needs Auth)
const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const existingBooking = await Booking.findById(id);

    if (!existingBooking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const mergedBooking = {
      customerName: req.body.customerName ?? existingBooking.customerName,
      phone: req.body.phone ?? existingBooking.phone,
      email: req.body.email ?? existingBooking.email,
      specialRequests: req.body.specialRequests ?? existingBooking.specialRequests,
      roomType: req.body.roomType ?? existingBooking.roomType,
      date: req.body.date ? buildBookingDate(req.body.date) : existingBooking.date,
      startTime: req.body.startTime ?? existingBooking.startTime,
      endTime: req.body.endTime ?? existingBooking.endTime,
      addons: req.body.addons ?? existingBooking.addons
    };

    const recalculatedDetails = calculateBookingDetails(mergedBooking);
    await releaseExpiredPendingBookings({
      roomType: mergedBooking.roomType,
      date: toDateOnlyString(mergedBooking.date)
    });

    const conflicts = await getRoomBookingsForDate({
      roomType: mergedBooking.roomType,
      date: toDateOnlyString(mergedBooking.date),
      excludeBookingId: existingBooking._id
    });

    const overlapConflict = findOverlappingBookings(conflicts, mergedBooking)[0];
    if (overlapConflict) {
      return res.status(409).json({ success: false, message: 'The updated time overlaps with another active booking.' });
    }

    existingBooking.set({
      customerName: mergedBooking.customerName,
      phone: mergedBooking.phone,
      email: mergedBooking.email || undefined,
      specialRequests: mergedBooking.specialRequests || undefined,
      roomType: mergedBooking.roomType,
      date: mergedBooking.date,
      startTime: mergedBooking.startTime,
      endTime: mergedBooking.endTime,
      addons: mergedBooking.addons,
      ...recalculatedDetails
    });

    await existingBooking.save();

    await sendNotificationSafely({
      subject: `Booking updated for ${existingBooking.customerName}`,
      booking: existingBooking,
      includeCustomer: true
    });

    res.json({ success: true, data: existingBooking });
  } catch (error) {
    if (
      [
        'Minimum booking duration is 2 hours',
        'End time must be after start time',
        'Invalid room type selected',
        'Invalid booking date'
      ].includes(error.message)
    ) {
      return res.status(400).json({ success: false, message: error.message });
    }

    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel a booking (For Admin Dashboard)
// @route   PATCH /api/bookings/:id/cancel
// @access  Private (Needs Auth)
const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findByIdAndUpdate(
      id,
      {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancellationReason: reason
      },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    await sendNotificationSafely({
      subject: `Booking cancelled for ${booking.customerName}`,
      booking,
      includeCustomer: true
    });

    res.json({ success: true, message: 'Booking cancelled', data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a booking permanently
// @route   DELETE /api/bookings/:id
// @access  Private (Needs Auth)
const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBooking = await Booking.findByIdAndDelete(id);

    if (!deletedBooking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.json({ success: true, message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle payment status between pending and completed
// @route   PATCH /api/bookings/:id/payment-status
// @access  Private (Needs Auth)
const togglePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const nextPaymentStatus = booking.paymentStatus === 'completed' ? 'pending' : 'completed';
    booking.paymentStatus = nextPaymentStatus;
    booking.status = nextPaymentStatus === 'completed' ? 'confirmed' : 'pending';

    if (nextPaymentStatus !== 'completed') {
      booking.razorpayPaymentId = undefined;
    }

    await booking.save();

    await sendNotificationSafely({
      subject: `Payment status updated for ${booking.customerName}`,
      booking,
      includeCustomer: nextPaymentStatus === 'completed'
    });

    res.json({
      success: true,
      message: `Payment status updated to ${nextPaymentStatus}`,
      data: booking
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Calendar Metadata
// @route   GET /api/bookings/calendar
// @access  Private (Needs Auth)
const getCalendarData = async (req, res) => {
  try {
    const { month, year } = req.query;
    if (!month || !year) return res.status(400).json({ success: false, message: 'Month and year required' });

    const startDate = new Date(Date.UTC(Number(year), Number(month) - 1, 1));
    const endDate = new Date(Date.UTC(Number(year), Number(month), 0, 23, 59, 59, 999));

    const bookings = await Booking.find({
      date: { $gte: startDate, $lte: endDate },
      status: { $ne: 'cancelled' }
    }).lean();

    const bookingsByDate = {};
    bookings.forEach((booking) => {
      const dateKey = booking.date.toISOString().split('T')[0];
      if (!bookingsByDate[dateKey]) {
        bookingsByDate[dateKey] = [];
      }
      bookingsByDate[dateKey].push(booking);
    });

    res.json({ success: true, data: bookingsByDate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Handle Razorpay webhooks
// @route   POST /api/bookings/webhook
// @access  Public
const razorpayWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return res.status(500).json({ message: 'Webhook secret is not configured' });
    }

    const signature = req.headers['x-razorpay-signature'];
    const rawBody = req.body;

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    if (!signature || expectedSignature !== signature) {
      return res.status(400).json({ message: 'Invalid webhook signature' });
    }

    const event = JSON.parse(rawBody.toString());

    if (event.event === 'payment.captured' || event.event === 'order.paid') {
      const paymentEntity = event.payload.payment?.entity;
      const orderId = paymentEntity?.order_id || event.payload.order?.entity?.id;
      const paymentId = paymentEntity?.id;

      if (orderId) {
        await Booking.findOneAndUpdate(
          { razorpayOrderId: orderId },
          {
            paymentStatus: 'completed',
            status: 'confirmed',
            ...(paymentId ? { razorpayPaymentId: paymentId } : {})
          }
        );
      }
    }

    if (event.event === 'payment.failed') {
      const paymentEntity = event.payload.payment?.entity;
      const orderId = paymentEntity?.order_id;
      const failureReason = paymentEntity?.error_description || 'Payment failed';

      if (orderId) {
        await Booking.findOneAndUpdate(
          { razorpayOrderId: orderId },
          {
            paymentStatus: 'failed',
            paymentFailureReason: failureReason
          }
        );
      }
    }

    res.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
};

module.exports = {
  createBookingOrder,
  verifyPayment,
  markPaymentFailed,
  getAvailability,
  getBookings,
  updateBooking,
  cancelBooking,
  deleteBooking,
  togglePaymentStatus,
  getCalendarData,
  razorpayWebhook
};
