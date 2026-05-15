import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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
  const { user } = useAuth();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
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
    if (!user) {
      setShowLoginModal(true);
      return;
    }

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

      const finalEmail = user ? user.email : email;

      const response = await fetch(`${BACKEND_URL}/api/bookings/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName, phone, email: finalEmail, specialRequests, roomType, date, startTime, endTime, addons
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
          email: finalEmail
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

      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div 
            className="max-w-sm w-full bg-[#151515] p-8 rounded-3xl border border-white/10 text-center relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-marquee-red"></div>
            <h3 className="text-3xl font-bebas text-vintage-cream mb-4 tracking-wide">Almost There!</h3>
            <p className="text-white/70 mb-8 font-inter text-sm">Please log in or sign up to finalize your booking. We'll save your progress and bring you right back here!</p>
            
            <button 
              onClick={() => {
                localStorage.setItem('hoc_pending_checkout', JSON.stringify(state));
                window.location.href = `${BACKEND_URL}/api/auth/google`;
              }}
              className="w-full py-3 rounded-full font-inter font-bold text-sm bg-white text-black hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              <span>Continue with Google</span>
            </button>
            <button onClick={() => setShowLoginModal(false)} className="mt-4 text-white/50 text-sm font-inter hover:text-white transition-colors">
              Cancel
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
