import React, { useEffect } from "react";
import UserNav from "../components/navs/UserNavbar";
import Home from "../pages/public/Home";
import { toast } from "react-toastify";

function UserLayout() {
  useEffect(() => {
    const showToast = sessionStorage.getItem("showLoginToast");

    if (showToast) {
      toast.success("Login Successful!");
      sessionStorage.removeItem("showLoginToast");
    }
  }, []);

  return (
    <>
      <UserNav />
      <Home />
    </>
  );
}

export default UserLayout;
