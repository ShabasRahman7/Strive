import React, { useEffect, useState } from "react";
import api from "../../api/axios"; // your axios instance
import { useNavigate } from "react-router-dom";

const TopSellingProducts = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const FetchTop = async () => {
      try {
        // Fetch top 8 products based on `count` (descending)
        const res = await api.get("/products?_sort=count&_order=desc&_limit=8");
        setProducts(res.data);
      } catch (error) {
        console.error("Failed to fetch top-selling products:", error);
      }
    };

    FetchTop();
  }, []);

  return (
    <section className="max-w-5xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Top Selling Products</h2>

      {products.length === 0 ? (
        <p className="text-center text-gray-500">Loading products...</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              onClick={() => navigate(`/products/${product.id}`)}
              className="card cursor-pointer border border-base-300 bg-base-100 shadow-sm hover:shadow-lg hover:scale-[1.03] transition-transform duration-200 ease-in-out rounded-md"
            >
              <figure className="aspect-square overflow-hidden rounded-t-md">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </figure>
              <div className="card-body p-4">
                <h3 className="card-title text-sm sm:text-base">{product.name}</h3>
                <p className="text-primary font-semibold mt-1">
                  ₹{product.price.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default TopSellingProducts;
