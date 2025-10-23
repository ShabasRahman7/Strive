import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../api/axios";
import { getImageUrl, formatPrice } from "../../utils/imageUtils";
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

// Create dynamic validation schema
const createSchema = (isEdit) => yup.object().shape({
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
  // When not editing, ensure at least one image is present
  images: isEdit
    ? yup.mixed().optional()
    : yup
        .mixed()
        .test(
          "required",
          "At least one image is required",
          (value) => {
            if (!value) return false;
            const length = value.length !== undefined ? value.length : (Array.isArray(value) ? value.length : 0);
            return length > 0;
          }
        ),
});

function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [currentProductImages, setCurrentProductImages] = useState([]);
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
    formState: { errors, isValid, isSubmitting },
  } = useForm({
    resolver: yupResolver(createSchema(isEdit)),
    defaultValues: {
      name: "",
      category: "",
      price: "",
      count: "",
      images: [],
    },
  });


  const fetchProducts = async (pg, query = "") => {
    try {
      const res = await api.get(`/api/admin/products/`, {
        params: {
          _page: pg,
          _limit: limit,
          q: query !== "" ? query : undefined,
        },
      });

      // Handle new response format with pagination metadata
      if (res.data && res.data.data && res.data.pagination) {
        setProducts(res.data.data);
        setTotalCount(res.data.pagination.total_count);
      } else {
        // Fallback for old format
        setProducts(res.data);
        const totalCount = Number(res.headers["x-total-count"]) || Number(res.headers["X-Total-Count"]) || 0;
        setTotalCount(totalCount);
      }
    } catch (error) {
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
      const newStatus = !product.isActive;

      // Optimistically update the local state first
      setProducts(prevProducts =>
        prevProducts.map(p =>
          p.id === product.id
            ? { ...p, isActive: newStatus }
            : p
        )
      );

      const response = await api.patch(`/api/admin/products/${product.id}/`, { isActive: newStatus });

      toast.success(
        `${product.name} has been ${newStatus ? "activated" : "deactivated"}`
      );

      // Refresh the data to ensure consistency
      fetchProducts(page, searchQuery);
    } catch (error) {
      // Revert the optimistic update on error
      setProducts(prevProducts =>
        prevProducts.map(p =>
          p.id === product.id
            ? { ...p, isActive: product.isActive }
            : p
        )
      );
      toast.error("Failed to update product status");
    }
  };


  const handleEdit = (product) => {
    setIsEdit(true);
    setShowForm(true);
    
    // Store current product images
    setCurrentProductImages(product.images || []);
    
    // Show current product images as previews
    const currentImagePreviews = product.images?.map(img => getImageUrl(img)) || [];
    setImagePreviews(currentImagePreviews);
    setSelectedImages([]); // No new files selected yet
    
    reset({
      ...product,
      images: [], // Keep empty for new uploads
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
        await api.delete(`/api/admin/products/${product.id}/`);
        toast.success(`${product.name} has been deleted`);
        fetchProducts(page, searchQuery);
      } catch {
        toast.error("Failed to delete product");
      }
    }
  };


  const handleImageChange = (event) => {
    const files = Array.from(event.target.files);
    setSelectedImages(files);
    
    // Create previews for new files
    const newPreviews = files.map(file => URL.createObjectURL(file));
    
    // Combine current images with new images for preview
    const currentPreviews = currentProductImages?.map(img => getImageUrl(img)) || [];
    setImagePreviews([...currentPreviews, ...newPreviews]);
    
    // Update form with files so RHF sees them
    setValue("images", files, { shouldValidate: true });
  };

  const handleAdd = () => {
    setIsEdit(false);
    setShowForm(true);
    setSelectedImages([]);
    setImagePreviews([]);
    setCurrentProductImages([]);
    reset({
      name: "",
      category: "",
      price: "",
      count: "",
      images: [],
    });
  };

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      
      // Add basic fields
      formData.append('name', data.name);
      formData.append('description', data.description || '');
      formData.append('price', parseFloat(data.price));
      formData.append('count', parseInt(data.count));
      // Ensure category is sent as the category name string (keep original case)
      formData.append('category', String(data.category).trim());
      formData.append('isActive', data.isActive !== undefined ? data.isActive : true);
      
      // Add images (only if new images are selected)
      const imagesValue = data.images;
      const imagesArray = imagesValue instanceof FileList ? Array.from(imagesValue) : Array.isArray(imagesValue) ? imagesValue : [];
      if (imagesArray && imagesArray.length > 0) {
        imagesArray.forEach((image) => {
          if (image instanceof File) {
            formData.append('images', image);
          }
        });
      }
      // If no new images and editing, keep existing images (backend will handle this)

      if (isEdit && data.id) {
        await api.put(`/api/admin/products/${data.id}/`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        toast.success("Product updated successfully");
      } else {
        formData.append('created_at', new Date().toISOString());
        await api.post(`/api/admin/products/`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        toast.success("Product added successfully");
      }

      setShowForm(false);
      setSelectedImages([]);
      setImagePreviews([]);
      setCurrentProductImages([]);
      fetchProducts(page, searchQuery);
    } catch (error) {
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
                        src={getImageUrl(product.images?.[0] ?? '')}
                        alt={product.name || 'Product'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          if (e.target.src !== '/placeholder.svg') {
                            e.target.src = '/placeholder.svg';
                          }
                        }}
                      />

                    </div>
                  </div>
                </td>
                <td className="font-semibold">{product.name || 'N/A'}</td>
                <td className="capitalize">{product.category || 'N/A'}</td>
                <td>₹{parseFloat(product.price).toFixed(2)}</td>
                <td>{product.count || 0}</td>
                <td>
                  <span
                    className={`badge ${product.isActive ? "badge-success" : "badge-error"
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
                    className={`btn btn-xs ${product.isActive ? "btn-error" : "btn-success"
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
          disabled={page <= 1 || totalPages === 0}
        >
          Prev
        </button>
        <span className="text-sm font-semibold px-3 py-1">
          {`Page ${page} of ${totalPages || 1}`}
        </span>
        <button
          className="btn btn-sm"
          onClick={() => goToPage(page + 1)}
          disabled={page >= totalPages || totalPages === 0}
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
                className={`input input-bordered w-full ${errors.name ? "input-error" : ""
                  }`}
                {...register("name")}
              />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name.message}</p>
              )}

              <select
                className={`select select-bordered w-full ${errors.category ? "select-error" : ""
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
                className={`input input-bordered w-full ${errors.price ? "input-error" : ""
                  }`}
                {...register("price")}
              />
              {errors.price && (
                <p className="text-red-500 text-sm">{errors.price.message}</p>
              )}

              <input
                type="number"
                placeholder="Stock Count"
                className={`input input-bordered w-full ${errors.count ? "input-error" : ""
                  }`}
                {...register("count")}
              />
              {errors.count && (
                <p className="text-red-500 text-sm">{errors.count.message}</p>
              )}

              <div>
                <label className="label">
                  <span className="label-text font-semibold">
                    Product Images
                  </span>
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className={`file-input file-input-bordered w-full ${errors.images?.[0] ? "file-input-error" : ""
                    }`}
                  onChange={handleImageChange}
                />
                {errors.images?.[0] && (
                  <p className="text-red-500 text-sm">
                    {errors.images[0].message}
                  </p>
                )}

                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="mt-3">
                    <span className="text-sm text-gray-500">Preview:</span>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {imagePreviews.map((preview, index) => {
                        const isCurrentImage = isEdit && index < currentProductImages.length;
                        const isNewImage = isEdit && index >= currentProductImages.length && selectedImages.length > 0;
                        return (
                          <div key={index} className="relative">
                            <div className="w-24 h-24 border rounded overflow-hidden">
                              <img
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                className="object-cover w-full h-full"
                                onError={(e) => {
                                  if (e.target.src !== '/placeholder.svg') {
                                    e.target.src = '/placeholder.svg';
                                  }
                                }}
                              />
                            </div>
                            {isCurrentImage && (
                              <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs px-1 rounded">
                                Current
                              </div>
                            )}
                            {isNewImage && (
                              <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-1 rounded">
                                New
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : (isEdit ? "Update" : "Add")}
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
