const basePricings = { bronze: 999, silver: 1599, gold: 2499, platinum: 3499 };
const addOnMap = { nameplate: 299, drinks: 199, fog: 499, cake: 699 };
const MIN_BOOKING_DURATION_MINUTES = 120;
const SLOT_INTERVAL_MINUTES = 30;
const BUSINESS_OPEN_MINUTES = 9 * 60;
const BUSINESS_CLOSE_MINUTES = 23 * 60;

const parseTime = (timeStr) => {
  const [time, period] = timeStr.trim().split(' ');
  let [hours, minutes] = time.split(':').map(Number);

  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  return hours * 60 + minutes;
};

const formatTime = (totalMinutes) => {
  const normalizedMinutes = ((totalMinutes % (24 * 60)) + (24 * 60)) % (24 * 60);
  const period = normalizedMinutes >= 12 * 60 ? 'PM' : 'AM';
  let hours = Math.floor(normalizedMinutes / 60) % 12;
  const minutes = normalizedMinutes % 60;

  if (hours === 0) {
    hours = 12;
  }

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;
};

const buildBookingDate = (dateInput) => {
  const bookingDate = new Date(`${dateInput}T00:00:00.000Z`);

  if (Number.isNaN(bookingDate.getTime())) {
    throw new Error('Invalid booking date');
  }

  return bookingDate;
};

const getDateRange = (dateInput) => {
  const start = buildBookingDate(dateInput);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);

  return { start, end };
};

const calculateBookingDetails = ({ roomType, startTime, endTime, addons = [] }) => {
  const startTotal = parseTime(startTime);
  const endTotal = parseTime(endTime);
  const durationMinutes = endTotal - startTotal;

  if (startTotal >= endTotal) {
    throw new Error('End time must be after start time');
  }

  if (durationMinutes < MIN_BOOKING_DURATION_MINUTES) {
    throw new Error('Minimum booking duration is 2 hours');
  }

  const duration = Math.ceil(durationMinutes / 60);
  const extraHours = Math.max(0, duration - 2);
  const basePrice = basePricings[roomType];

  if (!basePrice) {
    throw new Error('Invalid room type selected');
  }

  const extraCharge = extraHours * 500;
  const addonsCost = addons.reduce((acc, id) => acc + (addOnMap[id] || 0), 0);
  const totalAmount = basePrice + extraCharge + addonsCost;

  return {
    duration,
    extraHours,
    basePrice,
    extraCharge,
    totalAmount
  };
};

const getBookingWindow = ({ startTime, endTime }) => ({
  startMinutes: parseTime(startTime),
  endMinutes: parseTime(endTime)
});

const bookingsOverlap = (left, right) => {
  const leftWindow = getBookingWindow(left);
  const rightWindow = getBookingWindow(right);

  return leftWindow.startMinutes < rightWindow.endMinutes && rightWindow.startMinutes < leftWindow.endMinutes;
};

const isActiveBooking = (booking) => booking.status !== 'cancelled' && booking.paymentStatus !== 'failed';

const buildAvailabilitySlots = (bookings) => {
  const activeBookings = bookings.filter(isActiveBooking);
  const slots = [];

  for (
    let startMinutes = BUSINESS_OPEN_MINUTES;
    startMinutes <= BUSINESS_CLOSE_MINUTES - MIN_BOOKING_DURATION_MINUTES;
    startMinutes += SLOT_INTERVAL_MINUTES
  ) {
    const candidate = {
      startTime: formatTime(startMinutes),
      endTime: formatTime(startMinutes + MIN_BOOKING_DURATION_MINUTES)
    };

    const isAvailable = !activeBookings.some((booking) => bookingsOverlap(candidate, booking));

    slots.push({
      ...candidate,
      label: `${candidate.startTime} - ${candidate.endTime}`,
      available: isAvailable
    });
  }

  return slots;
};

module.exports = {
  addOnMap,
  basePricings,
  MIN_BOOKING_DURATION_MINUTES,
  SLOT_INTERVAL_MINUTES,
  buildBookingDate,
  buildAvailabilitySlots,
  bookingsOverlap,
  calculateBookingDetails,
  formatTime,
  getBookingWindow,
  getDateRange,
  isActiveBooking,
  parseTime
};
