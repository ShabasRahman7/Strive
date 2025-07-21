import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2";
import api from "../../api/axios";

const CheckoutPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cod");

  const cartItems = state?.cartItems || [];

  useEffect(() => {
    if (!cartItems.length) {
      navigate("/cart");
    }
  }, [cartItems, navigate]);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      Swal.fire("Select Address", "Please choose a delivery address", "info");
      return;
    }

    const selectedAddress = user.addresses.find(
      (a) => a.id === selectedAddressId
    );

    try {
      // ✅ Step 1: Validate stock and availability
      const invalidItems = [];

      for (const item of cartItems) {
        const { data: product } = await api.get(`/products/${item.id}`);

        if (!product.isActive) {
          invalidItems.push(`❌ ${item.name} is inactive`);
        } else if (item.quantity > product.count) {
          invalidItems.push(
            `❌ ${item.name} only has ${product.count} in stock`
          );
        }
      }

      if (invalidItems.length > 0) {
        Swal.fire("Order Error", invalidItems.join("<br>"), "warning");
        return;
      }

      // ✅ Step 2: Create order object with unique ID
      const order = {
        id: crypto.randomUUID(),
        items: cartItems,
        totalAmount: subtotal,
        address: selectedAddress,
        paymentMethod,
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      const updatedOrders = [...user.orders, order];

      // ✅ Step 3: Update stock in the backend
      await Promise.all(
        cartItems.map(async (item) => {
          const { data: product } = await api.get(`/products/${item.id}`);

          await api.patch(`/products/${item.id}`, {
            count: product.count - item.quantity,
          });
        })
      );

      // ✅ Step 4: Clear cart and update user orders
      await updateUser({ ...user, cart: [], orders: updatedOrders });

      Swal.fire(
        "Order Placed",
        "Your order has been placed successfully!",
        "success"
      );
      navigate("/orders");
    } catch (error) {
      console.error("Order Error:", error);
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
              value="upi"
              checked={paymentMethod === "upi"}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            <span className="ml-2">UPI</span>
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
