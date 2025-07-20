import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const OrderDetailsPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const order = user?.orders?.find((o) => o.id === id);

  if (!order) {
    return (
      <div className="text-center mt-10 text-red-500">
        Order not found.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <button className="btn btn-outline btn-sm mb-4" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <h1 className="text-3xl font-bold mb-4">Order Details</h1>

      <div className="bg-base-100 p-4 rounded-lg shadow space-y-4">
        <div>
          <p className="font-semibold">Order ID:</p>
          <p>{order.id}</p>
        </div>

        <div>
          <p className="font-semibold">Order Date:</p>
          <p>{new Date(order.createdAt).toLocaleString()}</p>
        </div>

        <div>
          <p className="font-semibold">Status:</p>
          <span
            className={`badge ${
              order.status === "pending"
                ? "badge-warning"
                : order.status === "success"
                ? "badge-success"
                : "badge-error"
            }`}
          >
            {order.status}
          </span>
        </div>

        <div>
          <p className="font-semibold">Payment Method:</p>
          <p>{order.paymentMethod.toUpperCase()}</p>
        </div>

        <div>
          <p className="font-semibold">Delivery Address:</p>
          <p>
            {order.address.line1}, {order.address.city}, {order.address.state} -{" "}
            {order.address.pin}
          </p>
        </div>

        <div>
          <p className="font-semibold mb-2">Items:</p>
          <ul className="space-y-2">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between border-b pb-1">
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span>₹{(item.price * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div className="text-right font-bold mt-2">
            Total: ₹{order.totalAmount.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
