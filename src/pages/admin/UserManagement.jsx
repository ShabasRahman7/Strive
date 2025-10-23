import { useEffect, useState } from "react";
import api from "../../api/axios";
import { getImageUrl } from "../../utils/imageUtils";
import {
  Lock,
  Unlock,
  Mail,
  UserRound,
  Users,
  Trash,
  Plus,
  Edit,
  Clock,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { toast } from "react-toastify";
import Swal from 'sweetalert2';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [unactivatedUsers, setUnactivatedUsers] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [activeTab, setActiveTab] = useState("active");

  const fetchUsers = async () => {
    try {
      const res = await api.get('/api/users/admin/list/');
      setUsers(res.data.users || []);
    } catch (err) {
      console.error("Failed to fetch users", err);
      toast.error("Failed to fetch users");
    }
  };

  const fetchUnactivatedUsers = async () => {
    try {
      const res = await api.get('/api/users/admin/unactivated/');
      setUnactivatedUsers(res.data.users || []);
    } catch (err) {
      console.error("Failed to fetch unactivated users", err);
      toast.error("Failed to fetch unactivated users");
    }
  };

  const toggleBlock = async (user) => {
    try {
      const updatedUser = { ...user, isBlocked: !user.isBlocked };
      await api.patch(`/api/users/${user.id}/admin/update/`, { isBlocked: !user.isBlocked });
      toast.success(
        `${updatedUser.firstName || updatedUser.name} has been ${
          updatedUser.isBlocked ? "blocked" : "unblocked"
        }`
      );
      fetchUsers();
    } catch (err) {
      toast.error("Failed to update user");
      console.error(err);
    }
  };

  const deleteUser = async (user) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete the user: ${user.name}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/api/users/${user.id}/admin/delete/`);
        toast.success(`${user.name} has been deleted`);
        fetchUsers();
      } catch (err) {
        toast.error("Failed to delete user");
        console.error(err);
      }
    }
  };

  const addUser = async (userData) => {
    try {
      await api.post('/api/users/admin/create/', userData);
      toast.success('User created successfully. Password setup email sent.');
      setShowAddForm(false);
      // Refresh both user lists to update counts
      fetchUsers();
      fetchUnactivatedUsers();
    } catch (err) {
      toast.error("Failed to create user");
      console.error(err);
    }
  };

  const editUser = async (userData) => {
    try {
      await api.patch(`/api/users/${editingUser.id}/admin/edit/`, userData);
      toast.success('User updated successfully');
      setShowEditForm(false);
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      toast.error("Failed to update user");
      console.error(err);
    }
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setShowEditForm(true);
  };

  const resendSetupEmail = async (user) => {
    try {
      await api.post(`/api/users/${user.id}/admin/resend-setup/`);
      toast.success(`Password setup email sent to ${user.name}`);
      fetchUnactivatedUsers(); // Refresh the list
    } catch (err) {
      toast.error("Failed to resend setup email");
      console.error(err);
    }
  };

  const deleteUnactivatedUser = async (user) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete the unactivated user: ${user.name}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/api/users/${user.id}/admin/delete/`);
        toast.success(`${user.name} has been deleted`);
        fetchUnactivatedUsers(); // Refresh the list
      } catch (err) {
        toast.error("Failed to delete user");
        console.error(err);
      }
    }
  };

  useEffect(() => {
    if (activeTab === "active") {
      fetchUsers();
    } else {
      fetchUnactivatedUsers();
    }
  }, [filterStatus, activeTab]);

  // Filter users based on status
  const filteredUsers = users.filter(user => {
    // Main list should only show Active and Blocked users (not Pending)
    if (filterStatus === "all") return user.isActive || user.isBlocked;
    if (filterStatus === "active") return user.isActive && !user.isBlocked;
    if (filterStatus === "blocked") return user.isBlocked;
    // Remove pending filter from main list - pending users go to unactivated tab
    return true;
  });

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* Heading */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-primary flex items-center gap-2">
          <Users className="w-6 h-6" />
          User Management
        </h1>

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            className="btn btn-primary"
            onClick={() => setShowAddForm(true)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add User
          </button>
          <select
            className="select select-bordered w-full sm:w-auto"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs tabs-boxed mb-6">
        <button
          className={`tab ${activeTab === "active" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("active")}
        >
          <Users className="w-4 h-4 mr-2" />
          Active Users ({users.filter(user => user.isActive || user.isBlocked).length})
        </button>
        <button
          className={`tab ${activeTab === "unactivated" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("unactivated")}
        >
          <AlertTriangle className="w-4 h-4 mr-2" />
          Unactivated Users ({unactivatedUsers.length})
        </button>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto rounded-md shadow-md">
        <table className="table table-zebra w-full min-w-[700px]">
          <thead className="bg-base-200 sticky top-0 z-10">
            <tr>
              <th>#</th>
              <th>User ID</th>
              <th>Profile</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {activeTab === "active" ? (
              // Active Users Table
              <>
                {filteredUsers.map((user, idx) => (
                  <tr key={user.id}>
                    <td>{idx + 1}</td>
                    <td>{user.id}</td>
                    <td>
                      <div className="avatar">
                        <div className="w-8 sm:w-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                          <img
                            src={getImageUrl(user.profileImage)}
                            alt={user.name}
                          />
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <UserRound className="w-4 h-4 text-info" />
                        {user.firstName || user.name}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4 text-accent" />
                        {user.email}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-outline">{user.role}</span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          user.isBlocked 
                            ? "badge-error" 
                            : user.isActive 
                            ? "badge-success" 
                            : "badge-warning"
                        }`}
                      >
                        {user.isBlocked 
                          ? "Blocked" 
                          : user.isActive 
                          ? "Active" 
                          : "Pending"
                        }
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          className="btn btn-sm btn-info"
                          onClick={() => handleEditClick(user)}
                        >
                          <Edit className="w-4 h-4 mr-1" /> Edit
                        </button>
                        <button
                          className={`btn btn-sm ${
                            user.isBlocked ? "btn-success" : "btn-error"
                          }`}
                          onClick={() => toggleBlock(user)}
                        >
                          {user.isBlocked ? (
                            <>
                              <Unlock className="w-4 h-4 mr-1" /> Unblock
                            </>
                          ) : (
                            <>
                              <Lock className="w-4 h-4 mr-1" /> Block
                            </>
                          )}
                        </button>
                        <button
                          className="btn btn-sm btn-error"
                          onClick={() => deleteUser(user)}
                        >
                          <Trash className="w-4 h-4 mr-1" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="8" className="text-center text-gray-400 italic py-4">
                      No active users found.
                    </td>
                  </tr>
                )}
              </>
            ) : (
              // Unactivated Users Table
              <>
                {unactivatedUsers.map((user, idx) => (
                  <tr key={user.id}>
                    <td>{idx + 1}</td>
                    <td>{user.id}</td>
                    <td>
                      <div className="avatar">
                        <div className="w-8 sm:w-10 rounded-full ring ring-warning ring-offset-base-100 ring-offset-2">
                          <img
                            src={getImageUrl(user.profileImage)}
                            alt={user.name}
                          />
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <UserRound className="w-4 h-4 text-info" />
                        {user.firstName || user.name}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4 text-accent" />
                        {user.email}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-outline">{user.role}</span>
                    </td>
                    <td>
                      <span className="badge badge-warning">
                        <Clock className="w-3 h-3 mr-1" />
                        Unactivated
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          className="btn btn-sm btn-warning"
                          onClick={() => resendSetupEmail(user)}
                        >
                          <RefreshCw className="w-4 h-4 mr-1" /> Resend Email
                        </button>
                        <button
                          className="btn btn-sm btn-error"
                          onClick={() => deleteUnactivatedUser(user)}
                        >
                          <Trash className="w-4 h-4 mr-1" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {unactivatedUsers.length === 0 && (
                  <tr>
                    <td colSpan="8" className="text-center text-gray-400 italic py-4">
                      No unactivated users found.
                    </td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
          <div className="bg-base-100 text-base-content p-6 rounded-md shadow-xl w-[90%] max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New User</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const userData = {
                username: formData.get('username'),
                email: formData.get('email'),
                name: formData.get('name'),
                role: formData.get('role'),
                is_blocked: formData.get('is_blocked') === 'on'
              };
              addUser(userData);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="label">
                    <span className="label-text">Username</span>
                  </label>
                  <input
                    type="text"
                    name="username"
                    className="input input-bordered w-full"
                    required
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Email</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="input input-bordered w-full"
                    required
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Name</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="input input-bordered w-full"
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Role</span>
                  </label>
                  <select name="role" className="select select-bordered w-full">
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">Block User</span>
                    <input type="checkbox" name="is_blocked" className="checkbox" />
                  </label>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button type="submit" className="btn btn-primary flex-1">
                  Create User
                </button>
                <button
                  type="button"
                  className="btn btn-outline flex-1"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditForm && editingUser && (
        <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
          <div className="bg-base-100 text-base-content p-6 rounded-md shadow-xl w-[90%] max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit User</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const userData = {
                username: formData.get('username'),
                email: formData.get('email'),
                first_name: formData.get('name'),
                role: formData.get('role'),
                isBlocked: formData.get('is_blocked') === 'on'
              };
              editUser(userData);
            }}>
              <div className="space-y-4">
                <div>
                  <label className="label">
                    <span className="label-text">Username</span>
                  </label>
                  <input
                    type="text"
                    name="username"
                    defaultValue={editingUser.username}
                    className="input input-bordered w-full"
                    required
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Email</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={editingUser.email}
                    className="input input-bordered w-full"
                    required
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Name</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={editingUser.firstName || editingUser.name}
                    className="input input-bordered w-full"
                  />
                </div>
                <div>
                  <label className="label">
                    <span className="label-text">Role</span>
                  </label>
                  <select name="role" className="select select-bordered w-full" defaultValue={editingUser.role}>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">Block User</span>
                    <input 
                      type="checkbox" 
                      name="is_blocked" 
                      className="checkbox" 
                      defaultChecked={editingUser.isBlocked}
                    />
                  </label>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button type="submit" className="btn btn-primary flex-1">
                  Update User
                </button>
                <button
                  type="button"
                  className="btn btn-outline flex-1"
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingUser(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserManagement;
