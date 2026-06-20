import { MapPin, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-[#111] border-t border-white/10 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div>
            <h3 className="font-bebas text-2xl text-vintage-cream mb-4">REELM</h3>
            <p className="text-white/60 mb-6 max-w-sm">
              Your premium private theatre in Delhi. Bringing unforgettable cinematic experiences and celebrations to you and your loved ones.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.instagram.com/reelm.in/" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-marquee-red transition-colors">Instagram</a>
              <a href="https://www.facebook.com/reelm" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-marquee-red transition-colors">Facebook</a>
            </div>
          </div>
          
          <div>
            <h4 className="font-bebas text-xl text-white mb-4">Contact Info</h4>
            <ul className="space-y-4">
              <li className="flex items-center space-x-3 text-white/60">
                <MapPin size={20} className="text-marquee-red" />
                <span>123 Cinema Road, South Extension, New Delhi</span>
              </li>
              <li className="flex items-center space-x-3 text-white/60">
                <Phone size={20} className="text-marquee-red" />
                <span>+91 90344 12822</span>
              </li>
              <li className="flex items-center space-x-3 text-white/60">
                <Mail size={20} className="text-marquee-red" />
                <span>hello@reelm.com</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bebas text-xl text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/book" className="text-white/60 hover:text-white transition-colors">Our Packages</Link></li>
              <li><Link to="/terms" className="text-white/60 hover:text-white transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/privacy" className="text-white/60 hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-8 text-center text-white/40 text-sm">
          <p>&copy; {new Date().getFullYear()} REELM. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
