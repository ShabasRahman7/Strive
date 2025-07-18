import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Layouts
import UserLayout from '../layouts/UserLayout';
import GuestLayout from '../layouts/GuestLayout';

// Auth Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

// Public Pages
// import Home from '../pages/public/Home'; // optional

// ProtectedRoute
const ProtectedRoute = ({ children, role }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Route with layout */}
      <Route path="/" element={<GuestLayout />}>
        {/* Optional nested public content */}
        {/* <Route index element={<Home />} /> */}
      </Route>

      {/* Protected User Route */}
      <Route
        path="/user"
        element={
          <ProtectedRoute role="user">
            <UserLayout />
          </ProtectedRoute>
        }
      />

      {/* Auth Routes (outside GuestLayout to allow redirect if logged in) */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
