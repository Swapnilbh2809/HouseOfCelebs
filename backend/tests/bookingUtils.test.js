const test = require('node:test');
const assert = require('node:assert/strict');
const {
  buildAvailabilitySlots,
  bookingsOverlap,
  calculateBookingDetails,
  parseTime
} = require('../utils/bookingUtils');

test('parseTime converts 12-hour time to minutes correctly', () => {
  assert.equal(parseTime('12:00 AM'), 0);
  assert.equal(parseTime('10:30 AM'), 630);
  assert.equal(parseTime('12:15 PM'), 735);
  assert.equal(parseTime('11:45 PM'), 1425);
});

test('calculateBookingDetails enforces minimum duration and pricing', () => {
  const pricing = calculateBookingDetails({
    roomType: 'silver',
    startTime: '10:00 AM',
    endTime: '01:30 PM',
    addons: ['cake', 'fog']
  });

  assert.equal(pricing.duration, 4);
  assert.equal(pricing.extraHours, 2);
  assert.equal(pricing.basePrice, 1599);
  assert.equal(pricing.extraCharge, 1000);
  assert.equal(pricing.totalAmount, 1599 + 1000 + 699 + 499);
});

test('bookingsOverlap detects true overlaps and ignores touching edges', () => {
  assert.equal(
    bookingsOverlap(
      { startTime: '10:00 AM', endTime: '12:30 PM' },
      { startTime: '11:00 AM', endTime: '01:00 PM' }
    ),
    true
  );

  assert.equal(
    bookingsOverlap(
      { startTime: '10:00 AM', endTime: '12:00 PM' },
      { startTime: '12:00 PM', endTime: '02:00 PM' }
    ),
    false
  );
});

test('buildAvailabilitySlots marks conflicting 2-hour slots unavailable', () => {
  const slots = buildAvailabilitySlots([
    { startTime: '10:00 AM', endTime: '12:00 PM', status: 'confirmed', paymentStatus: 'completed' }
  ]);

  const blockedSlot = slots.find((slot) => slot.label === '10:00 AM - 12:00 PM');
  const freeSlot = slots.find((slot) => slot.label === '12:00 PM - 02:00 PM');

  assert.equal(blockedSlot.available, false);
  assert.equal(freeSlot.available, true);
});
