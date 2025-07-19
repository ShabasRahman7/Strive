import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Layout
import Layout from '../layouts/Layout';

// Pages
import Home from '../pages/public/Home';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

// Protected Route wrapper (imported from separate file)
import ProtectedRoute from './ProtectedRoute';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Unified layout for both guest and user */}
      <Route path="/" element={<Layout />}>
        {/* Home page (public or shared) */}
        <Route index element={<Home />} />

        {/* ✅ Example: More routes can go here in future */}
        {/* <Route path="products" element={<ProductList />} /> */}

        {/* ✅ Protected route for logged-in users */}
        <Route
          path="user"
          element={
            <ProtectedRoute role="user">
              <div>User Dashboard or Page</div>
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Auth pages (outside layout) */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;