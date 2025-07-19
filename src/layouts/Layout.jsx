import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import UserNav from "../components/navs/UserNavbar";
import GuestNav from "../components/navs/GuestNavbar";
import { Outlet } from "react-router-dom";
import { toast } from "react-toastify";

function Layout() {
  const { user } = useAuth();

  useEffect(() => {
    const showToast = sessionStorage.getItem("showLoginToast");

    if (showToast) {
      toast.success("Login Successful!");
      sessionStorage.removeItem("showLoginToast");
    }
  }, []);

  return (
    <>
      {user ? <UserNav /> : <GuestNav />}
      <main className="min-h-screen">
        <Outlet />
      </main>
    </>
  );
}

export default Layout;