import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../api/axios";
import { ShieldAlert, PackageSearch, Eye, X } from "lucide-react";
import { toast } from "react-toastify";

function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  
  const limit = 10; // Orders per page
  
  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = searchParams.get("page");
  const page = Number.isInteger(+pageParam) && +pageParam > 0 ? +pageParam : 1;
  const totalPages = Math.ceil(totalCount / limit);
  
  const goToPage = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setSearchParams({ page: newPage });
  };

  const fetchOrders = async (pg = page, status = filterStatus) => {
    try {
      setLoading(true);
      const params = {
        page: pg,
        page_size: limit,
      };
      
      if (status !== "all") {
        params.status = status;
      }
      
      const res = await api.get("/api/admin/orders/", { params });
      
      // Handle paginated response
      if (res.data && res.data.results) {
        setOrders(res.data.results);
        setTotalCount(res.data.count);
      } else {
        // Fallback for non-paginated response
        setOrders(Array.isArray(res.data) ? res.data : []);
        setTotalCount(res.data.length || 0);
      }
    } catch (err) {
      console.error("Failed to fetch orders", err);
      toast.error("Failed to fetch orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.patch(`/api/admin/orders/${orderId}/update/`, {
        status: newStatus
      });

      toast.success(`Order status updated to "${newStatus}"`);
      
      // Update local state instead of refetching to prevent rerender
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus }
            : order
        )
      );
      
      // Update the modal data if it's open for the same order
      if (selectedOrder && selectedOrder.id === orderId) {
        setOrderDetails(prev => prev ? {...prev, status: newStatus} : null);
      }
    } catch (err) {
      toast.error("Failed to update order status");
      console.error(err);
    }
  };

  const handleViewDetails = async (order) => {
    try {
      setLoadingDetails(true);
      setSelectedOrder(order);
      setShowModal(true);
      
      // Fetch detailed order information
      const res = await api.get(`/api/admin/orders/${order.id}/`);
      setOrderDetails(res.data);
    } catch (err) {
      console.error("Failed to fetch order details", err);
      toast.error("Failed to fetch order details");
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
    setOrderDetails(null);
  };

  useEffect(() => {
    fetchOrders(page, filterStatus);
  }, [page, filterStatus]);

  if (loading) {
    return (
      <div className="p-4 max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-primary flex items-center gap-2">
          <PackageSearch className="w-6 h-6" />
          Order Management
        </h1>
        <div className="flex justify-center items-center py-12">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* Heading */}
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-primary flex items-center gap-2">
        <PackageSearch className="w-6 h-6" />
        Order Management
      </h1>

      {/* Table Container */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-lg font-semibold text-primary">
          {filterStatus === "all" && "All Orders"}
          {filterStatus === "pending" && "Pending Orders"}
          {filterStatus === "confirmed" && "Confirmed Orders"}
          {filterStatus === "shipped" && "Shipped Orders"}
          {filterStatus === "delivered" && "Delivered Orders"}
          {filterStatus === "cancelled" && "Cancelled Orders"}
        </h2>

        <select
          className="select select-bordered w-full sm:w-auto"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Orders</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="w-full overflow-x-auto rounded-md shadow-md">
        <table className="table table-zebra w-full min-w-[1000px]">
          <thead className="bg-base-200 sticky top-0 z-10">
            <tr>
              <th>#</th>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Items</th>
              <th>Payment</th>
              <th>Address</th>
              <th>Status</th>
              <th>Date</th>
              <th>View Details</th>
            </tr>
          </thead>

          <tbody>
            {Array.isArray(orders) && orders.map((order, idx) => (
              <tr key={order.id}>
                <td>{idx + 1}</td>
                <td className="text-xs text-gray-500">{order.order_number}</td>
                <td>
                  <div className="text-sm font-medium">
                    {order.user.name}
                    <span className="block text-xs text-gray-400">
                      ({order.user.id})
                    </span>
                  </div>
                </td>
                <td>₹{parseFloat(order.total_amount).toFixed(2)}</td>
                <td className="text-sm">
                  {order.items_count} item{order.items_count !== 1 ? 's' : ''}
                </td>
                <td>
                  <div className="text-xs">
                    <div className="uppercase font-medium">{order.payment_method}</div>
                    {order.payment_id && (
                      <div className="text-gray-500 text-[10px] truncate max-w-[120px]">
                        ID: {order.payment_id}
                      </div>
                    )}
                  </div>
                </td>
                <td className="text-xs">
                  <div>
                    {order.shipping_address ? 
                      `${order.shipping_address.line1}, ${order.shipping_address.city}, ${order.shipping_address.state} - ${order.shipping_address.pin_code}` :
                      'No address'
                    }
                  </div>
                  {order.shipping_address && (
                    <div className="italic text-gray-500 text-[10px]">
                      ({order.shipping_address.address_type})
                    </div>
                  )}
                </td>
                <td>
                  <span
                    className={`badge ${
                      order.status === "pending"
                        ? "badge-warning"
                        : order.status === "shipped"
                        ? "badge-info"
                        : order.status === "delivered"
                        ? "badge-success"
                        : "badge-neutral"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="text-xs text-gray-500">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-outline btn-primary"
                    onClick={() => handleViewDetails(order)}
                    title="View Order Details"
                  >
                    <Eye className="w-4 h-4" />
                    <span className="ml-1">View Details</span>
                  </button>
                </td>
              </tr>
            ))}

            {Array.isArray(orders) && orders.length === 0 && (
              <tr>
                <td
                  colSpan="10"
                  className="text-center text-gray-400 italic py-4"
                >
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
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

      {/* Order Details Modal */}
      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Order Details</h3>
              <button
                className="btn btn-sm btn-circle btn-ghost"
                onClick={closeModal}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {loadingDetails ? (
              <div className="flex justify-center items-center py-8">
                <div className="loading loading-spinner loading-lg"></div>
              </div>
            ) : orderDetails ? (
              <div className="space-y-6">
                {/* Order Header */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-base-200 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-primary">Order Information</h4>
                    <p><span className="font-medium">Order ID:</span> {orderDetails.order_number}</p>
                    <p><span className="font-medium">Status:</span> 
                      <span className={`badge ml-2 ${
                        orderDetails.status === "pending" ? "badge-warning" :
                        orderDetails.status === "confirmed" ? "badge-info" :
                        orderDetails.status === "shipped" ? "badge-info" :
                        orderDetails.status === "delivered" ? "badge-success" :
                        "badge-error"
                      }`}>
                        {orderDetails.status}
                      </span>
                    </p>
                    <p><span className="font-medium">Total Amount:</span> ₹{parseFloat(orderDetails.total_amount).toFixed(2)}</p>
                    <p><span className="font-medium">Payment Method:</span> {orderDetails.payment_method}</p>
                    <p><span className="font-medium">Order Date:</span> {new Date(orderDetails.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary">Customer Information</h4>
                    <p><span className="font-medium">Name:</span> {orderDetails.user.name}</p>
                    <p><span className="font-medium">Email:</span> {orderDetails.user.email}</p>
                    <p><span className="font-medium">Username:</span> {orderDetails.user.username}</p>
                  </div>
                </div>

                {/* Payment Information */}
                {orderDetails.payment && (
                  <div className="p-4 bg-base-200 rounded-lg">
                    <h4 className="font-semibold text-primary mb-2">Payment Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <p><span className="font-medium">Provider:</span> {orderDetails.payment.provider}</p>
                      <p><span className="font-medium">Status:</span> {orderDetails.payment.status}</p>
                      <p><span className="font-medium">Method:</span> {orderDetails.payment.method}</p>
                      <p><span className="font-medium">Amount:</span> ₹{parseFloat(orderDetails.payment.amount).toFixed(2)}</p>
                      {orderDetails.payment.razorpay_payment_id && (
                        <p><span className="font-medium">Payment ID:</span> {orderDetails.payment.razorpay_payment_id}</p>
                      )}
                      {orderDetails.payment.razorpay_order_id && (
                        <p><span className="font-medium">Order ID:</span> {orderDetails.payment.razorpay_order_id}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Shipping Address */}
                {orderDetails.shipping_address && (
                  <div className="p-4 bg-base-200 rounded-lg">
                    <h4 className="font-semibold text-primary mb-2">Shipping Address</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <p><span className="font-medium">Address Type:</span> {orderDetails.shipping_address.address_type}</p>
                      <p><span className="font-medium">Line 1:</span> {orderDetails.shipping_address.line1}</p>
                      {orderDetails.shipping_address.line2 && (
                        <p><span className="font-medium">Line 2:</span> {orderDetails.shipping_address.line2}</p>
                      )}
                      <p><span className="font-medium">City:</span> {orderDetails.shipping_address.city}</p>
                      <p><span className="font-medium">State:</span> {orderDetails.shipping_address.state}</p>
                      <p><span className="font-medium">PIN Code:</span> {orderDetails.shipping_address.pin_code}</p>
                    </div>
                  </div>
                )}

                {/* Order Items */}
                <div className="p-4 bg-base-200 rounded-lg">
                  <h4 className="font-semibold text-primary mb-4">Order Items ({orderDetails.items.length})</h4>
                  <div className="overflow-x-auto">
                    <table className="table table-sm table-zebra w-full">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Price</th>
                          <th>Quantity</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orderDetails.items.map((item) => (
                          <tr key={item.id}>
                            <td>
                              <div className="flex items-center gap-3">
                                {item.product.image && (
                                  <img
                                    src={item.product.image}
                                    alt={item.product.name}
                                    className="w-12 h-12 object-cover rounded"
                                  />
                                )}
                                <div>
                                  <p className="font-medium">{item.product.name}</p>
                                  <p className="text-sm text-gray-500">Category: {item.product.category}</p>
                                </div>
                              </div>
                            </td>
                            <td>₹{parseFloat(item.price).toFixed(2)}</td>
                            <td>{item.quantity}</td>
                            <td>₹{parseFloat(item.total_price).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Status Update Section */}
                <div className="p-4 bg-base-200 rounded-lg">
                  <h4 className="font-semibold text-primary mb-4">Update Order Status</h4>
                  <div className="flex gap-4 items-center">
                    <select
                      className="select select-bordered flex-1 max-w-xs"
                      value={orderDetails.status}
                      onChange={(e) => handleStatusChange(orderDetails.id, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <button
                      className="btn btn-primary"
                      onClick={closeModal}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Failed to load order details</p>
                <button className="btn btn-primary mt-4" onClick={closeModal}>
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderManagement;
