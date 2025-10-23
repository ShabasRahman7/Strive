import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { safeLocalStorage } from "../../utils/tokenStorage";
import {
  LayoutDashboard,
  Users,
  Package,
  ClipboardList,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
} from "lucide-react";
import Swal from "sweetalert2";

export default function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(
    safeLocalStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Are you sure to logout!?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes",
    });

    if (result.isConfirmed) {
      logout();
      navigate("/login");
    }
  };

  const toggleSidebar = () => setIsOpen(!isOpen);

  const toggleTheme = () => {
    const newTheme = isDark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    safeLocalStorage.setItem("theme", newTheme);
    setIsDark(!isDark);
  };

  return (
    <div className="flex min-h-screen bg-base-200">
      {/* Sidebar */}
      <aside
        className={`bg-base-100 w-65 p-5 shadow-md fixed top-0 left-0 h-full z-50 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } xl:translate-x-0 transition-transform duration-300 ease-in-out`}
      >
        <div className="flex items-center justify-between mb-6 pl-3">
          <h2 className="text-lg font-bold">Admin Panel</h2>
          <button className="xl:hidden text-xl" onClick={toggleSidebar}>
            <X />
          </button>
        </div>

        <div className="text-sm text-gray-500 mb-4 pl-3">
          Welcome, <span className="font-semibold">{user?.name}</span>
        </div>

        <ul className="space-y-2 pl-3 list-none">
          <li>
            <Link
              to="/admin"
              className="flex items-center gap-2 py-2 hover:bg-base-300 transition-colors"
            >
              <LayoutDashboard size={18} /> Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="/admin/users"
              className="flex items-center gap-2 py-2  hover:bg-base-300 transition-colors"
            >
              <Users size={18} /> User Management
            </Link>
          </li>
          <li>
            <Link
              to="/admin/products"
              className="flex items-center gap-2 py-2  hover:bg-base-300 transition-colors"
            >
              <Package size={18} /> Product Management
            </Link>
          </li>
          <li>
            <Link
              to="/admin/orders"
              className="flex items-center gap-2 py-2  hover:bg-base-300 transition-colors"
            >
              <ClipboardList size={18} /> Order Management
            </Link>
          </li>
          <li>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 py-2  hover:bg-base-300 transition-colors w-full text-left"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
              {isDark ? "Light Mode" : "Dark Mode"}
            </button>
          </li>
          <li>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 py-2  hover:bg-base-300 transition-colors w-full text-left"
            >
              <LogOut size={18} /> Logout
            </button>
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0 xl:ml-64">
        <main className="p-4 overflow-auto min-h-screen">
          <button className="xl:hidden m-2" onClick={toggleSidebar}>
            <Menu size={24} />
          </button>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
