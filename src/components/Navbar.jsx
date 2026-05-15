import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Popcorn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const handleLoginClick = (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setTimeout(() => {
      window.location.href = `${API_URL}/api/auth/google`;
    }, 1500);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed w-full z-50 bg-deep-charcoal/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24">
          <Link to="/" className="flex items-center space-x-2">
            <img src="/hoc-icon.png" alt="House of Celebs Logo" className="h-24 w-auto object-contain cursor-pointer transform hover:scale-105 transition-transform duration-300" />
          </Link>
          <div className="hidden md:flex space-x-8">
            <Link to="/" className="text-white/80 hover:text-white transition-colors">Home</Link>
            <Link to="/book" className="text-white/80 hover:text-white transition-colors">Packages</Link>
            <Link to="/#reviews" className="text-white/80 hover:text-white transition-colors">Reviews</Link>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            {user ? (
              <>
                <Link to="/book" className="bg-marquee-red hover:bg-red-700 text-white font-bold rounded-full px-[clamp(12px,2.5vw,32px)] py-[clamp(6px,1vw,12px)] text-[clamp(11px,1.5vw,16px)] whitespace-nowrap shadow-[0_0_15px_rgba(211,47,47,0.5)] transition-colors">
                  Book Now
                </Link>
                <Link to="/dashboard" className="shrink-0 w-[clamp(32px,5vw,40px)] h-[clamp(32px,5vw,40px)] ml-2">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full border-2 border-marquee-red object-cover hover:scale-105 transition-transform" />
                  ) : (
                    <div className="w-full h-full rounded-full bg-marquee-red border-2 border-marquee-red flex items-center justify-center text-white font-bold text-[clamp(14px,2vw,18px)] hover:scale-105 transition-transform">
                      {user.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                </Link>
              </>
            ) : (
              <>
                <button onClick={handleLoginClick} className="text-white/80 hover:text-white font-inter text-[clamp(11px,1.5vw,14px)] transition-colors uppercase tracking-wider mr-1 sm:mr-2">
                  Log In
                </button>
                <Link to="/book" className="bg-marquee-red hover:bg-red-700 text-white font-bold rounded-full px-[clamp(12px,2.5vw,32px)] py-[clamp(6px,1vw,12px)] text-[clamp(11px,1.5vw,16px)] whitespace-nowrap shadow-[0_0_15px_rgba(211,47,47,0.5)] transition-colors">
                  Book Now
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
      {isLoggingIn && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-white/10 border-t-marquee-red rounded-full animate-spin mb-4"></div>
            <p className="text-white font-inter text-lg tracking-wider">Logging you in...</p>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
