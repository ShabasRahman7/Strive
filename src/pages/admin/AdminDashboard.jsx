import { useEffect, useState } from "react";
import api from "../../api/axios";
import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Users, Box, ShoppingCart, DollarSign } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [userRes, productRes] = await Promise.all([
          api.get("/users"),
          api.get("/products"),
        ]);
        const allUsers = userRes.data;
        const allOrders = allUsers.flatMap((user) =>
          Array.isArray(user.orders)
            ? user.orders.map((order) => ({ ...order, user }))
            : []
        );
        setUsers(allUsers);
        setProducts(productRes.data);
        setOrders(allOrders);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const revenueData = {
    labels: orders
      .reverse()
      .slice(0, 10)
      .map((o) => new Date(o.createdAt).toLocaleDateString()),
    datasets: [
      {
        label: "Revenue",
        data: orders.slice(0, 10).map((o) => o.totalAmount),
        fill: false,
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        tension: 0.4,
      },
    ],
  };

  const statusCounts = orders.reduce((acc, order) => {
    if (order.status) acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});

  const doughnutData = {
    labels: Object.keys(statusCounts),
    datasets: [
      {
        data: Object.values(statusCounts),
        backgroundColor: ["#4ade80", "#facc15", "#f87171", "#a78bfa"],
        borderWidth: 1,
      },
    ],
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "badge-warning";
      case "shipped":
        return "badge-info";
      case "delivered":
        return "badge-success";
      default:
        return "badge-neutral";
    }
  };

  const lowStock = products.filter((p) => p.count < 5);

  if (loading) {
    return <div className="p-6 text-lg font-medium">Loading dashboard...</div>;
  }

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">
        Good{" "}
        {new Date().getHours() < 12
          ? "morning"
          : new Date().getHours() < 18
          ? "afternoon"
          : "evening"}
        , Admin 👋
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-base-100 p-4 rounded shadow flex items-center gap-4">
          <Users
            className="w-8 h-8 sm:w-9 sm:h-9 md:w-9 md:h-9"
            color="#3B82F6"
          />
          <div>
            <h2 className="text-gray-600 text-sm sm:text-base md:text-base">
              Total Users
            </h2>
            <p className="text-2xl sm:text-3xl md:text-3xl font-bold">
              {users.length}
            </p>
          </div>
        </div>
        <div className="bg-base-100 p-4 rounded shadow flex items-center gap-4">
          <Box
            className="w-8 h-8 sm:w-9 sm:h-9 md:w-9 md:h-9"
            color="#10B981"
          />
          <div>
            <h2 className="text-gray-600 text-sm sm:text-base md:text-base">
              Total Products
            </h2>
            <p className="text-2xl sm:text-3xl md:text-3xl font-bold">
              {products.length}
            </p>
          </div>
        </div>
        <div className="bg-base-100 p-4 rounded shadow flex items-center gap-4">
          <ShoppingCart
            className="w-8 h-8 sm:w-9 sm:h-9 md:w-9 md:h-9"
            color="#FBBF24"
          />
          <div>
            <h2 className="text-gray-600 text-sm sm:text-base md:text-base">
              Total Orders
            </h2>
            <p className="text-2xl sm:text-3xl md:text-3xl font-bold">
              {orders.length}
            </p>
          </div>
        </div>
        <div className="bg-base-100 p-4 rounded shadow flex items-center gap-4">
          <DollarSign
            className="w-8 h-8 sm:w-9 sm:h-9 md:w-9 md:h-9"
            color="#A855F7"
          />
          <div>
            <h2 className="text-gray-600 text-sm sm:text-base md:text-base">
              Total Revenue
            </h2>
            <p className="text-2xl sm:text-3xl md:text-3xl font-bold">
              ₹{totalRevenue.toFixed(0)}
            </p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="bg-base-100 p-4 rounded shadow flex-1 h-80">
          <h2 className="text-lg font-semibold mb-2">Revenue Overview</h2>
          <div className="h-full">
            <Line
              data={revenueData}
              options={{
                maintainAspectRatio: false,
                responsive: true,
              }}
            />
          </div>
        </div>
        <div className="bg-base-100 p-4 rounded shadow w-full md:w-80 h-80 flex flex-col items-center justify-center">
          <h2 className="text-lg font-semibold mb-2">Order Status</h2>
          <div className="w-40 h-40">
            <Doughnut
              data={doughnutData}
              options={{
                maintainAspectRatio: false,
                responsive: true,
                plugins: {
                  legend: {
                    position: "bottom",
                  },
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* Low Stock & Recent Orders */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="bg-base-100 p-4 rounded shadow lg:w-1/3">
          <h2 className="text-lg font-semibold mb-3">Low Stock Products</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            {lowStock.length > 0 ? (
              lowStock.map((p) => (
                <li key={p.id}>
                  {p.name} —{" "}
                  <span className="text-red-600">{p.count} left</span>
                </li>
              ))
            ) : (
              <p className="text-gray-500">No low stock products</p>
            )}
          </ul>
        </div>

        <div className="bg-base-100 p-4 rounded shadow lg:w-2/3">
          <h2 className="text-lg font-semibold mb-3">Recent Orders</h2>
          <ul className="space-y-2 text-sm">
            {orders
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .slice(0, 3)
              .map((order) => (
                <li
                  key={order.id}
                  className="flex justify-between items-center border-b pb-2"
                >
                  <div>
                    <p className="font-medium">#{order.id.slice(0, 8)}...</p>
                    <p className="text-xs text-gray-500">
                      {order.user?.name || "Unknown User"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      ₹{order.totalAmount?.toFixed(2)}
                    </p>
                    <span
                      className={`badge text-xs ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </div>
                </li>
              ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
