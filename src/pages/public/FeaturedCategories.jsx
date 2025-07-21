import React from "react";
import { useNavigate } from "react-router-dom";

const categories = [
  {
    name: "Cricket",
    image: "/categories/cricket.jpeg",
    link: "/products?category=cricket",
  },
  {
    name: "Football",
    image: "/categories/football.jpeg",
    link: "/products?category=football",
  },
  {
    name: "Hockey",
    image: "/categories/hockey.jpeg",
    link: "/products?category=hockey",
  },
  {
    name: "Volley",
    image: "/categories/volley.jpeg",
    link: "/products?category=volleyball",
  },
];

const FeaturedCategories = () => {
  const navigate = useNavigate();

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
            onClick={() => navigate(category.link)}
          >
            <img
              src={category.image}
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
