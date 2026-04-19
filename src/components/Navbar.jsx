import { Link } from 'react-router-dom';
import { Popcorn } from 'lucide-react';

const Navbar = () => {
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
          <div className="flex items-center space-x-4">
            <Link to="/login" className="hidden sm:block text-white/80 hover:text-white font-inter text-sm transition-colors uppercase tracking-wider">Log In</Link>
            <Link to="/book" className="bg-marquee-red hover:bg-red-700 text-white font-bold rounded-full px-4 sm:px-8 py-2 sm:py-3 text-sm sm:text-base whitespace-nowrap shadow-[0_0_15px_rgba(211,47,47,0.5)] transition-colors">
              <span className="hidden sm:inline">Book Now</span>
              <span className="inline sm:hidden">Book</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
