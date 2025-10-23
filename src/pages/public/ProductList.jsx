import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { getImageProps, formatPrice } from "../../utils/imageUtils";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [priceError, setPriceError] = useState("");
  const [sortOption, setSortOption] = useState("");

  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const params = new URLSearchParams(location.search);
        const urlCategory = params.get("category") || "";
        const searchQuery = params.get("name_like") || "";
        const minPriceParam = params.get("minPrice") || "";
        const maxPriceParam = params.get("maxPrice") || "";
        const sortParam = params.get("sort") || "";

        // Build query parameters for server-side filtering
        const queryParams = new URLSearchParams();
        if (urlCategory) queryParams.set('category', urlCategory);
        if (searchQuery) queryParams.set('name_like', searchQuery);
        if (minPriceParam) queryParams.set('minPrice', minPriceParam);
        if (maxPriceParam) queryParams.set('maxPrice', maxPriceParam);
        if (sortParam) {
          // Map frontend sort options to backend ordering
          switch (sortParam) {
            case "az":
              queryParams.set('ordering', 'name');
              break;
            case "za":
              queryParams.set('ordering', '-name');
              break;
            case "priceLowHigh":
              queryParams.set('ordering', 'price');
              break;
            case "priceHighLow":
              queryParams.set('ordering', '-price');
              break;
            case "newest":
              queryParams.set('ordering', '-created_at');
              break;
            default:
              queryParams.set('ordering', '-created_at');
              break;
          }
        }

        const res = await api.get(`/api/products/?${queryParams.toString()}`);
        const responseData = res.data;
        
        // Handle both paginated and non-paginated responses
        const data = responseData.results || responseData;
        
        if (!Array.isArray(data)) {
          throw new Error("Invalid response format");
        }

        // Get unique categories for filter dropdown
        const allProductsRes = await api.get("/api/products/");
        const allProductsData = allProductsRes.data.results || allProductsRes.data;
        const uniqueCategories = [
          ...new Set(allProductsData.map((item) => item.category)),
        ];
        
        setCategories(uniqueCategories);
        setAllProducts(data);
        setSelectedCategory(urlCategory);
        setMinPrice(minPriceParam);
        setMaxPrice(maxPriceParam);
        setSortOption(sortParam);
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Failed to load products. Please try again.");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [location.search]);

  const updateURLParams = (key, value) => {
    const params = new URLSearchParams(location.search);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    navigate(`/products?${params.toString()}`, { replace: true });
  };

  const onCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const onMinPriceChange = (price) => {
    setMinPrice(price);
  };

  const onMaxPriceChange = (price) => {
    setMaxPrice(price);
  };

  const onSortChange = (sortKey) => {
    updateURLParams("sort", sortKey);
  };

  const resetFilters = () => {
    const params = new URLSearchParams(location.search);
    params.delete("category");
    params.delete("minPrice");
    params.delete("maxPrice");
    params.delete("sort");
    params.delete("name_like");

    setMinPrice("");
    setMaxPrice("");
    setSelectedCategory("");
    setPriceError("");

    navigate(`/products?${params.toString()}`, { replace: true });
  };

  const applyFilters = () => {
    if (minPrice && maxPrice && Number(minPrice) > Number(maxPrice)) {
      setPriceError("Min price cannot be greater than max price.");
      return;
    }

    setPriceError("");

    const params = new URLSearchParams(location.search);

    if (selectedCategory) {
      params.set("category", selectedCategory);
    } else {
      params.delete("category");
    }

    if (minPrice) {
      params.set("minPrice", minPrice);
    } else {
      params.delete("minPrice");
    }

    if (maxPrice) {
      params.set("maxPrice", maxPrice);
    } else {
      params.delete("maxPrice");
    }

    navigate(`/products?${params.toString()}`, { replace: true });

    document.getElementById("filter_modal").checked = false;
  };

  return (
    <div className="max-w-5xl w-full mx-auto px-4">
      <button
        onClick={() => navigate("/")}
        className="btn btn-sm btn-outline my-4 flex items-center gap-2"
      >
        <ArrowLeft size={16} /> Go Back
      </button>

      <div className="mb-6 mt-2">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">All Products</h2>
          <div className="flex gap-2">
            <label
              htmlFor="filter_modal"
              className="btn btn-outline flex items-center gap-2 cursor-pointer"
            >
              <Filter size={16} /> Filter
            </label>
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
                  <button onClick={() => onSortChange("newest")}>
                    <Clock size={16} /> Newest - Default
                  </button>
                </li>
                <li>
                  <button onClick={() => onSortChange("az")}>
                    <SortAsc size={16} /> A-Z
                  </button>
                </li>
                <li>
                  <button onClick={() => onSortChange("za")}>
                    <SortDesc size={16} /> Z-A
                  </button>
                </li>
                <li>
                  <button onClick={() => onSortChange("priceLowHigh")}>
                    <IndianRupee size={16} /> Price: Low to High
                  </button>
                </li>
                <li>
                  <button onClick={() => onSortChange("priceHighLow")}>
                    <IndianRupee size={16} /> Price: High to Low
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="text-error text-lg font-semibold mb-4">{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="btn btn-primary"
          >
            Retry
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-lg font-semibold mb-2">No products found.</div>
          <div className="text-gray-600">Try adjusting your filters or search criteria.</div>
        </div>
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
                  {...getImageProps(product.images?.[0], product.name)}
                  className="w-full h-full object-cover"
                />
              </figure>
              <div className="card-body">
                <h2 className="card-title">{product.name}</h2>
                <p className="text-lg font-semibold text-primary">
                  ₹{formatPrice(product.price)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <input type="checkbox" id="filter_modal" className="modal-toggle" />
      <div className="modal" role="dialog">
        <div className="modal-box w-full max-w-md">
          <h3 className="text-xl font-bold mb-4">Filter Products</h3>

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

          <div className="flex gap-4 mb-2">
            <div className="form-control flex-1">
              <label className="label">Min Price</label>
              <input
                type="number"
                className="input input-bordered"
                value={minPrice}
                onChange={(e) => onMinPriceChange(e.target.value)}
                min="0"
              />
            </div>
            <div className="form-control flex-1">
              <label className="label">Max Price</label>
              <input
                type="number"
                className="input input-bordered"
                value={maxPrice}
                onChange={(e) => onMaxPriceChange(e.target.value)}
                min="0"
              />
            </div>
          </div>
          {priceError && (
            <p className="text-error text-sm mt-1 ml-1">{priceError}</p>
          )}

          <div className="modal-action">
            <label
              htmlFor="filter_modal"
              className="btn btn-outline btn-sm"
              onClick={resetFilters}
            >
              Reset
            </label>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={applyFilters}
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
