import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "../layouts/Layout";
import Home from "../pages/public/Home";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ProductList from "../pages/public/ProductList";
import ProductDetail from "../pages/public/ProductDetail";
import CartPage from "../pages/user/CartPage";
import ProtectedRoute from "./ProtectedRoute";
import WishlistPage from "../pages/user/WishlistPage";
import ProfilePage from "../pages/user/ProfilePage";
import CheckoutPage from "../pages/user/CheckoutPage";
import OrderHistoryPage from "../pages/user/OrderHistoryPage";
import OrderDetailsPage from "../pages/user/OrderDetailsPage";

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
        <Route
          path="wishlist"
          element={
            <ProtectedRoute role="user" onGuestAlert>
              <WishlistPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute role="user" onGuestAlert>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="checkout"
          element={
            <ProtectedRoute role="user" onGuestAlert>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="orders"
          element={
            <ProtectedRoute role="user" onGuestAlert>
              <OrderHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="orders/:id"
          element={
            <ProtectedRoute role="user" onGuestAlert>
              <OrderDetailsPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Auth pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
