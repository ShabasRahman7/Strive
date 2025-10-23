import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const OrderHistoryPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        // Fetch authenticated user's orders from backend
        const { data } = await api.get('/api/orders/');
        if (!isMounted) return;
        // Handle paginated or plain array responses
        const list = Array.isArray(data) ? data : (Array.isArray(data.results) ? data.results : []);
        // Sort by created_at desc
        const sorted = [...list].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setOrders(sorted);
      } catch (e) {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <button
        className="btn btn-outline btn-sm mb-4"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>
      <h1 className="text-3xl font-bold mb-6">Order History</h1>

      {loading ? (
        <div className="text-gray-500 text-center">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="text-gray-500 text-center">No orders yet.</div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="p-4 rounded-lg shadow bg-base-100 hover:bg-base-200 cursor-pointer transition"
              onClick={() => navigate(`/orders/${order.id}`)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">
                    Order #: {order.order_number || String(order.id).padStart(6, '0')}
                  </p>
                  <p className="text-sm text-gray-500">
                    Date: {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    ₹{Number(order.total_amount).toFixed(2)}
                  </p>
                  <span
                    className={`badge ${
                      order.status === "pending"
                        ? "badge-warning"
                        : order.status === "shipped"
                        ? "badge-info"
                        : order.status === "delivered"
                        ? "badge-success"
                        : order.status === "cancelled"
                        ? "badge-error"
                        : "badge-neutral"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistoryPage;
