import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';
import { useEffect, useState } from 'react';

const ProtectedRoute = ({ children, role, onGuestAlert }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [alertShown, setAlertShown] = useState(false);

  // Handle guest alert only after auth is fully loaded
  useEffect(() => {
    if (loading || alertShown || user || !onGuestAlert) return;

    setAlertShown(true);

    Swal.fire({
      icon: 'info',
      title: 'Login Required',
      text: 'Please login to access this page.',
      confirmButtonText: 'Login',
      showCancelButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        navigate('/login');
      } else {
        navigate('/');
      }
    });
  }, [user, loading, alertShown, onGuestAlert, navigate]);

  // Wait until auth loading finishes
  if (loading) return null;

  // Guest + onGuestAlert handled by alert, return nothing
  if (!user && onGuestAlert) return null;

  // Fallback redirects
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;

  return children;
};

export default ProtectedRoute;
