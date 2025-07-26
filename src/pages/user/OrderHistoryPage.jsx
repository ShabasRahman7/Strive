import React from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const OrderHistoryPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const orders = user?.orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) || [];

  return (
    <div className="max-w-4xl mx-auto p-4">
      <button
        className="btn btn-outline btn-sm mb-4"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>
      <h1 className="text-3xl font-bold mb-6">Order History</h1>

      {orders.length === 0 ? (
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
                    Order ID: {order.id.slice(0, 8)}...
                  </p>
                  <p className="text-sm text-gray-500">
                    Date: {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    ₹{order.totalAmount.toFixed(2)}
                  </p>
                  <span
                    className={`badge ${
                      order.status === "pending"
                        ? "badge-warning"
                        : order.status === "shipped"
                        ? "badge-info"
                        : "badge-success"
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
