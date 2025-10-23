import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search as SearchIcon } from "lucide-react";
import api from "../../api/axios";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const navigate = useNavigate();
  const suggestionsRef = useRef(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/api/products/");
        // Handle both paginated and non-paginated 
        const data = res.data.results || res.data;
        
        if (Array.isArray(data)) {
          setAllProducts(data);
        } else {
          console.warn("Invalid data format received from products endpoint");
          setAllProducts([]);
        }
      } catch (err) {
        console.error("Failed to fetch products for suggestions", err);
        setAllProducts([]);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (query.trim() === "") {
      setSuggestions([]);
      return;
    }
    const matched = allProducts
      .filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 3);
    console.log('Search suggestions:', matched);
    setSuggestions(matched);
  }, [query, allProducts]);

  const handleSearch = () => {
    if (query.trim()) {
      navigate(`/products?name_like=${encodeURIComponent(query)}`, {
        replace: true,
      });
      setSuggestions([]);
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setSuggestions([]);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="max-w-5xl w-full mx-auto px-4 mt-4" ref={suggestionsRef}>
      <div className="bg-base-100 rounded-xl shadow p-3 flex items-center relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products here"
          className="input input-bordered w-full focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary"
          autoComplete="off"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSearch();
            }
          }}
        />

        <button
          onClick={handleSearch}
          className="btn btn-primary ml-1 flex items-center"
          aria-label="Search"
        >
          <SearchIcon size={16} />
        </button>

        {suggestions.length > 0 && (
          <ul className="absolute top-full left-0 right-0 bg-base-100 border border-base-300 rounded-b-md shadow-lg z-50 max-h-60 overflow-auto mt-1">
            {suggestions.map((product) => (
              <li
                key={product.id}
                onClick={() => {
                  navigate(`/products/${product.id}`);
                  setSuggestions([]);
                  setQuery(product.name);
                }}
                className="cursor-pointer px-4 py-2 hover:bg-primary hover:text-white transition-colors"
              >
                {product.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
