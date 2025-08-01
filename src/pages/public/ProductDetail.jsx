import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShoppingCart, Heart, Check } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2";
import api from "../../api/axios";
import { toast } from "react-toastify";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inCart, setInCart] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        
        if (res.status === 200) {
          const data = res.data;
          
          if (!data || !data.id) {
            throw new Error("Product not found");
          }

          setProduct(data);
          if (user) {
            const isInCart = user.cart?.some((item) => item.id === data.id);
            const isInWishlist = user.wishlist?.some((item) => item.id === data.id);
            setInCart(isInCart);
            setInWishlist(isInWishlist);
          }
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
  }, [id, user]);

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

    const updatedCart = [...(user.cart || []), { ...product, quantity: 1 }];
    const updatedUser = { ...user, cart: updatedCart };

    try {
      await api.patch(`/users/${user.id}`, { cart: updatedCart });
      updateUser(updatedUser);
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
      await api.patch(`/users/${user.id}`, { wishlist: updatedWishlist });
      updateUser(updatedUser);
      setInWishlist(!isInWishlist);
      toast.success(`${product.name} has been ${isInWishlist ? "removed from" : "added to"} wishlist.`);
    } catch (error) {
      console.error("Failed to update wishlist:", error);
      toast.error("Failed to update wishlist")
    }
  };

  if (loading) return <div>Loading product details...</div>;
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
            src={product.images[0]}
            alt={product.name}
            className="w-full rounded-lg object-cover"
          />
        </div>

        <div className="md:w-1/2 space-y-3">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-primary text-2xl font-semibold">
            ₹{product.price.toFixed(2)}
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
