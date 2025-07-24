import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/navs/AdminSidebar";
import { toast } from "react-toastify";

function AdminLayout() {
  useEffect(() => {
    const showToast = sessionStorage.getItem("showLoginToast");

    if (showToast) {
      toast.success("Login Successful!");
      sessionStorage.removeItem("showLoginToast");
    }
  }, []);

  return (
    <>
      <AdminSidebar />
      <Outlet />
    </>
  );
}

export default AdminLayout;
