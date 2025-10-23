import React, { useEffect, useState } from "react";
import api from "../../api/axios"; // your axios instance
import { useNavigate } from "react-router-dom";
import { getImageProps, formatPrice } from "../../utils/imageUtils";

const TopSellingProducts = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const FetchTop = async () => {
      try {
        // Fetch top 8 products based on `count` (descending)
        const res = await api.get("/api/products/top_selling/");
        const data = res.data;
        const items = Array.isArray(data) ? data : (Array.isArray(data?.results) ? data.results : []);
        if (items.length) {
          setProducts(items);
        } else {
          console.warn("Invalid or empty data from top_selling endpoint");
          setProducts([]);
        }
      } catch (error) {
        console.error("Failed to fetch top-selling products:", error);
        setProducts([]);
      }
    };

    FetchTop();
  }, []);

  return (
    <section className="max-w-5xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Top Selling Products</h2>

      {products.length === 0 ? (
        <div className="flex justify-center items-center py-12">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
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
                  {...getImageProps(product.images?.[0], product.name)}
                  className="w-full h-full object-cover"
                />
              </figure>
              <div className="card-body p-4">
                <h3 className="card-title text-sm sm:text-base">{product.name || 'Unnamed Product'}</h3>
                <p className="text-primary font-semibold mt-1">
                  ₹{formatPrice(product.price)}
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
