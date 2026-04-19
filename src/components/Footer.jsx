import { MapPin, Phone, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#111] border-t border-white/10 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div>
            <h3 className="font-bebas text-2xl text-vintage-cream mb-4">HOUSE OF CELEBS</h3>
            <p className="text-white/60 mb-6 max-w-sm">
              Your premium private theatre in Delhi. Bringing unforgettable cinematic experiences and celebrations to you and your loved ones.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.instagram.com/houseofcelebs.in/" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-marquee-red transition-colors">Instagram</a>
              <a href="https://www.facebook.com/p/House-of-Celebs-61571829897723/" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-marquee-red transition-colors">Facebook</a>
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
                <span>+91 99589 96834</span>
              </li>
              <li className="flex items-center space-x-3 text-white/60">
                <Mail size={20} className="text-marquee-red" />
                <span>hello@houseofcelebs.com</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bebas text-xl text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">Our Packages</a></li>
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">Gallery</a></li>
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">Terms & Conditions</a></li>
              <li><a href="#" className="text-white/60 hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-8 text-center text-white/40 text-sm">
          <p>&copy; {new Date().getFullYear()} House of Celebs. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
