import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "../../utils/imageUtils";
import api from "../../api/axios";

const FeaturedCategories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/api/categories/");
        if (response.data && response.data.results) {
          setCategories(response.data.results);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        // Fallback to hardcoded categories if API fails
        setCategories([
          {
            name: "Cricket",
            image: "http://localhost:8000/media/categories/cricket.jpeg",
            slug: "cricket",
          },
          {
            name: "Football", 
            image: "http://localhost:8000/media/categories/football.jpeg",
            slug: "football",
          },
          {
            name: "Hockey",
            image: "http://localhost:8000/media/categories/hockey.jpeg", 
            slug: "hockey",
          },
          {
            name: "Volleyball",
            image: "http://localhost:8000/media/categories/volley.jpeg",
            slug: "volleyball",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <section className="max-w-5xl mx-auto px-4 py-10 sm:py-12">
        <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-300 aspect-square rounded-xl"></div>
              <div className="h-4 bg-gray-300 rounded mt-3"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-5xl mx-auto px-4 py-10 sm:py-12">
      <h2 className="text-2xl font-bold mb-6">
        Shop by Category
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {categories.map((category) => (
          <div
            key={category.name}
            className="cursor-pointer overflow-hidden rounded-xl border border-base-300 shadow-sm hover:shadow-md transition-all"
            onClick={() => navigate(`/products?category=${category.name}`)}
          >
            <img
              src={getImageUrl(category.image)}
              alt={category.name}
              className="w-full h-auto object-cover aspect-square"
            />
            <div className="text-center py-3 sm:py-4">
              <h3 className="text-sm sm:text-base font-medium">
                {category.name}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedCategories;
