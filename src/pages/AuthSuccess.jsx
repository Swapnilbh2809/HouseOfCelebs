import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserLoadingScreen from '../components/UserLoadingScreen';

export default function AuthSuccess() {
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error || !token) {
      navigate('/?auth=failed', { replace: true });
      return;
    }

    login(token)
      .then(() => {
        const pendingCheckout = localStorage.getItem('hoc_pending_checkout');
        if (pendingCheckout) {
          localStorage.removeItem('hoc_pending_checkout');
          navigate('/checkout', { state: JSON.parse(pendingCheckout), replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      })
      .catch(() => navigate('/?auth=failed', { replace: true }));
  }, []);

  return <UserLoadingScreen />;
}
