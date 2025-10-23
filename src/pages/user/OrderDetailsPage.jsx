import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const OrderDetailsPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get(`/api/orders/${id}/`);
        if (!mounted) return;
        setOrder(data);
      } catch (e) {
        setError("Order not found.");
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  const handleCancelOrder = async () => {
    const result = await Swal.fire({
      title: "Cancel Order?",
      text: "Are you sure you want to cancel this order? This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, cancel it!",
    });

    if (result.isConfirmed) {
      try {
        await api.patch(`/api/orders/${id}/cancel/`);
        toast.success("Order cancelled successfully");
        // Refresh the order data
        const { data } = await api.get(`/api/orders/${id}/`);
        setOrder(data);
      } catch (error) {
        toast.error("Failed to cancel order");
        console.error("Cancel order error:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="text-center mt-10 text-error font-semibold">
        {error || "Order not found."}
      </div>
    );
  }

  const hasPayment = !!order.payment;

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-4">
      {/* Back button */}
      <button
        className="btn btn-sm btn-outline mb-4 flex items-center gap-1"
        onClick={() => navigate(-1)}
      >
        <span>←</span> Back
      </button>

      {/* Order Card */}
      <div className="card bg-base-100 shadow-lg border border-base-300">
        <div className="card-body p-4 sm:p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h1 className="text-xl sm:text-2xl font-semibold">
              Order #{order.order_number || order.id}
            </h1>

            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`badge badge-md ${
                  order.status === "pending"
                    ? "badge-warning"
                    : order.status === "shipped"
                    ? "badge-info"
                    : order.status === "delivered"
                    ? "badge-success"
                    : order.status === "cancelled"
                    ? "badge-error"
                    : "badge-ghost"
                }`}
              >
                {order.status}
              </span>
              {order.payment_method && (
                <span className="badge badge-outline text-xs sm:text-sm">
                  {String(order.payment_method).toUpperCase()}
                </span>
              )}
              {order.status === "pending" && (
                <button
                  className="btn btn-sm btn-error"
                  onClick={handleCancelOrder}
                >
                  Cancel Order
                </button>
              )}
            </div>
          </div>

          <div className="divider my-3"></div>

          {/* Content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left Section */}
            <div className="lg:col-span-2 space-y-4">
              {/* Stats */}
              <div className="stats shadow w-full bg-base-200">
                <div className="stat">
                  <div className="stat-title text-sm sm:text-base">
                    Order Date
                  </div>
                  <div className="stat-value text-base sm:text-lg">
                    {new Date(order.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="stat">
                  <div className="stat-title text-sm sm:text-base">Total</div>
                  <div className="stat-value text-primary text-base sm:text-lg">
                    ₹{Number(order.total_amount).toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="rounded-box border border-base-300 p-3 sm:p-4 bg-base-200">
                <p className="font-semibold mb-3 text-sm sm:text-base">
                  Items
                </p>
                <div className="overflow-x-auto">
                  <table className="table table-zebra text-sm">
                    <thead className="text-xs sm:text-sm">
                      <tr>
                        <th>Product</th>
                        <th className="text-right">Qty</th>
                        <th className="text-right">Price</th>
                        <th className="text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item) => (
                        <tr key={item.id}>
                          <td>{item.product?.name || `#${item.product}`}</td>
                          <td className="text-right">{item.quantity}</td>
                          <td className="text-right">
                            ₹{Number(item.price).toFixed(2)}
                          </td>
                          <td className="text-right">
                            ₹
                            {(
                              Number(item.price) * Number(item.quantity)
                            ).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <th colSpan={3} className="text-right font-medium">
                          Total
                        </th>
                        <th className="text-right">
                          ₹{Number(order.total_amount).toFixed(2)}
                        </th>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Section */}
            <div className="space-y-4">
              {/* Address */}
              <div className="rounded-box border border-base-300 p-3 sm:p-4 bg-base-200">
                <p className="font-semibold mb-2 text-sm sm:text-base">
                  Delivery Address
                </p>
                {order.shipping_address ? (
                  <div className="text-sm leading-6">
                    <div>{order.shipping_address.line1}</div>
                    <div>
                      {order.shipping_address.city},{" "}
                      {order.shipping_address.state} -{" "}
                      {order.shipping_address.pin_code}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">
                    No shipping address provided.
                  </p>
                )}
              </div>

              {/* Payment */}
              {hasPayment && (
                <div className="rounded-box border border-base-300 p-3 sm:p-4 bg-base-200">
                  <p className="font-semibold mb-2 text-sm sm:text-base">
                    Payment Details
                  </p>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Provider</span>
                      <span className="font-medium text-right break-words">
                        {order.payment.provider}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Amount</span>
                      <span className="font-medium text-right break-words">
                        ₹{Number(order.payment.amount).toFixed(2)}{" "}
                        {order.payment.currency}
                      </span>
                    </div>
                    {order.payment.status && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Status</span>
                        <span className="font-medium text-right break-words">
                          {order.payment.status}
                        </span>
                      </div>
                    )}
                    {order.payment.method && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Method</span>
                        <span className="font-medium text-right break-words">
                          {order.payment.method}
                        </span>
                      </div>
                    )}
                    {order.payment.razorpay_payment_id && (
                      <div className="flex flex-col sm:flex-row justify-between">
                        <span className="text-gray-500">Payment ID</span>
                        <span className="font-mono text-xs text-right break-all">
                          {order.payment.razorpay_payment_id}
                        </span>
                      </div>
                    )}
                    {order.payment.razorpay_order_id && (
                      <div className="flex flex-col sm:flex-row justify-between">
                        <span className="text-gray-500">Razorpay Order</span>
                        <span className="font-mono text-xs text-right break-all">
                          {order.payment.razorpay_order_id}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
