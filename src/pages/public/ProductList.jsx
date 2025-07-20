import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import {
  Filter,
  SortAsc,
  IndianRupee,
  Clock,
  ArrowLeft,
  SortDesc,
} from "lucide-react";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortOption, setSortOption] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);

  useEffect(() => {
  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      const data = res.data;

      const uniqueCategories = [...new Set(data.map((item) => item.category))];
      setCategories(uniqueCategories);
      setAllProducts(data);

      const urlCategory = params.get("category");
      if (urlCategory) {
        setSelectedCategory(urlCategory);
        const filtered = data.filter(
          (p) => p.category.toLowerCase() === urlCategory.toLowerCase()
        );
        setProducts(filtered);
      } else {
        setProducts(data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  fetchProducts();
}, []);

  useEffect(() => {
    let filtered = [...allProducts];

    if (selectedCategory) {
      filtered = filtered.filter(
        (p) => p.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (minPrice) {
      filtered = filtered.filter((p) => p.price >= Number(minPrice));
    }

    if (maxPrice) {
      filtered = filtered.filter((p) => p.price <= Number(maxPrice));
    }

    switch (sortOption) {
      case "az":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "za":
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "priceLowHigh":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "priceHighLow":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        filtered.sort((a, b) => b.id - a.id);
        break;
      default:
        break;
    }

    setProducts(filtered);
  }, [selectedCategory, minPrice, maxPrice, sortOption, allProducts]);

  const resetFilters = () => {
    setSelectedCategory("");
    setMinPrice("");
    setMaxPrice("");
  };

  return (
    <div className="max-w-5xl w-full mx-auto px-4">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="btn btn-sm btn-outline my-4 flex items-center gap-2"
      >
        <ArrowLeft size={16} /> Go Back
      </button>

      {/* Header with Filter & Sort */}
      <div className="flex justify-between items-center mb-6 mt-2">
        <h2 className="text-2xl font-bold">All Products</h2>
        <div className="flex gap-2">
          {/* FILTER BUTTON */}
          <label
            htmlFor="filter_modal"
            className="btn btn-outline flex items-center gap-2 cursor-pointer"
          >
            <Filter size={16} /> Filter
          </label>

          {/* SORT DROPDOWN */}
          <div className="dropdown dropdown-end">
            <label
              tabIndex={0}
              className="btn btn-outline flex items-center gap-2 h-full"
            >
             Sort
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 z-[100]"
            >
              <li>
                <button onClick={() => setSortOption("newest")}>
                  <Clock size={16} /> Newest - Default
                </button>
              </li>
              <li>
                <button onClick={() => setSortOption("az")}>
                  <SortAsc size={16} /> A-Z
                </button>
              </li>
              <li>
                <button onClick={() => setSortOption("za")}>
                  <SortDesc size={16} /> Z-A
                </button>
              </li>
              <li>
                <button onClick={() => setSortOption("priceLowHigh")}>
                  <IndianRupee size={16} /> Price: Low to High
                </button>
              </li>
              <li>
                <button onClick={() => setSortOption("priceHighLow")}>
                  <IndianRupee size={16} /> Price: High to Low
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* PRODUCT GRID */}
      {products.length === 0 ? (
        <div className="text-center">No products found.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              onClick={() => navigate(`/products/${product.id}`)}
              className="card cursor-pointer border border-base-300 bg-base-100 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-transform duration-200 ease-in-out rounded-md"
            >
              <figure className="aspect-square overflow-hidden">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </figure>
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

      {/* FILTER MODAL using DaisyUI */}
      <input type="checkbox" id="filter_modal" className="modal-toggle" />
      <div className="modal" role="dialog">
        <div className="modal-box w-full max-w-md">
          <h3 className="text-xl font-bold mb-4">Filter Products</h3>

          {/* CATEGORY */}
          <div className="form-control mb-3">
            <label className="label">Category</label>
            <select
              className="select select-bordered"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* PRICE RANGE */}
          <div className="flex gap-4 mb-4">
            <div className="form-control flex-1">
              <label className="label">Min Price</label>
              <input
                type="number"
                className="input input-bordered"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </div>
            <div className="form-control flex-1">
              <label className="label">Max Price</label>
              <input
                type="number"
                className="input input-bordered"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-action">
            <label
              htmlFor="filter_modal"
              className="btn btn-outline btn-sm"
              onClick={resetFilters}
            >
              Reset
            </label>
            <label htmlFor="filter_modal" className="btn btn-primary btn-sm">
              Apply
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
