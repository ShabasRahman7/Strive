import { useState } from "react";
import { Search } from "lucide-react";

export default function SearchBar() {
  return (
    <div className="max-w-5xl w-full mx-auto px-4 mt-4">
      <div className="bg-base-100 rounded-xl shadow p-3">
        <input
          type="text"
          placeholder="Search products here"
          className="input input-bordered w-full focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary"
        />
      </div>
    </div>
  );
}
