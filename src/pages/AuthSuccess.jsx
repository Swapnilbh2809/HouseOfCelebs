import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LoaderCircle } from 'lucide-react';

const AuthSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Parse the token from URL query params
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');

    if (token) {
      // Store JWT token securely (localStorage is easiest for client)
      localStorage.setItem('token', token);
      
      // Clean up URL and redirect to dashboard/home
      navigate('/', { replace: true });
    } else {
      // Missing token, error out
      navigate('/', { replace: true });
    }
  }, [location, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-deep-charcoal">
      <LoaderCircle className="w-12 h-12 text-marquee-red animate-spin mb-4" />
      <p className="text-white/60 font-inter">Authenticating safely...</p>
    </div>
  );
};

export default AuthSuccess;
