import { motion } from 'framer-motion';

const Privacy = () => {
  return (
    <div className="min-h-screen pt-32 pb-20 bg-deep-charcoal text-zinc-300 font-inter px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl font-bebas text-vintage-cream mb-8 tracking-wider border-b border-white/10 pb-4">
            Privacy Policy
          </h1>

          <div className="space-y-6 text-sm sm:text-base leading-relaxed">
            <p className="text-white/60">
              At REELM, we value your privacy and are committed to protecting your personal information. This Privacy Policy details how we collect, use, and safeguard your data when you use our website and booking system.
            </p>

            <section className="space-y-3">
              <h2 className="text-xl font-bebas text-gold tracking-wide">1. Information We Collect</h2>
              <ul className="list-disc list-inside space-y-2 text-white/70 pl-2">
                <li><strong>Personal Identifiable Information:</strong> Name, email address, phone number, and special request details collected during booking.</li>
                <li><strong>Authentication Data:</strong> Google Profile data (email, name, profile photo) when signing in with Google OAuth.</li>
                <li><strong>Payment Data:</strong> Payment details (processed securely via Razorpay). We do not store credit card or bank account information on our servers.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bebas text-gold tracking-wide">2. How We Use Your Information</h2>
              <ul className="list-disc list-inside space-y-2 text-white/70 pl-2">
                <li>To process and confirm your booking requests.</li>
                <li>To send booking confirmation emails and customer support messages.</li>
                <li>To manage admin privileges and auth tokens for secure login controls.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bebas text-gold tracking-wide">3. Information Sharing and Disclosure</h2>
              <ul className="list-disc list-inside space-y-2 text-white/70 pl-2">
                <li>We do not sell, rent, or trade your personal information to third parties.</li>
                <li>We share necessary data with trusted service providers (like Razorpay for payment processing and email delivery services) to fulfill bookings.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bebas text-gold tracking-wide">4. Data Security</h2>
              <p className="text-white/70">
                We implement a variety of security measures, including HTTPS encryption and secure database controls, to maintain the safety of your personal information. However, no method of transmission over the Internet is 100% secure.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bebas text-gold tracking-wide">5. Cookies and Tracking</h2>
              <p className="text-white/70">
                We use secure, HTTP-only cookies to handle user authentication sessions. These cookies do not store tracking or analytics data and are used solely for website functionality.
              </p>
            </section>

            <p className="text-white/40 text-xs mt-12 border-t border-white/5 pt-6">
              Last updated: June 2026. For any privacy concerns, contact hello@reelm.com.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Privacy;
