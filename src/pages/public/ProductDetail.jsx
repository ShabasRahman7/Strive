import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShoppingCart, Heart, Check } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2";
import api from "../../api/axios";
import { toast } from "react-toastify";
import { getImageProps, formatPrice } from "../../utils/imageUtils";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, updateUserLocal } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inCart, setInCart] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/api/products/${id}/`);
        
        if (res.status === 200) {
          const data = res.data;
          
          if (!data || !data.id) {
            throw new Error("Product not found");
          }

          setProduct(data);
        } else {
          throw new Error("Product not found");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        Swal.fire({
          icon: 'error',
          title: 'Product Not Found',
          text: 'The product you are looking for does not exist or has been deleted.',
          confirmButtonText: 'Go Back',
        }).then(() => {
          navigate("/products");
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Separate useEffect to sync cart and wishlist state with user data
  useEffect(() => {
    if (user && product) {
      const isInCart = user.cart?.some((item) => item.id === product.id);
      const isInWishlist = user.wishlist?.some((item) => item.id === product.id);
      setInCart(isInCart);
      setInWishlist(isInWishlist);
    }
  }, [user, product]);

  const promptLogin = () => {
    Swal.fire({
      icon: "info",
      title: "Login Required",
      text: "Please login to use this feature.",
      showCancelButton: true,
      confirmButtonText: "Login",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        navigate("/login");
      }
    });
  };

  const handleAddToCart = async () => {
    if (!user) return promptLogin();

    if (inCart) return;

    if (!product.isActive || product.count === 0) {
      toast.error("This product is currently unavailable.");
      return;
    }

    try {
      const updatedCart = [...(user.cart || []), { ...product, quantity: 1 }];
      await api.patch('/api/users/cart/', { cart: updatedCart });
      
      const updatedUser = { ...user, cart: updatedCart };
      updateUserLocal(updatedUser);
      setInCart(true);
      toast.success(`${product.name} has been added to cart.`);
    } catch (error) {
      console.error("Failed to update cart:", error);
      toast.error("Failed to add to cart");
    }
  };

  const handleToggleWishlist = async () => {
    if (!user) return promptLogin();

    const isInWishlist = user.wishlist?.some((item) => item.id === product.id);
    const updatedWishlist = isInWishlist
      ? user.wishlist.filter((item) => item.id !== product.id)
      : [...(user.wishlist || []), product];

    const updatedUser = { ...user, wishlist: updatedWishlist };

    try {
      await api.patch('/api/users/wishlist/', { wishlist: updatedWishlist });
      updateUserLocal(updatedUser);
      setInWishlist(!isInWishlist);
      toast.success(`${product.name} has been ${isInWishlist ? "removed from" : "added to"} wishlist.`);
    } catch (error) {
      console.error("Failed to update wishlist:", error);
      toast.error("Failed to update wishlist")
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }
  if (!product) return null;

  const isOutOfStock = product.count === 0;
  const isUnavailable = !product.isActive && !isOutOfStock;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <button
        className="btn btn-outline btn-sm mb-4"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/2">
          <img
            {...getImageProps(product.images?.[0], product.name)}
            className="w-full rounded-lg object-cover"
          />
        </div>

        <div className="md:w-1/2 space-y-3">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-primary text-2xl font-semibold">
            ₹{formatPrice(product.price)}
          </p>
          <p className="text-base text-gray-600 dark:text-gray-400">
            {product.description}
          </p>

          <p>
            <strong>Category:</strong> {product.category}
          </p>

          <p>
            <strong>Status:</strong>{" "}
            {isUnavailable ? (
              <span className="text-yellow-500 font-semibold">
                Currently Unavailable
              </span>
            ) : isOutOfStock ? (
              <span className="text-red-500 font-semibold">Out of Stock</span>
            ) : (
              <span className="text-green-500 font-semibold">In Stock</span>
            )}
          </p>

          <button
            onClick={handleToggleWishlist}
            className={`btn btn-sm ${
              inWishlist ? "btn-error" : "btn-outline"
            } flex items-center gap-2`}
          >
            <Heart
              className={inWishlist ? "fill-current text-white" : ""}
              size={18}
            />
            {inWishlist ? "Wishlisted" : "Add to Wishlist"}
          </button>

          <div className="mt-6">
            {inCart ? (
              <button
                className="btn btn-primary w-full flex gap-2 items-center"
                onClick={() => navigate("/cart")}
              >
                <Check size={18} />
                View in Cart
              </button>
            ) : (
              <button
                className="btn btn-primary w-full flex gap-2 items-center"
                onClick={handleAddToCart}
                disabled={isUnavailable || isOutOfStock}
              >
                <ShoppingCart size={18} />
                {isUnavailable || isOutOfStock
                  ? "Currently Unavailable"
                  : "Add to Cart"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
