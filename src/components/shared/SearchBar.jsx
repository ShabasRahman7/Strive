import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search as SearchIcon } from "lucide-react";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    if (query.trim()) {
      navigate(`/products?name_like=${query}`, { replace: true });
    }
  };

  return (
    <div className="max-w-5xl w-full mx-auto px-4 mt-4">
      <div className="bg-base-100 rounded-xl shadow p-3 flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products here"
          className="input input-bordered w-full focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary"
        />

        <button
          onClick={handleSearch}
          className="btn btn-primary ml-1 flex items-center"
        >
          <SearchIcon size={16} />
        </button>
      </div>
    </div>
  );
}
