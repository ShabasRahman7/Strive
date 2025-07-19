import { Routes, Route, Navigate } from "react-router-dom";

// Layout
import Layout from "../layouts/Layout";

// Pages
import Home from "../pages/public/Home";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ProductList from "../pages/public/ProductList";
import ProductDetail from "../pages/public/ProductDetail";
import CartPage from "../pages/user/CartPage";

// Protected Route
import ProtectedRoute from "./ProtectedRoute";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Shared layout */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="products" element={<ProductList />} />
        <Route path="/products/:id" element={<ProductDetail />} />

        {/* Protected Routes */}
        <Route
          path="user"
          element={
            <ProtectedRoute role="user">
              <div>User Dashboard or Page</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="cart"
          element={
            <ProtectedRoute role="user" onGuestAlert>
              <CartPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Auth pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* 404 fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
