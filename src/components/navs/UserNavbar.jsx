import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Sun,
  Moon,
  Home,
  Heart,
  ShoppingBag,
  LogOut,
  UserRound,
} from "lucide-react";

function UserNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Safely compute cart data
  const cartItems = user?.cart || [];
  const cartItemCount = cartItems.length;
  const cartSubtotal = cartItems.reduce(
    (acc, item) => acc + (item.price || 0),
    0
  );

  return (
    <div className="bg-base-100 shadow-sm sticky top-0 z-50">
      <div className="navbar max-w-5xl w-full mx-auto px-4">
        <div className="flex-1">
          <img
            src="/strive-logo.png"
            alt="Strive Logo"
            className="h-7 w-auto object-contain"
          />
        </div>

        <div className="flex-none flex items-center gap-3">
          {/* Theme toggle button */}
          <button
            onClick={toggleTheme}
            className="btn btn-ghost btn-circle"
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </button>

          {/* Cart Dropdown */}
          <div className="dropdown dropdown-end mr-1">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle"
            >
              <div className="indicator">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <span className="badge badge-sm indicator-item">
                  {cartItemCount}
                </span>
              </div>
            </div>
            <div
              tabIndex={0}
              className="card card-compact dropdown-content bg-base-100 z-10 mt-3 w-60 shadow"
            >
              <div className="card-body">
                <span className="text-lg font-bold">
                  {cartItemCount} {cartItemCount === 1 ? "Item" : "Items"}
                </span>
                <span className="text-info">
                  Subtotal: ₹{cartSubtotal.toFixed(2)}
                </span>
                <div className="card-actions">
                  <button
                    className="btn btn-primary btn-block"
                    onClick={() => navigate("/cart")}
                  >
                    View Cart
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* User Avatar Dropdown */}
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle avatar"
            >
              <div className="w-10 rounded-full">
                <img
                  alt="User Avatar"
                  src={user?.profileImage}
                  className="object-cover"
                />
              </div>
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content bg-base-100 rounded-box z-10 mt-3 w-52 p-2 shadow"
            >
              <li>
                <a onClick={() => navigate("/")}>
                  <Home className="w-4 h-4 mr-2" /> Home
                </a>
              </li>
              <li>
                <a onClick={() => navigate("/profile")}>
                  <UserRound className="w-4 h-4 mr-2" />
                  Profile
                  <span className="badge ml-auto">New</span>
                </a>
              </li>
              <li>
                <a onClick={() => navigate("/wishlist")}>
                  <Heart className="w-4 h-4 mr-2" /> Wishlist
                </a>
              </li>
              <li>
                <a onClick={() => navigate("/orders")}>
                  <ShoppingBag className="w-4 h-4 mr-2" /> Orders
                </a>
              </li>
              <li>
                <button onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" /> Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserNavbar;
