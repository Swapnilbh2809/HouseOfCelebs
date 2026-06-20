import { motion } from 'framer-motion';

const Terms = () => {
  return (
    <div className="min-h-screen pt-32 pb-20 bg-deep-charcoal text-zinc-300 font-inter px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl font-bebas text-vintage-cream mb-8 tracking-wider border-b border-white/10 pb-4">
            Terms & Conditions
          </h1>

          <div className="space-y-6 text-sm sm:text-base leading-relaxed">
            <p className="text-white/60">
              Welcome to REELM. By booking an experience or using our services, you agree to comply with and be bound by the following terms and conditions. Please read them carefully.
            </p>

            <section className="space-y-3">
              <h2 className="text-xl font-bebas text-gold tracking-wide">1. Booking and Slot Policy</h2>
              <ul className="list-disc list-inside space-y-2 text-white/70 pl-2">
                <li>Slots are subject to availability and must be booked in advance via our website.</li>
                <li>Each slot has a fixed start and end time. Guests are requested to arrive 10 minutes prior to their booking.</li>
                <li>Delays from the guest's end will not result in slot extension if there is a subsequent booking.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bebas text-gold tracking-wide">2. Cancellation and Refund Policy</h2>
              <ul className="list-disc list-inside space-y-2 text-white/70 pl-2">
                <li>Cancellations made more than 48 hours before the scheduled slot are eligible for a partial refund or reschedule, subject to approval.</li>
                <li>No refunds will be issued for cancellations made within 24 hours of the slot start time.</li>
                <li>In case of technical issues on our end, guests will be offered a full refund or a free reschedule.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bebas text-gold tracking-wide">3. Code of Conduct and Damages</h2>
              <ul className="list-disc list-inside space-y-2 text-white/70 pl-2">
                <li>Guests are expected to maintain public decorum and respect the private space. No illegal substances or activities are permitted.</li>
                <li>Any damage caused to the theater equipment, projector, audio systems, furniture, or decor by the guests will be charged at actual replacement/repair costs.</li>
                <li>Outside food and beverages are not allowed unless specified in the booking package or pre-approved by the management.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bebas text-gold tracking-wide">4. Liability Limitation</h2>
              <p className="text-white/70">
                REELM is not responsible for any loss, theft, or damage to personal belongings of the guests inside the premises. Guests are advised to look after their valuables.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bebas text-gold tracking-wide">5. Modifications to Terms</h2>
              <p className="text-white/70">
                We reserve the right to modify these terms and conditions at any time without prior notice. The updated terms will be published on this website.
              </p>
            </section>

            <p className="text-white/40 text-xs mt-12 border-t border-white/5 pt-6">
              Last updated: June 2026. For any queries, contact hello@reelm.com or call +91 90344 12822.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Terms;
