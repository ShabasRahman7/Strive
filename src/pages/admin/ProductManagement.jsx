import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../api/axios";
import {
  PackageCheck,
  ToggleLeft,
  ToggleRight,
  Pencil,
  PlusCircle,
  Trash2,
} from "lucide-react";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Swal from 'sweetalert2';
import * as yup from "yup";

// Validation schema
const schema = yup.object().shape({
  name: yup.string().required("Product name is required"),
  category: yup
    .string()
    .oneOf(
      ["football", "cricket", "hockey", "volleyball"],
      "Select a valid category"
    )
    .required("Category is required"),
  price: yup
    .number()
    .typeError("Price must be a number")
    .positive("Price must be positive")
    .required("Price is required"),
  count: yup
    .number()
    .typeError("Stock count must be a number")
    .integer("Stock count must be an integer")
    .min(0, "Stock cannot be negative")
    .required("Stock count is required"),
  images: yup
    .array()
    .of(yup.string().required("Image URL is required"))
    .min(1, "At least one image is required"),
});

function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const limit = 5;

  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = searchParams.get("page");
  const page = Number.isInteger(+pageParam) && +pageParam > 0 ? +pageParam : 1;
  const totalPages = Math.ceil(totalCount / limit);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      category: "",
      price: "",
      count: "",
      images: [""],
    },
  });

  const fetchProducts = async (pg, query = "") => {
    try {
      const res = await api.get(`/products`, {
        params: {
          _page: pg,
          _limit: limit,
          q: query !== "" ? query : undefined,
        },
      });
      setProducts(res.data);
      setTotalCount(Number(res.headers["x-total-count"]) || 0);
    } catch {
      toast.error("Failed to fetch products");
    }
  };

  useEffect(() => {
    const isSearching = searchQuery.trim() !== "";
    const delay = setTimeout(
      () => {
        if (page !== 1 && isSearching) {
          setSearchParams({ page: 1 });
          fetchProducts(1, searchQuery);
        } else {
          fetchProducts(page, searchQuery);
        }
      },
      isSearching ? 300 : 0
    ); // debounce only if searching

    return () => clearTimeout(delay);
  }, [page, searchQuery]);

  const goToPage = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setSearchParams({ page: newPage });
  };

  const toggleProductStatus = async (product) => {
    try {
      const updatedProduct = { ...product, isActive: !product.isActive };
      await api.patch(`/products/${product.id}`, updatedProduct);
      toast.success(
        `${updatedProduct.name} has been ${
          updatedProduct.isActive ? "activated" : "soft deleted"
        }`
      );
      fetchProducts(page, searchQuery);
    } catch {
      toast.error("Failed to update product status");
    }
  };


  const handleEdit = (product) => {
    setIsEdit(true);
    setShowForm(true);
    reset({
      ...product,
      images: product.images?.length ? product.images : [""],
    });
    setValue("id", product.id);
  };

  const handleDelete = async (product) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete the product: ${product.name}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/products/${product.id}`);
        toast.success(`${product.name} has been deleted`);
        fetchProducts(page, searchQuery);
      } catch {
        toast.error("Failed to delete product");
      }
    }
  };


  const handleAdd = () => {
    setIsEdit(false);
    setShowForm(true);
    reset({
      name: "",
      category: "",
      price: "",
      count: "",
      images: [""],
    });
  };

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        price: parseFloat(data.price),
        count: parseInt(data.count),
        isActive: true,
      };

      if (isEdit && data.id) {
        await api.put(`/products/${data.id}`, payload);
        toast.success("Product updated successfully");
      } else {
        payload.created_at = new Date().toISOString();
        await api.post(`/products`, payload);
        toast.success("Product added successfully");
      }

      setShowForm(false);
      fetchProducts(page, searchQuery);
    } catch {
      toast.error("Failed to save product");
    }
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary flex items-center gap-2 w-full md:w-auto">
          <PackageCheck className="w-6 h-6" />
          Product Management
        </h1>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search products..."
            className="input input-bordered input-sm w-full sm:w-64"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            className="btn btn-primary btn-sm w-full sm:w-auto"
            onClick={handleAdd}
          >
            <PlusCircle size={16} className="mr-1" />
            Add Product
          </button>
        </div>
      </div>

      <div className="overflow-x-auto shadow-md rounded-md">
        <table className="table table-zebra w-full min-w-[900px]">
          <thead className="bg-base-200 sticky top-0 z-10">
            <tr>
              <th>#</th>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price (₹)</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Created At</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, idx) => (
              <tr key={product.id}>
                <td>{(page - 1) * limit + idx + 1}</td>
                <td>
                  <div className="avatar">
                    <div className="w-12 h-12 rounded ring ring-primary ring-offset-base-100 ring-offset-2">
                      <img
                        src={product.images?.[0] || "/placeholder.png"}
                        alt={product.name}
                      />
                    </div>
                  </div>
                </td>
                <td className="font-semibold">{product.name}</td>
                <td className="capitalize">{product.category}</td>
                <td>₹{product.price.toFixed(2)}</td>
                <td>{product.count}</td>
                <td>
                  <span
                    className={`badge ${
                      product.isActive ? "badge-success" : "badge-error"
                    }`}
                  >
                    {product.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="text-sm">
                  {new Date(product.created_at).toLocaleDateString()}
                </td>
                <td className="flex gap-1">
                  <button
                    className="btn btn-xs btn-warning"
                    onClick={() => handleEdit(product)}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    className={`btn btn-xs ${
                      product.isActive ? "btn-error" : "btn-success"
                    }`}
                    onClick={() => toggleProductStatus(product)}
                  >
                    {product.isActive ? (
                      <ToggleLeft size={14} />
                    ) : (
                      <ToggleRight size={14} />
                    )}
                  </button>
                  <button
                    className="btn btn-xs btn-info"
                    onClick={() => handleDelete(product)}
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td
                  colSpan="9"
                  className="text-center text-gray-400 italic py-4"
                >
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-center gap-2">
        <button
          className="btn btn-sm"
          onClick={() => goToPage(page - 1)}
          disabled={page === 1}
        >
          Prev
        </button>
        <span className="text-sm font-semibold px-3 py-1">
          {`Page ${page} of ${totalPages}`}
        </span>
        <button
          className="btn btn-sm"
          onClick={() => goToPage(page + 1)}
          disabled={page >= totalPages}
        >
          Next
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
          <div className="bg-base-100 text-base-content p-6 rounded-md shadow-xl w-[90%] max-w-md">
            <h2 className="text-lg font-semibold mb-4">
              {isEdit ? "Edit Product" : "Add Product"}
            </h2>
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <input
                type="text"
                placeholder="Product Name"
                className={`input input-bordered w-full ${
                  errors.name ? "input-error" : ""
                }`}
                {...register("name")}
              />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name.message}</p>
              )}

              <select
                className={`select select-bordered w-full ${
                  errors.category ? "select-error" : ""
                }`}
                {...register("category")}
              >
                <option value="">Select Category</option>
                <option value="football">Football</option>
                <option value="cricket">Cricket</option>
                <option value="hockey">Hockey</option>
                <option value="volleyball">Volleyball</option>
              </select>
              {errors.category && (
                <p className="text-red-500 text-sm">
                  {errors.category.message}
                </p>
              )}

              <input
                type="number"
                placeholder="Price"
                className={`input input-bordered w-full ${
                  errors.price ? "input-error" : ""
                }`}
                {...register("price")}
              />
              {errors.price && (
                <p className="text-red-500 text-sm">{errors.price.message}</p>
              )}

              <input
                type="number"
                placeholder="Stock Count"
                className={`input input-bordered w-full ${
                  errors.count ? "input-error" : ""
                }`}
                {...register("count")}
              />
              {errors.count && (
                <p className="text-red-500 text-sm">{errors.count.message}</p>
              )}

              <div>
                <label className="label">
                  <span className="label-text font-semibold">
                    Product Image URL
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="Image URL"
                  className={`input input-bordered w-full ${
                    errors.images?.[0] ? "input-error" : ""
                  }`}
                  {...register("images.0")}
                />
                {errors.images?.[0] && (
                  <p className="text-red-500 text-sm">
                    {errors.images[0].message}
                  </p>
                )}

                <div className="mt-3">
                  <span className="text-sm text-gray-500">Preview:</span>
                  <div className="mt-1 w-24 h-24 border rounded overflow-hidden">
                    <img
                      src={watch("images.0") || "/placeholder.png"}
                      alt="Preview"
                      className="object-cover w-full h-full"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {isEdit ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductManagement;
