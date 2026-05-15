import GoogleLoginButton from '../components/GoogleLoginButton';
import { motion } from 'framer-motion';

const Login = () => {
  return (
    <div className="min-h-screen pt-32 pb-20 bg-deep-charcoal flex items-center justify-center px-4">
      <motion.div
        className="w-full max-w-md bg-zinc-900/80 backdrop-blur-md p-10 rounded-3xl border border-white/10 shadow-2xl text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <img src="/hoc-icon.png" alt="House of Celebs Logo" className="h-20 mx-auto mb-6 object-contain" />
        <h1 className="text-3xl font-bebas text-vintage-cream mb-2 tracking-widest">WELCOME BACK</h1>
        <p className="text-white/60 font-inter text-sm mb-10">Sign in to manage your bookings and access premium features.</p>

        <GoogleLoginButton />

        <p className="text-white/40 text-xs mt-8">By continuing, you agree to House of Celeb's Terms of Service and Privacy Policy.</p>
      </motion.div>
    </div>
  );
};

export default Login;
