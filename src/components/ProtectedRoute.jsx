import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserLoadingScreen from './UserLoadingScreen';

export default function ProtectedRoute({ children }) {
  const { user, authLoading } = useAuth();
  if (authLoading) return <UserLoadingScreen />;
  if (!user) return <Navigate to="/" replace />;
  return children;
}
