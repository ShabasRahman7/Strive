import React from "react";
import { Link } from "react-router-dom";

function GuestNavbar() {
  return (
    <div className="navbar bg-base-100 shadow-sm sm:px-10 sticky">
      <div className="flex-1">
        <img
          src="/strive-logo.png"
          alt="Strive Logo"
          className="h-7 w-auto object-contain"
        />
      </div>
      <div className="flex-none">
        <Link to="/login">
          <button className="btn btn-primary">Login</button>
        </Link>
      </div>
    </div>
  );
}

export default GuestNavbar;
