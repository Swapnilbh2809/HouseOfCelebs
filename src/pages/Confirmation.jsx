import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { PartyPopper, Calendar, Clock, PackageCheck } from 'lucide-react';
import Confetti from 'react-confetti';
import { useState, useEffect } from 'react';

const Confirmation = () => {
  const [showConfetti, setShowConfetti] = useState(true);
  const { state } = useLocation();
  
  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const booking = state || {
    bookingId: 'MOCK123', date: '2026-10-12', roomType: 'bronze', totalAmount: '999', startTime: '10:00 AM', endTime: '12:00 PM', addons: []
  };

  // Time and duration helpers reused for display
  const parseTime = (timeStr) => {
    const [time, period] = timeStr.trim().split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };
  const startT = parseTime(booking.startTime);
  const endT = parseTime(booking.endTime);
  const durHours = Math.ceil((endT - startT) / 60);

  const basePrice = booking.roomType === 'silver' ? 1599 : 999;
  const extraHoursCharge = Math.max(0, durHours - 2) * 500;
  
  const addOnMap = { nameplate: 299, drinks: 199, fog: 499, cake: 699 };
  const addonsCost = (booking.addons || []).reduce((acc, id) => acc + (addOnMap[id] || 0), 0);

  const displayDate = new Date(booking.date).toLocaleDateString(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="min-h-screen pt-32 pb-20 bg-deep-charcoal flex flex-col items-center">
      {showConfetti && <Confetti colors={['#D32F2F', '#FFD700', '#F5E6D3']} />}
      
      <motion.div 
        className="max-w-2xl w-full bg-[#151515] p-10 md:p-14 rounded-[2.5rem] border border-white/10 relative overflow-hidden"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-marquee-red/20 rounded-bl-[100px] blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gold/10 rounded-tr-[100px] blur-3xl"></div>
        
        <div className="text-center mb-10 relative z-10">
          <div className="w-24 h-24 bg-marquee-red/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <PartyPopper className="w-12 h-12 text-marquee-red" />
          </div>
          <h1 className="text-5xl font-bebas text-vintage-cream mb-4 tracking-wide">Booking Confirmed!</h1>
          <p className="text-white/60 font-inter">We've sent the details to your email. Get ready for an unforgettable experience.</p>
        </div>

        <div className="bg-[#222] rounded-2xl p-8 mb-6 relative z-10 border border-white/5">
          <div className="flex justify-between items-center mb-6 pb-6 border-b border-white/10">
            <span className="text-white/60 font-inter">Booking ID</span>
            <span className="font-bebas text-3xl text-white tracking-widest uppercase">#{booking.bookingId.slice(-6)}</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="flex items-start space-x-3">
              <PackageCheck className="text-gold mt-1" size={20} />
              <div>
                <p className="text-white/60 text-xs uppercase tracking-wider mb-1">Package</p>
                <p className="font-bebas text-xl text-white tracking-wide capitalize">{booking.roomType} Experience</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
               <Calendar className="text-gold mt-1" size={20} />
              <div>
                <p className="text-white/60 text-xs uppercase tracking-wider mb-1">Date</p>
                <p className="font-bebas text-xl text-white tracking-wide">{displayDate}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 md:col-span-2">
              <Clock className="text-gold mt-1" size={20} />
              <div>
                <p className="text-white/60 text-xs uppercase tracking-wider mb-1">Time Range</p>
                <p className="font-bebas text-xl text-white tracking-wide">{booking.startTime} - {booking.endTime} ({durHours} hours)</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-6">
             <p className="text-white/60 text-xs uppercase tracking-wider mb-4">Payment Breakdown</p>
             <div className="space-y-3 text-sm">
                <div className="flex justify-between text-white/80">
                  <span>Base Package (2 hours)</span>
                  <span>₹{basePrice}</span>
                </div>
                {extraHoursCharge > 0 && (
                  <div className="flex justify-between text-white/80">
                    <span>Extra Hours ({durHours - 2} hrs)</span>
                    <span>₹{extraHoursCharge}</span>
                  </div>
                )}
                {addonsCost > 0 && (
                  <div className="flex justify-between text-white/80">
                    <span>Add-ons</span>
                    <span>₹{addonsCost}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-4 mt-2 border-t border-white/10">
                  <span className="text-white font-medium">Total Amount Paid</span>
                  <span className="text-3xl font-bebas text-emerald-400">₹{booking.totalAmount}</span>
                </div>
             </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 relative z-10">
          <Link to="/" className="flex-1">
            <motion.button className="w-full bg-[#222] text-white py-4 rounded-full font-bebas text-xl tracking-wider hover:bg-[#333] transition-colors border border-white/10">
              BACK TO HOME
            </motion.button>
          </Link>
          <a href="https://wa.me/919958996834" target="_blank" rel="noreferrer" className="flex-1">
             <motion.button className="w-full bg-marquee-red text-white py-4 rounded-full font-bebas text-xl tracking-wider shadow-[0_0_15px_rgba(211,47,47,0.4)] hover:bg-red-600 transition-colors">
              WHATSAPP US
            </motion.button>
          </a>
        </div>
      </motion.div>
    </div>
  );
};

export default Confirmation;
