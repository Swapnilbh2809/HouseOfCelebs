import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Users, Clock, Sparkles } from 'lucide-react';

const packages = [
  {
    id: 'bronze',
    name: 'Bronze Experience',
    price: 999,
    image: '/bronze_room.png',
    badge: 'Most Popular',
    details: ['2 People', '2 Hours', 'Balloon Decor'],
    desc: 'Perfect for a cozy, intimate celebration.'
  },
  {
    id: 'silver',
    name: 'Silver Experience',
    price: 1599,
    image: '/bronze_room.png', // Reusing image since only 1 generated for room
    badge: 'Romantic',
    details: ['2 People', '2 Hours', 'Flower + Balloon + Lights'],
    desc: 'Elevate your special moments with premium decor.'
  }
];

const SlotSelection = () => {
  return (
    <div className="min-h-screen pt-28 pb-20 bg-deep-charcoal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
        <h1 className="text-5xl md:text-6xl font-bebas text-vintage-cream mb-4 tracking-wide">Choose Your Experience</h1>
        <p className="text-white/70 font-inter max-w-2xl mx-auto">Select a package that best fits your occasion. Extra hours and add-ons available in the next step.</p>
        <div className="w-24 h-1 bg-marquee-red mx-auto mt-8"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12 justify-center">
          {packages.map((pkg, idx) => (
            <motion.div 
              key={pkg.id}
              className="flex-1 bg-[#151515] rounded-3xl overflow-hidden border border-white/10 group relative"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.2 }}
              whileHover={{ y: -10, scale: 1.02 }}
            >
              <div className="absolute top-4 right-4 z-20 bg-gold text-deep-charcoal font-bebas tracking-wide px-4 py-1 rounded-full text-sm">
                {pkg.badge}
              </div>
              
              <div className="relative h-64 md:h-80 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-[#151515] to-transparent z-10" />
                <img 
                  src={pkg.image} 
                  alt={pkg.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>

              <div className="p-8 relative z-20 -mt-12">
                <h2 className="text-4xl font-bebas text-vintage-cream tracking-wide">{pkg.name}</h2>
                <div className="text-3xl font-bebas text-marquee-red tracking-wider mb-6">
                  ₹{pkg.price}
                </div>
                
                <p className="text-white/60 font-inter mb-8 h-12">
                  {pkg.desc}
                </p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center text-white/80 space-x-3">
                    <Users size={20} className="text-gold" />
                    <span>{pkg.details[0]}</span>
                  </div>
                  <div className="flex items-center text-white/80 space-x-3">
                    <Clock size={20} className="text-gold" />
                    <span>{pkg.details[1]}</span>
                  </div>
                  <div className="flex items-center text-white/80 space-x-3">
                    <Sparkles size={20} className="text-gold" />
                    <span>{pkg.details[2]}</span>
                  </div>
                </div>

                <Link to={`/room/${pkg.id}`} className="block">
                  <motion.button 
                    className="w-full border-2 border-marquee-red text-marquee-red font-bebas text-2xl py-3 rounded-xl tracking-wider hover:bg-marquee-red hover:text-white transition-all overflow-hidden relative"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    MORE INFO
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SlotSelection;
