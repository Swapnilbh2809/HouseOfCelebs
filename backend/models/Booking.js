const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    customerName: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true
    },
    phone: {
        type: String,
        required: [true, 'Please add a phone number']
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    roomType: {
        type: String,
        enum: ['bronze', 'silver', 'gold', 'platinum'],
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    basePrice: {
        type: Number,
        required: true
    },
    extraHours: {
        type: Number,
        default: 0
    },
    extraCharge: {
        type: Number,
        default: 0
    },
    addons: [{
        type: String
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled'],
        default: 'pending'
    },
    cancellationReason: {
        type: String
    },
    specialRequests: {
        type: String,
        trim: true
    },
    cancelledAt: {
        type: Date
    },
    razorpayOrderId: {
        type: String
    },
    razorpayPaymentId: {
        type: String
    },
    paymentFailureReason: {
        type: String
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

bookingSchema.index({ roomType: 1, date: 1, status: 1, paymentStatus: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
