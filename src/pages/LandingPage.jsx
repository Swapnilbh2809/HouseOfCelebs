import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Film, MonitorPlay, PartyPopper, Star, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';

const LandingPage = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [cardsToShow, setCardsToShow] = useState(3);

  const GOOGLE_REVIEWS = [
    { id: 1, name: "Priya Sharma", photo: "https://ui-avatars.com/api/?name=Priya+Sharma&background=random", rating: 5, date: "2 weeks ago", text: "Absolutely phenomenal experience! Celebrated my husband's birthday here and the decor was magical. The privacy and the 4K screen made us feel like royalty." },
    { id: 2, name: "Rahul Mehta", photo: "https://ui-avatars.com/api/?name=Rahul+Mehta&background=random", rating: 5, date: "1 month ago", text: "Best private theatre in Delhi. The screen quality and sound system are top notch. Total privacy and the food add-ons were delicious." },
    { id: 3, name: "Anjali K.", photo: "https://ui-avatars.com/api/?name=Anjali+K&background=random", rating: 5, date: "3 months ago", text: "Booked the Silver package for our anniversary. The team was so cooperative and made our day special! Highly recommended for couples." },
    { id: 4, name: "Vikram Singh", photo: "https://ui-avatars.com/api/?name=Vikram+Singh&background=random", rating: 5, date: "4 months ago", text: "Incredible vibe and aesthetics! We brought our PlayStation and hooked it up to the projector. The staff was incredibly helpful." },
    { id: 5, name: "Neha Gupta", photo: "https://ui-avatars.com/api/?name=Neha+Gupta&background=random", rating: 5, date: "5 months ago", text: "The balloon decorations and the fog entry were just spectacular. Truly an unforgettable night. Thank you House of Celebs!" }
  ];

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setCardsToShow(1);
      else if (window.innerWidth < 1024) setCardsToShow(2);
      else setCardsToShow(3);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const maxIndex = Math.max(0, GOOGLE_REVIEWS.length - cardsToShow);
    const interval = setInterval(() => {
      if (!isHovered) {
        setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isHovered, cardsToShow, GOOGLE_REVIEWS.length]);

  return (
    <div className="w-full">
      {/* SECTION 1: Hero */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-deep-charcoal/80 via-deep-charcoal/60 to-deep-charcoal z-10" />
          {/* Using a fixed background for a subtle parallax effect */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-fixed scale-110"
            style={{ backgroundImage: "url('/hero_bg.png')" }}
          />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center pt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bebas text-vintage-cream mb-6 tracking-wider drop-shadow-lg">
              HOUSE OF CELEBS
            </h1>
            <p className="text-2xl md:text-3xl text-gold font-bebas tracking-wide mb-4">
              Your Private Theatre. Your Unforgettable Moment.
            </p>
            <p className="text-lg md:text-xl text-white/90 font-inter font-light mb-12 max-w-2xl mx-auto">
              Premium private screenings for couples & celebrations in Delhi
            </p>
            
            <Link to="/book">
              <motion.button 
                className="bg-marquee-red text-white px-10 py-4 rounded-full font-bebas text-2xl tracking-wider shadow-[0_0_30px_rgba(211,47,47,0.6)] hover:bg-red-600 transition-all cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={{ 
                  boxShadow: ["0 0 20px rgba(211,47,47,0.4)", "0 0 40px rgba(211,47,47,0.8)", "0 0 20px rgba(211,47,47,0.4)"]
                }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                BOOK NOW
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* SECTION 2: Why Us */}
      <section className="py-24 bg-vintage-cream text-deep-charcoal relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bebas tracking-wide mb-4 text-deep-charcoal">The Premium Experience</h2>
            <div className="w-24 h-1 bg-marquee-red mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {[
              {
                icon: <Film size={40} className="text-marquee-red" />,
                title: "100% Private Screening",
                desc: "No crowds, no distractions. Just you and your loved ones in your own exclusive cinematic space."
              },
              {
                icon: <MonitorPlay size={40} className="text-marquee-red" />,
                title: "Premium OTT Access",
                desc: "Netflix, Prime Video, YouTube — all your favorite content ready to binge on the big screen."
              },
              {
                icon: <PartyPopper size={40} className="text-marquee-red" />,
                title: "Customizable Experiences",
                desc: "From simple romantic setups to grand birthday celebrations, we tailor the room to your occasion."
              },
              {
                icon: <Star size={40} className="text-marquee-red" />,
                title: "1,000+ Happy Memories",
                desc: "4.7★ rated on Google. Join our family of guests who have celebrated their best moments with us."
              }
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                className="bg-white p-8 rounded-2xl shadow-lg border border-deep-charcoal/5 hover:shadow-2xl transition-all group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="mb-6 p-4 bg-vintage-cream rounded-full inline-block group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bebas tracking-wide mb-3">{feature.title}</h3>
                <p className="text-deep-charcoal/70 leading-relaxed font-inter">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: Custom Google Reviews Slider */}
      <section id="reviews" className="py-24 relative bg-deep-charcoal overflow-hidden">
        {/* Subtle vintage film grain texture overlay */}
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none mix-blend-overlay" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/black-paper.png')" }}></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bebas text-vintage-cream tracking-wide mb-3">Celebrated Moments</h2>
            <div className="w-24 h-1 bg-marquee-red mx-auto mb-10"></div>
          </motion.div>

          {/* Enhanced Header Stat */}
          <motion.div 
            className="inline-flex flex-col items-center justify-center mb-16"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center space-x-3 mb-2 shadow-[0_0_30px_rgba(250,204,21,0.15)] bg-white/5 border border-white/10 px-6 py-4 md:px-8 rounded-3xl backdrop-blur-sm">
              <Star className="text-yellow-400 fill-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" size={32} />
              <span className="font-bebas text-2xl md:text-3xl tracking-wide text-yellow-400 drop-shadow-md">
                4.7/5.0 <span className="text-white text-xl md:text-2xl ml-2">ON GOOGLE REVIEWS</span>
              </span>
            </div>
            <p className="text-white/60 tracking-[0.2em] font-medium text-xs md:text-sm mt-3 uppercase">1,000+ Celebrations & Counting</p>
          </motion.div>

          {/* Carousel Container */}
          <div 
            className="relative w-full pb-12 group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="overflow-hidden w-full">
              <div 
                className="flex transition-transform duration-500 ease-in-out gap-6"
                style={{ transform: `translateX(-${currentIndex * (100 / cardsToShow)}%)` }}
              >
                {GOOGLE_REVIEWS.map((review) => (
                  <div 
                    key={review.id} 
                    className="flex-shrink-0"
                    style={{ width: `calc(${100 / cardsToShow}% - ${(cardsToShow - 1) * 24 / cardsToShow}px)` }}
                  >
                    <motion.div 
                      className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 md:p-8 text-left shadow-2xl transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(250,204,21,0.15)] h-[280px] flex flex-col backdrop-blur-md"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <img src={review.photo} alt={review.name} className="w-12 h-12 rounded-full border border-white/10" />
                          <div>
                            <p className="font-bold text-white flex items-center gap-1">
                              {review.name}
                              <CheckCircle size={14} className="text-blue-500 fill-blue-500/20" />
                            </p>
                            <p className="text-zinc-500 text-xs">{review.date}</p>
                          </div>
                        </div>
                        {/* Custom SVG Google G Logo to match aesthetics */}
                        <svg viewBox="0 0 48 48" className="w-6 h-6 opacity-80 flex-shrink-0">
                          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                        </svg>
                      </div>
                      
                      <div className="flex text-yellow-400 mb-4">
                        {[...Array(5)].map((_, i) => <Star key={i} size={18} className="fill-yellow-400" />)}
                      </div>
                      
                      <div className="relative flex-grow overflow-hidden">
                        <p className="text-zinc-300 text-sm md:text-base leading-relaxed line-clamp-4">
                          "{review.text}"
                        </p>
                        {/* Gradient to hide truncation cutoffs smoothly */}
                        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-[#151515]/90 to-transparent pointer-events-none"></div>
                      </div>
                    </motion.div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Dots */}
            <div className="flex justify-center mt-8 space-x-2">
              {Array.from({ length: Math.max(1, GOOGLE_REVIEWS.length - cardsToShow + 1) }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${i === currentIndex ? 'bg-yellow-400 w-8' : 'bg-white/20 hover:bg-white/50'}`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            {/* Left/Right Desktop Hover Arrows */}
            {cardsToShow > 1 && (
              <>
                <button 
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  className={`absolute -left-4 md:-left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#222] border border-white/10 rounded-full flex items-center justify-center text-white/50 backdrop-blur-md transition-all duration-300 ${currentIndex === 0 ? 'opacity-0 cursor-default' : 'opacity-0 md:group-hover:opacity-100 hover:text-white hover:bg-marquee-red hover:border-marquee-red shadow-[0_0_15px_rgba(0,0,0,0.5)] z-20'}`}
                  aria-label="Previous review"
                >
                  <ChevronLeft size={24} />
                </button>
                <button 
                  onClick={() => setCurrentIndex((prev) => Math.min(GOOGLE_REVIEWS.length - cardsToShow, prev + 1))}
                  className={`absolute -right-4 md:-right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#222] border border-white/10 rounded-full flex items-center justify-center text-white/50 backdrop-blur-md transition-all duration-300 ${currentIndex === GOOGLE_REVIEWS.length - cardsToShow ? 'opacity-0 cursor-default' : 'opacity-0 md:group-hover:opacity-100 hover:text-white hover:bg-marquee-red hover:border-marquee-red shadow-[0_0_15px_rgba(0,0,0,0.5)] z-20'}`}
                  aria-label="Next review"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>

          <div className="mt-6 md:mt-10 text-center relative z-20">
            <a 
              href="https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID"
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block px-8 py-3 rounded-full border border-yellow-400 text-yellow-400 font-inter font-medium text-sm md:text-base tracking-wide transition-all duration-300 hover:bg-yellow-400 hover:text-black hover:shadow-[0_0_20px_rgba(250,204,21,0.4)]"
            >
              See all reviews on Google
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
