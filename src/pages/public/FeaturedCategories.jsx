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
    link: "products?category=football",
  },
  {
    name: "Hockey",
    image: "/categories/hockey.jpeg",
    link: "products?category=hockey",
  },
  {
    name: "Volley",
    image: "/categories/volley.jpeg",
    link: "products?category=volleyball",
  },
];

const FeaturedCategories = () => {
  const navigate = useNavigate();

  return (
    <section className="max-w-5xl mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold text-center mb-10">
        Shop by Category
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {categories.map((category) => (
          <div
            key={category.name}
            className="card bg-base-100 border border-base-300 shadow-md hover:shadow-xl transition cursor-pointer rounded-xl"
            onClick={() => navigate(category.link)}
          >
            <figure className="bg-base-200 h-48 flex items-center justify-center p-4 rounded-t-xl">
              <img
                src={category.image}
                alt={category.name}
                className="h-32 w-32 object-contain"
              />
            </figure>
            <div className="card-body items-center text-center py-4">
              <h3 className="text-lg font-medium">{category.name}</h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedCategories;
