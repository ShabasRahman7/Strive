import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Layouts

// Public Pages

// Auth Pages
// import Login from '../pages/auth/Login';
// import Register from '../pages/auth/Register';

// User Pages


const ProtectedRoute = ({ children, role }) => {
  const { user } = useAuth();

  if (!user || !user.role) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>

      {/* Public Routes */}
      <Route element={<GuestLayout />}>
        <Route path="/" element={<Home />} />
      </Route>

      {/* User Routes */}
      <Route
        path="/user"
        element={
          <ProtectedRoute role="user">
            <UserLayout />
          </ProtectedRoute>
        }
      >
      </Route>

      {/* Admin Routes */}

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
