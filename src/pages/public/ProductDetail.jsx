import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShoppingCart, Heart, Check } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inCart, setInCart] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);

  // Fetch product details and check cart/wishlist
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`http://localhost:3001/products/${id}`);
        if (!res.ok) throw new Error("Product not found");
        const data = await res.json();
        setProduct(data);

        if (user) {
          const isInCart = user.cart?.some(item => item.id === data.id);
          const isInWishlist = user.wishlist?.some(item => item.id === data.id);
          setInCart(isInCart);
          setInWishlist(isInWishlist);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, user]);

  // Show login prompt if guest user
  const promptLogin = () => {
    Swal.fire({
      icon: "info",
      title: "Login Required",
      text: "Please login to use this feature.",
      showCancelButton: true,
      confirmButtonText: "Login",
      cancelButtonText: "Cancel"
    }).then(result => {
      if (result.isConfirmed) {
        navigate("/login");
      }
    });
  };

  // Add to cart handler
  const handleAddToCart = async () => {
    if (!user) return promptLogin();

    const alreadyInCart = user.cart?.some(item => item.id === product.id);
    if (alreadyInCart) return;

    const updatedCart = [...(user.cart || []), product];
    const updatedUser = { ...user, cart: updatedCart };

    try {
      await fetch(`http://localhost:3001/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart: updatedCart })
      });

      updateUser(updatedUser);
      setInCart(true);
    } catch (error) {
      console.error("Failed to update cart:", error);
    }
  };

  // Wishlist toggle handler
  const handleToggleWishlist = async () => {
    if (!user) return promptLogin();

    const isInWishlist = user.wishlist?.some(item => item.id === product.id);
    const updatedWishlist = isInWishlist
      ? user.wishlist.filter(item => item.id !== product.id)
      : [...(user.wishlist || []), product];

    const updatedUser = { ...user, wishlist: updatedWishlist };

    try {
      await fetch(`http://localhost:3001/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wishlist: updatedWishlist })
      });

      updateUser(updatedUser);
      setInWishlist(!isInWishlist);
    } catch (error) {
      console.error("Failed to update wishlist:", error);
    }
  };

  if (loading) return <div>Loading product details...</div>;
  if (!product) return <div>Product not found.</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <button
        className="btn btn-outline btn-sm mb-4"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Product Image */}
        <div className="md:w-1/2">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full rounded-lg object-cover"
          />
        </div>

        {/* Product Info */}
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
            <strong>In Stock:</strong> {product.count}
          </p>

          {/* Wishlist Button */}
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

          {/* Add to Cart Button */}
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
              >
                <ShoppingCart size={18} />
                Add to Cart
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
