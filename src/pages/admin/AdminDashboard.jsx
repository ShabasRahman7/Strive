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
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState('yearly'); // 'yearly' or 'monthly'

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const dashboardRes = await api.get("/api/admin/dashboard/");
        setDashboardData(dashboardRes.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (!dashboardData) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  // Dynamic revenue chart data based on toggle
  const revenueData = {
    labels: chartType === 'yearly' 
      ? Object.keys(dashboardData.yearly_revenue)
      : Object.keys(dashboardData.monthly_revenue).map(month => {
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                             'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          return monthNames[parseInt(month) - 1];
        }),
    datasets: [
      {
        label: chartType === 'yearly' ? "Yearly Revenue (₹)" : "Monthly Revenue (₹)",
        data: chartType === 'yearly' 
          ? Object.values(dashboardData.yearly_revenue)
          : Object.values(dashboardData.monthly_revenue),
        fill: false,
        borderColor: chartType === 'yearly' ? "rgb(59, 130, 246)" : "rgb(16, 185, 129)",
        backgroundColor: chartType === 'yearly' ? "rgba(59, 130, 246, 0.2)" : "rgba(16, 185, 129, 0.2)",
        tension: 0.4,
      },
    ],
  };

  // Order status distribution
  const doughnutData = {
    labels: Object.keys(dashboardData.status_distribution),
    datasets: [
      {
        data: Object.values(dashboardData.status_distribution),
        backgroundColor: ["#4ade80", "#facc15", "#00bafe", "#ef4444", "#8b5cf6"],
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

  const lowStock = dashboardData.low_stock_products || [];

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
              {dashboardData.summary.total_users}
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
              {dashboardData.summary.total_products}
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
              {dashboardData.summary.total_orders}
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
              ₹{dashboardData.summary.total_revenue.toFixed(0)}
            </p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="bg-base-100 p-4 rounded shadow flex-1 h-80">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              Revenue Chart ({chartType === 'yearly' ? `2020-${new Date().getFullYear()}` : new Date().getFullYear()})
            </h2>
            <div className="flex gap-2">
              <button
                className={`btn btn-sm ${chartType === 'yearly' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setChartType('yearly')}
              >
                Yearly
              </button>
              <button
                className={`btn btn-sm ${chartType === 'monthly' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setChartType('monthly')}
              >
                Monthly
              </button>
            </div>
          </div>
          <div className="h-full">
            <Line
              data={revenueData}
              options={{
                maintainAspectRatio: false,
                responsive: true,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function(value) {
                        return '₹' + value.toLocaleString();
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>
        <div className="bg-base-100 p-4 rounded shadow w-full lg:w-80 h-96 flex flex-col items-center justify-center">
          <h2 className="text-lg font-semibold mb-2">Order Status Distribution</h2>
          <div className="w-48 h-48">
            <Doughnut
              data={doughnutData}
              options={{
                maintainAspectRatio: false,
                responsive: true,
                plugins: {
                  legend: {
                    position: "bottom",
                    labels: {
                      padding: 15,
                      usePointStyle: true,
                      font: {
                        size: 12
                      }
                    }
                  },
                },
                layout: {
                  padding: {
                    bottom: 20
                  }
                }
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
                  <span className="text-red-600">{p.stock_count} left</span>
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
            {dashboardData.recent_orders.map((order) => (
              <li
                key={order.id}
                className="flex justify-between items-center border-b pb-2"
              >
                <div>
                  <p className="font-medium">#{order.order_number}</p>
                  <p className="text-xs text-gray-500">
                    {order.user?.name || "Unknown User"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    ₹{order.total_amount.toFixed(2)}
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
