import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { toast } from "react-toastify";
import api from "../../api/axios";

const WishlistPage = () => {
  const { user, updateUser } = useAuth();
  const [wishlist, setWishlist] = useState(user?.wishlist || []);
  const [removingId, setRemovingId] = useState(null);
  const navigate = useNavigate();

  const confirmRemoveFromWishlist = async (productId) => {
    const result = await Swal.fire({
      title: "Remove from Wishlist?",
      text: "Are you sure you want to remove this item from your wishlist?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, remove it",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    });

    if (result.isConfirmed) {
      removeFromWishlist(productId);
    }
  };

  const removeFromWishlist = async (productId) => {
    const updatedWishlist = wishlist.filter((item) => item.id !== productId);
    setRemovingId(productId);
    setWishlist(updatedWishlist);

    try {
      // ✅ Use Axios instead of fetch
      await api.patch(`/users/${user.id}`, {
        wishlist: updatedWishlist,
      });

      updateUser({ ...user, wishlist: updatedWishlist });
      toast.success("Item removed from wishlist");
    } catch (err) {
      console.error("Failed to update wishlist:", err);
      toast.error("Failed to remove item");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="max-w-5xl w-full mx-auto px-4">
      <button
        onClick={() => navigate(-1)}
        className="btn btn-sm btn-outline my-4"
      >
        ← Go Back
      </button>

      <div className="flex justify-between items-center mb-6 mt-2">
        <h2 className="text-2xl font-bold">Your Wishlist</h2>
        <p className="text-gray-500 text-sm">{wishlist.length} item(s)</p>
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          Your wishlist is empty.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {wishlist.map((item) => (
            <div
              key={item.id}
              className="card border border-base-300 bg-base-100 shadow-sm hover:shadow-lg rounded-md relative"
            >
              <button
                className="absolute top-2 right-2 btn btn-xs btn-circle btn-error"
                onClick={() => confirmRemoveFromWishlist(item.id)}
                disabled={removingId === item.id}
                title="Remove from Wishlist"
              >
                <Trash2 size={16} />
              </button>

              <figure
                className="aspect-square overflow-hidden cursor-pointer"
                onClick={() => navigate(`/products/${item.id}`)}
              >
                <img
                  src={item.images?.[0]}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </figure>

              <div className="card-body">
                <h2 className="card-title text-base">{item.name}</h2>
                <p className="text-sm text-gray-500 line-clamp-2">
                  {item.description}
                </p>
                <p className="text-lg font-semibold text-primary">
                  ₹{item.price.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
