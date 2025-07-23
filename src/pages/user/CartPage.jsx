import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Plus, Minus, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const CartPage = () => {
  const { user, updateUser } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setCartItems(
      user?.cart?.map((item) => ({ ...item, quantity: item.quantity || 1 })) ||
        []
    );
  }, [user]);

  const updateQuantity = async (productId, newQty) => {
    if (newQty < 1 || newQty > 10) return;
    setIsProcessing(true);
    const updated = cartItems.map((item) =>
      item.id !== productId ? item : { ...item, quantity: newQty }
    );
    setCartItems(updated);
    await persistCart(updated);
    setIsProcessing(false);
  };

  const confirmRemoveItem = async (productId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to remove this item from your cart?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, remove it!",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    });

    if (result.isConfirmed) {
      removeItem(productId);
    }
  };

  const removeItem = async (productId) => {
    setIsProcessing(true);
    const updated = cartItems.filter((item) => item.id !== productId);
    setCartItems(updated);
    await persistCart(updated);
    setIsProcessing(false);
  };

  const persistCart = async (updatedCart) => {
    try {
      await api.patch(`/users/${user.id}`, { cart: updatedCart });
      updateUser({ ...user, cart: updatedCart });
    } catch (err) {
      console.error("Cart persist error", err);
    }
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleCheckout = async () => {
    const result = await Swal.fire({
      title: "Proceed to Checkout?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes",
    });

    if (result.isConfirmed) {
      navigate("/checkout", { state: { cartItems } });
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <button
        className="btn btn-outline btn-sm mb-4"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
      {cartItems.length === 0 ? (
        <div className="text-center text-gray-500">Your cart is empty.</div>
      ) : (
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row items-center justify-between bg-base-100 p-4 rounded-lg shadow gap-4"
            >
              <div
                className="flex items-center gap-4 w-full sm:w-1/2 cursor-pointer hover:bg-base-200 p-2 rounded-lg transition"
                onClick={() => navigate(`/products/${item.id}`)}
              >
                <img
                  src={item.images?.[0]}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div>
                  <h2 className="font-semibold">{item.name}</h2>
                  <p className="text-gray-600">₹{item.price.toFixed(2)}</p>
                </div>
              </div>

              <div className="flex items-center justify-center sm:justify-end gap-6 w-full sm:w-1/2">
                <div className="btn-group">
                  <button
                    className="btn btn-sm btn-ghost"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={isProcessing}
                  >
                    <Minus size={16} />
                  </button>
                  <button className="btn btn-sm btn-ghost cursor-default">
                    {item.quantity}
                  </button>
                  <button
                    className="btn btn-sm btn-ghost"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={isProcessing}
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <p className="font-semibold whitespace-nowrap">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </p>
                  <button
                    className="btn btn-sm btn-error"
                    onClick={() => confirmRemoveItem(item.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-between pt-4 border-t">
            <span className="text-xl font-semibold">Subtotal</span>
            <span className="text-xl font-semibold">
              ₹{subtotal.toFixed(2)}
            </span>
          </div>

          <button className="btn btn-primary w-full py-3 mt-6" onClick={handleCheckout}>
            Checkout
          </button>
        </div>
      )}
    </div>
  );
};

export default CartPage;
