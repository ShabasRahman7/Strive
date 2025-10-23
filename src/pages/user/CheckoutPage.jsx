import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2";
import api from "../../api/axios";
import { toast } from "react-toastify";

const CheckoutPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user, updateUserLocal } = useAuth();
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cod");

  const cartItems = state?.cartItems || [];

  useEffect(() => {
    if (!cartItems.length) {
      navigate("/cart");
    }
  }, [cartItems, navigate]);

  // Prevent direct access to checkout without cart items
  if (!cartItems.length) {
    return (
      <div className="max-w-4xl mx-auto p-4 text-center">
        <h1 className="text-3xl font-bold mb-4">Checkout</h1>
        <p className="text-gray-500 mb-4">No items in cart to checkout.</p>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/cart")}
        >
          Go to Cart
        </button>
      </div>
    );
  }

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const afterOrderPlaced = async () => {
    try {
      const { data: profile } = await api.get('/api/users/profile/');
      updateUserLocal(profile);
    } catch (_) {
      updateUserLocal({ ...user, cart: [] });
    }
    navigate("/orders");
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      Swal.fire("Select Address", "Please choose a delivery address", "info");
      return;
    }

    try {
      if (paymentMethod === 'cod') {
        const payload = {
          shipping_address_id: selectedAddressId,
          payment_method: 'cash',
        };
        await api.post('/api/orders/create_from_cart/', payload);
        await Swal.fire(
          "Order Placed",
          "Your order has been placed successfully!",
          "success"
        );
        await afterOrderPlaced();
        return;
      }

      // Razorpay flow
      const ok = await loadRazorpayScript();
      if (!ok) {
        toast.error("Failed to load Razorpay. Check your connection.");
        Swal.fire("Error", "Failed to load Razorpay. Check your connection.", "error");
        return;
      }

      // Create Razorpay order on backend for current cart total
      let rp;
      try {
        const resp = await api.post('/api/payments/razorpay/create-order/');
        rp = resp.data;
      } catch (e) {
        console.error(e);
        toast.error("Payment initialization failed.");
        Swal.fire("Error", "Payment initialization failed.", "error");
        return;
      }

      if (!rp?.order_id || !rp?.key_id) {
        toast.error("Invalid payment setup.");
        Swal.fire("Error", "Invalid payment setup.", "error");
        return;
      }

      const options = {
        key: rp.key_id,
        amount: rp.amount,
        currency: rp.currency,
        name: "Strive Store",
        description: "Order Payment",
        order_id: rp.order_id,
        prefill: {
          name: user?.name || user?.email,
          email: user?.email,
        },
        theme: { color: "#570df8" },
        handler: async function (response) {
          try {
            const verifyPayload = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              shipping_address_id: selectedAddressId,
            };
            await api.post('/api/payments/razorpay/verify/', verifyPayload);
            toast.success("Payment successful. Order placed!");
            await Swal.fire("Payment Success", "Your order has been placed!", "success");
            await afterOrderPlaced();
          } catch (e) {
            console.error('Verify failed', e);
            toast.error("Payment verification failed.");
            Swal.fire("Error", "Payment verification failed.", "error");
          }
        },
        modal: {
          ondismiss: () => {
            toast.info("Payment cancelled.");
            Swal.fire("Cancelled", "Payment was cancelled.", "info");
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (resp) {
        console.error('Payment failed', resp);
        const reason = resp?.error?.description || 'Payment failed. Please try again.';
        toast.error(reason);
        Swal.fire("Payment Failed", reason, "error");
      });
      rzp.open();
    } catch (error) {
      console.error("Order Error:", error);
      toast.error("Failed to place order");
      Swal.fire("Error", "Failed to place order", "error");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <button
        onClick={() => navigate(-1)}
        className="btn btn-sm btn-outline my-4"
      >
        ← Go Back
      </button>
      <h1 className="text-3xl font-bold mb-4">Checkout</h1>

      {/* Cart Summary */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Order Summary</h2>
        <ul className="space-y-2">
          {cartItems.map((item) => (
            <li key={item.id} className="flex justify-between">
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>₹{(item.price * item.quantity).toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <div className="text-right font-bold text-lg mt-2">
          Subtotal: ₹{subtotal.toFixed(2)}
        </div>
      </div>

      {/* Address Selection */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Delivery Address</h2>
        {user.addresses.length === 0 ? (
          <div>
            <p className="text-gray-500">No address found.</p>
            <button
              className="btn btn-outline mt-2"
              onClick={() => navigate("/profile")}
            >
              Add Address
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {user.addresses.map((address) => (
              <div
                key={address.id}
                className={`p-3 border rounded cursor-pointer ${
                  selectedAddressId === address.id
                    ? "border-primary bg-primary text-white"
                    : "border-base-300"
                }`}
                onClick={() => setSelectedAddressId(address.id)}
              >
                <p>
                  {address.line1}, {address.city}, {address.state} -{" "}
                  {address.pin}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Method */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Payment Method</h2>
        <div className="flex gap-4">
          <label className="label cursor-pointer">
            <input
              type="radio"
              name="payment"
              className="radio"
              value="cod"
              checked={paymentMethod === "cod"}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <span className="ml-2">Cash on Delivery</span>
          </label>
          <label className="label cursor-pointer">
            <input
              type="radio"
              name="payment"
              className="radio"
              value="razorpay"
              checked={paymentMethod === "razorpay"}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <span className="ml-2">Razorpay</span>
          </label>
        </div>
      </div>

      {/* Place Order */}
      <button className="btn btn-primary w-full" onClick={handlePlaceOrder}>
        Place Order
      </button>
    </div>
  );
};

export default CheckoutPage;
