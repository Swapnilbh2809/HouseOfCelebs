import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const Checkout = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const paymentResolvedRef = useRef(false);

  // Fallback if no state is passed
  if (!state) {
    return <div className="min-h-screen text-white pt-32 text-center font-bebas text-2xl">No booking details found. Please start over.</div>;
  }

  const { customerName, phone, email, specialRequests, roomType, date, startTime, endTime, addons, totalAmount } = state;

  useEffect(() => {
    loadRazorpayScript();
  }, []);

  const handlePayment = async () => {
    setIsLoading(true);
    setError('');
    paymentResolvedRef.current = false;

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError('Could not load Razorpay checkout. Please check your internet connection.');
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${BACKEND_URL}/api/bookings/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName, phone, email, specialRequests, roomType, date, startTime, endTime, addons
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Something went wrong processing your booking');
        setIsLoading(false);
        return;
      }

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: 'House of Celebs',
        description: `${roomType} experience booking`,
        order_id: data.orderId,
        prefill: {
          name: customerName,
          contact: phone,
          email
        },
        theme: {
          color: '#D32F2F'
        },
        modal: {
          ondismiss: async () => {
            if (paymentResolvedRef.current) {
              return;
            }

            try {
              await fetch(`${BACKEND_URL}/api/bookings/payment-failed`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  bookingId: data.bookingId,
                  reason: 'Payment popup was closed before completion'
                })
              });
            } catch {
              // Best-effort status update only.
            }
            setIsLoading(false);
          }
        },
        handler: async (paymentResponse) => {
          try {
            paymentResolvedRef.current = true;
            const verifyResponse = await fetch(`${BACKEND_URL}/api/bookings/verify-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                bookingId: data.bookingId,
                ...paymentResponse
              })
            });

            const verifyData = await verifyResponse.json();

            if (!verifyResponse.ok) {
              throw new Error(verifyData.message || 'Payment verification failed');
            }

            navigate('/booking-confirmed', {
              state: {
                ...verifyData.booking,
                bookingId: verifyData.booking.bookingId
              }
            });
          } catch (verificationError) {
            paymentResolvedRef.current = false;
            setError(verificationError.message || 'Payment verification failed');
            setIsLoading(false);
          }
        }
      };

      const razorpayInstance = new window.Razorpay(options);

      razorpayInstance.on('payment.failed', async (paymentError) => {
        paymentResolvedRef.current = false;
        try {
          await fetch(`${BACKEND_URL}/api/bookings/payment-failed`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              bookingId: data.bookingId,
              reason: paymentError?.error?.description || 'Payment failed'
            })
          });
        } catch {
          // Best-effort status update only.
        }

        setError(paymentError?.error?.description || 'Payment failed. Please try again.');
        setIsLoading(false);
      });

      razorpayInstance.open();
    } catch (err) {
      setError('Could not connect to the server. Is your backend running?');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 bg-deep-charcoal flex items-center justify-center">
      <motion.div 
        className="max-w-md w-full bg-[#151515] p-8 rounded-3xl border border-white/10 text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <ShieldCheck className="w-16 h-16 text-marquee-red border-b border-marquee-red mb-6 mx-auto" />
        <h2 className="text-4xl font-bebas text-vintage-cream mb-2 tracking-wide">Secure Checkout</h2>
        <p className="text-white/60 mb-6 font-inter">You're about to make a booking for {customerName}.</p>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-xl mb-6 flex items-center justify-center space-x-2 text-sm">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div className="bg-[#222] p-6 rounded-2xl mb-8 flex justify-between items-center border border-white/5">
          <span className="text-white/80">Total to Pay</span>
          <span className="text-3xl font-bebas text-marquee-red">₹{totalAmount}</span>
        </div>

        <motion.button 
          className={`w-full py-4 rounded-full font-bebas text-2xl tracking-wider shadow-[0_0_20px_rgba(211,47,47,0.5)] transition-all relative overflow-hidden ${isLoading ? 'bg-marquee-red/50 cursor-not-allowed' : 'bg-marquee-red hover:bg-red-600 text-white'}`}
          whileHover={!isLoading ? { scale: 1.05 } : {}}
          whileTap={!isLoading ? { scale: 0.95 } : {}}
          onClick={handlePayment}
          disabled={isLoading}
        >
          {isLoading ? 'PROCESSING...' : 'PAY VIA RAZORPAY'}
        </motion.button>
        <div className="mt-4 flex items-center justify-center text-xs text-white/40 space-x-1">
          <CheckCircle2 size={12} />
          <span>Secured by Razorpay</span>
        </div>
      </motion.div>
    </div>
  );
};

export default Checkout;
