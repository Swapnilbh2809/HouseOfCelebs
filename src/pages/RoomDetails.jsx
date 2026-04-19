import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, LoaderCircle } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const RoomDetails = () => {
  const { type } = useParams();
  const navigate = useNavigate();

  const pkg = type === 'silver' ? {
    name: 'Silver Experience', price: 1599, decor: 'Flower + Balloon + Lights'
  } : {
    name: 'Bronze Experience', price: 999, decor: 'Balloon Decorations'
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState('');
  const [startH, setStartH] = useState('10');
  const [startM, setStartM] = useState('00');
  const [startP, setStartP] = useState('AM');
  const [endH, setEndH] = useState('01');
  const [endM, setEndM] = useState('00');
  const [endP, setEndP] = useState('PM');

  const [addons, setAddons] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [timeError, setTimeError] = useState('');
  const [availabilityError, setAvailabilityError] = useState('');
  const [duration, setDuration] = useState(0);
  const [availability, setAvailability] = useState({ blockedRanges: [], availableSlots: [], suggestedSlots: [] });
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [selectedSuggestedSlot, setSelectedSuggestedSlot] = useState('');

  const addOnOptions = [
    { id: 'nameplate', name: 'Nameplate', price: 299, emoji: '🎭' },
    { id: 'drinks', name: 'Premium Drinks', price: 199, emoji: '🥤' },
    { id: 'fog', name: 'Fog Entry', price: 499, emoji: '💨' },
    { id: 'cake', name: 'Chocolate Cake', price: 699, emoji: '🎂' },
  ];

  const onHourChange = (e, setter) => {
    let val = e.target.value;
    if (val === '') { setter(''); return; }
    let num = parseInt(val, 10);
    if (isNaN(num)) return;
    if (num > 12) num = 1;
    else if (num < 1) num = 12;
    setter(num.toString());
    setSelectedSuggestedSlot('');
  };

  const onMinuteChange = (e, setter) => {
    let val = e.target.value;
    if (val === '') { setter(''); return; }
    let num = parseInt(val, 10);
    if (isNaN(num)) return;
    if (num > 59) num = 0;
    else if (num < 0) num = 59;
    setter(num.toString().padStart(2, '0'));
    setSelectedSuggestedSlot('');
  };

  const formatTimeString = (hour, minute, period) => `${hour}:${minute.padStart(2, '0')} ${period}`;

  const parseTimeString = (timeString) => {
    const [time, period] = timeString.trim().split(' ');
    const [hour, minute] = time.split(':');

    return {
      hour,
      minute,
      period
    };
  };

  const timeStringToMinutes = (timeString) => {
    const { hour, minute, period } = parseTimeString(timeString);
    let parsedHour = Number(hour);

    if (period === 'PM' && parsedHour !== 12) parsedHour += 12;
    if (period === 'AM' && parsedHour === 12) parsedHour = 0;

    return parsedHour * 60 + Number(minute);
  };

  const currentStartTime = formatTimeString(startH, startM, startP);
  const currentEndTime = formatTimeString(endH, endM, endP);

  const selectionConflictsWithBlockedRange = availability.blockedRanges.some((range) => {
    const selectedStart = timeStringToMinutes(currentStartTime);
    const selectedEnd = timeStringToMinutes(currentEndTime);
    const blockedStart = timeStringToMinutes(range.startTime);
    const blockedEnd = timeStringToMinutes(range.endTime);

    return selectedStart < blockedEnd && blockedStart < selectedEnd;
  });

  const applySuggestedSlot = (slot) => {
    const start = parseTimeString(slot.startTime);
    const end = parseTimeString(slot.endTime);

    setStartH(start.hour);
    setStartM(start.minute);
    setStartP(start.period);
    setEndH(end.hour);
    setEndM(end.minute);
    setEndP(end.period);
    setSelectedSuggestedSlot(slot.label);
  };

  const handleAddonToggle = (id) => {
    setAddons((prev) => prev.includes(id) ? prev.filter((addonId) => addonId !== id) : [...prev, id]);
  };

  useEffect(() => {
    setTimeError('');
    let sh = parseInt(startH, 10) || 0;
    let sm = parseInt(startM, 10) || 0;
    if (startP === 'PM' && sh !== 12) sh += 12;
    if (startP === 'AM' && sh === 12) sh = 0;

    let eh = parseInt(endH, 10) || 0;
    let em = parseInt(endM, 10) || 0;
    if (endP === 'PM' && eh !== 12) eh += 12;
    if (endP === 'AM' && eh === 12) eh = 0;

    const startTotal = sh * 60 + sm;
    const endTotal = eh * 60 + em;

    if (startH === '' || endH === '') {
      setDuration(0);
      return;
    }

    if (startTotal >= endTotal) {
      setTimeError('End time must be after start time');
      setDuration(0);
      return;
    }

    const diffMins = endTotal - startTotal;
    if (diffMins < 120) {
      setTimeError('Minimum booking duration is 2 hours');
      setDuration(0);
      return;
    }

    setDuration(Math.ceil(diffMins / 60));
  }, [startH, startM, startP, endH, endM, endP]);

  useEffect(() => {
    if (!date) {
      setAvailability({ blockedRanges: [], availableSlots: [], suggestedSlots: [] });
      setAvailabilityError('');
      return;
    }

    const fetchAvailability = async () => {
      try {
        setIsCheckingAvailability(true);
        setAvailabilityError('');

        const response = await fetch(`${BACKEND_URL}/api/bookings/availability?roomType=${type}&date=${date}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Unable to fetch slot availability');
        }

        setAvailability(data);
      } catch (error) {
        setAvailability({ blockedRanges: [], availableSlots: [], suggestedSlots: [] });
        setAvailabilityError(error.message || 'Unable to fetch slot availability');
      } finally {
        setIsCheckingAvailability(false);
      }
    };

    fetchAvailability();
  }, [date, type]);

  const extraHours = Math.max(0, duration - 2);
  const extraCharge = extraHours * 500;

  const calculateTotal = () => {
    let total = pkg.price + extraCharge;
    addons.forEach((id) => {
      total += addOnOptions.find((addon) => addon.id === id).price;
    });
    return total;
  };

  const canProceed = date && duration >= 2 && customerName && phone && !timeError && !selectionConflictsWithBlockedRange;

  return (
    <div className="min-h-screen pt-24 pb-20 bg-deep-charcoal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <div className="rounded-3xl overflow-hidden h-[400px] relative">
              <img src="/bronze_room.png" className="w-full h-full object-cover" alt="Room" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#151515] to-transparent" />
              <div className="absolute bottom-8 left-8">
                <h1 className="text-4xl md:text-5xl font-bebas text-vintage-cream tracking-wide">{pkg.name}</h1>
                <p className="text-xl text-marquee-red font-bebas tracking-wider">Base Price (2 hrs): ₹{pkg.price}</p>
                <p className="text-sm text-white/60 font-inter mt-2">{pkg.decor}</p>
              </div>
            </div>

            <div className="bg-[#151515] p-8 rounded-3xl border border-white/10">
              <h3 className="text-2xl font-bebas text-vintage-cream mb-6 tracking-wide border-b border-white/10 pb-4">1. Select Date & Time</h3>

              <div className="mb-8">
                <label className="block text-white/60 mb-2 font-inter text-sm">Date</label>
                <input
                  type="date"
                  min={todayStr}
                  className="w-full md:w-1/2 bg-[#222] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-marquee-red transition-colors"
                  value={date}
                  onChange={(e) => {
                    if (e.target.value < todayStr) {
                      alert('Please select a date from today onwards');
                      setDate(todayStr);
                    } else {
                      setDate(e.target.value);
                    }
                    setSelectedSuggestedSlot('');
                  }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <label className="block text-white/60 mb-2 font-inter text-sm">Start Time</label>
                  <div className="flex items-center space-x-2">
                    <input type="number" inputMode="numeric" value={startH} onChange={(e) => onHourChange(e, setStartH)} className="w-16 bg-[#222] border border-white/10 rounded-xl p-3 text-center text-white focus:border-marquee-red focus:outline-none" aria-label="Start hour" />
                    <span className="text-white/40 font-bold">:</span>
                    <input type="number" inputMode="numeric" value={startM} onChange={(e) => onMinuteChange(e, setStartM)} className="w-16 bg-[#222] border border-white/10 rounded-xl p-3 text-center text-white focus:border-marquee-red focus:outline-none" aria-label="Start minute" />
                    <button onClick={() => { setStartP(startP === 'AM' ? 'PM' : 'AM'); setSelectedSuggestedSlot(''); }} className="bg-[#333] hover:bg-[#444] text-white px-4 py-3 rounded-xl font-medium transition-colors w-16">{startP}</button>
                  </div>
                </div>

                <div>
                  <label className="block text-white/60 mb-2 font-inter text-sm">End Time</label>
                  <div className="flex items-center space-x-2">
                    <input type="number" inputMode="numeric" value={endH} onChange={(e) => onHourChange(e, setEndH)} className="w-16 bg-[#222] border border-white/10 rounded-xl p-3 text-center text-white focus:border-marquee-red focus:outline-none" aria-label="End hour" />
                    <span className="text-white/40 font-bold">:</span>
                    <input type="number" inputMode="numeric" value={endM} onChange={(e) => onMinuteChange(e, setEndM)} className="w-16 bg-[#222] border border-white/10 rounded-xl p-3 text-center text-white focus:border-marquee-red focus:outline-none" aria-label="End minute" />
                    <button onClick={() => { setEndP(endP === 'AM' ? 'PM' : 'AM'); setSelectedSuggestedSlot(''); }} className="bg-[#333] hover:bg-[#444] text-white px-4 py-3 rounded-xl font-medium transition-colors w-16">{endP}</button>
                  </div>
                </div>
              </div>

              {timeError && <p className="text-marquee-red text-sm mb-4 font-medium">{timeError}</p>}
              {!timeError && selectionConflictsWithBlockedRange && (
                <div className="mb-4 flex items-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  <AlertCircle size={16} />
                  <span>This time overlaps with an active booking. Pick another slot or tap one of the suggested timings below.</span>
                </div>
              )}

              {date && availability.blockedRanges.length > 0 && (
                <div className="rounded-3xl border border-[#5f4732]/60 bg-[linear-gradient(180deg,rgba(36,28,22,0.96),rgba(18,18,18,0.96))] p-5 mb-8">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div>
                      <p className="font-bebas text-2xl tracking-wide text-vintage-cream">Booked Slots</p>
                      <p className="text-sm text-white/50">These timings are no longer available for this date.</p>
                    </div>
                    {isCheckingAvailability && (
                      <div className="inline-flex items-center gap-2 text-sm text-gold">
                        <LoaderCircle size={16} className="animate-spin" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-3">
                    {availability.blockedRanges.map((range) => (
                      <div key={`${range.startTime}-${range.endTime}`} className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-200 flex items-center justify-between">
                        <span>Booked</span>
                        <span className="font-medium tracking-wide">{range.startTime} - {range.endTime}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <h4 className="text-lg text-white/80 mt-10 mb-4 font-inter">Add-ons</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {addOnOptions.map((addon) => {
                  const isSelected = addons.includes(addon.id);
                  return (
                    <div
                      key={addon.id}
                      onClick={() => handleAddonToggle(addon.id)}
                      className={`cursor-pointer border p-4 rounded-xl transition-all ${isSelected ? 'border-marquee-red bg-marquee-red/5 scale-105' : 'border-white/10 hover:border-white/30 bg-[#222]'}`}
                    >
                      <div className="text-3xl mb-2">{addon.emoji}</div>
                      <div className="font-inter text-sm mb-1">{addon.name}</div>
                      <div className="font-bebas text-marquee-red">₹{addon.price}</div>
                    </div>
                  );
                })}
              </div>

              <h3 className="text-2xl font-bebas text-vintage-cream mt-10 mb-6 tracking-wide border-b border-white/10 pb-4">2. Your Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="Full Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full bg-[#222] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-marquee-red" />
                <input type="text" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-[#222] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-marquee-red" />
                <input type="email" placeholder="Email (for confirmations)" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full md:col-span-2 bg-[#222] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-marquee-red" />
                <textarea placeholder="Special Requests?" value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)} className="w-full md:col-span-2 bg-[#222] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-marquee-red h-24" />
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-[#1a1a1a] p-8 rounded-3xl border border-marquee-red/30 shadow-[0_0_30px_rgba(211,47,47,0.1)]">
              <h2 className="text-3xl font-bebas text-vintage-cream mb-6 tracking-wide">Order Summary</h2>

              {(duration > 0 && !timeError) ? (
                <div className="bg-[#222] border border-white/10 p-4 rounded-xl mb-6 text-center">
                  <p className="text-white/60 text-sm">Duration Billed</p>
                  <p className="text-2xl font-bebas text-white tracking-wider">{duration} {duration === 1 ? 'Hour' : 'Hours'}</p>
                </div>
              ) : (
                <div className="bg-[#222] border border-white/10 p-4 rounded-xl mb-6 text-center opacity-50">
                  <p className="text-sm font-medium text-white/50">Select valid time</p>
                </div>
              )}

              <div className="space-y-4 mb-6 text-white/80 text-sm border-b border-white/10 pb-6">
                <div className="flex justify-between">
                  <span>Base Package (2 hours)</span>
                  <span className="font-bebas text-lg">₹{pkg.price}</span>
                </div>

                {extraHours > 0 && (
                  <div className="flex justify-between text-marquee-red">
                    <span>Extra Hours ({extraHours} x ₹500)</span>
                    <span>+₹{extraCharge}</span>
                  </div>
                )}

                {addons.map((id) => {
                  const addon = addOnOptions.find((item) => item.id === id);
                  return (
                    <div key={id} className="flex justify-between text-white/60">
                      <span>{addon.name}</span>
                      <span>₹{addon.price}</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between items-end mb-8 relative">
                <span className="text-white">Total Amount</span>
                <motion.span
                  className="text-4xl font-bebas text-gold"
                  key={calculateTotal()}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  ₹{calculateTotal()}
                </motion.span>
              </div>

              <motion.button
                className={`w-full py-4 rounded-full font-bebas text-2xl tracking-wider ${canProceed ? 'bg-marquee-red text-white hover:bg-red-600 shadow-[0_0_20px_rgba(211,47,47,0.5)]' : 'bg-[#333] text-white/30 cursor-not-allowed'}`}
                whileHover={canProceed ? { scale: 1.05 } : {}}
                whileTap={canProceed ? { scale: 0.95 } : {}}
                onClick={() => {
                  if (canProceed) {
                    navigate('/checkout', {
                      state: {
                        customerName,
                        phone,
                        email,
                        specialRequests,
                        roomType: type,
                        date,
                        startTime: currentStartTime,
                        endTime: currentEndTime,
                        addons,
                        totalAmount: calculateTotal()
                      }
                    });
                  }
                }}
                disabled={!canProceed}
              >
                PROCEED TO PAYMENT
              </motion.button>

              {!canProceed && (
                <p className="text-xs text-center text-marquee-red mt-4">
                  {selectionConflictsWithBlockedRange
                    ? 'That timing is already occupied. Pick a free slot before continuing.'
                    : 'Please fill in all required details and valid times.'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetails;
