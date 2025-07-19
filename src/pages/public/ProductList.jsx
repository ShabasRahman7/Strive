import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const categoryFilter = params.get("category");

  useEffect(() => {
    fetch("http://localhost:3001/products")
      .then((res) => res.json())
      .then((data) => {
        if (categoryFilter) {
          const filtered = data.filter(
            (product) =>
              product.category.toLowerCase() === categoryFilter.toLowerCase()
          );
          setProducts(filtered);
        } else {
          setProducts(data);
        }
      })
      .catch((error) => console.error("Error fetching products:", error));
  }, [categoryFilter]);

  return (
    <div className="max-w-5xl w-full mx-auto px-4">
      {/* Go Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="btn btn-sm btn-outline my-4"
      >
        ← Go Back
      </button>

      {/* Header */}
      <div className="flex justify-between items-center mb-6 mt-2">
        <h2 className="text-2xl font-bold">All Products</h2>
        <div className="flex gap-2">
          <button className="btn btn-outline">Filter</button>
          <button className="btn btn-outline">Sort</button>
        </div>
      </div>

      {/* Product Grid */}
      {products.length === 0 ? (
        <div className="text-center">No products available.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              onClick={() => navigate(`/products/${product.id}`)}
              className="card cursor-pointer border border-base-300 bg-base-100 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-transform duration-200 ease-in-out rounded-md"
            >
              {/* Image */}
              <figure className="aspect-square overflow-hidden">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </figure>

              {/* Body */}
              <div className="card-body">
                <h2 className="card-title">{product.name}</h2>
                <p className="text-lg font-semibold text-primary">
                  ₹{product.price.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;
