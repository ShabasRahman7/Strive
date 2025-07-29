import { useEffect, useState } from "react";
import api from "../../api/axios";
import {
  Lock,
  Unlock,
  Mail,
  UserRound,
  Users,
} from "lucide-react";
import { toast } from "react-toastify";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      const filteredUsers = res.data.filter((user) => user.role !== "admin");
      setUsers(filteredUsers);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  const toggleBlock = async (user) => {
    try {
      const updatedUser = { ...user, isBlocked: !user.isBlocked };
      await api.patch(`/users/${user.id}`, updatedUser);
      toast.success(
        `${updatedUser.name} has been ${
          updatedUser.isBlocked ? "blocked" : "unblocked"
        }`
      );
      fetchUsers();
    } catch (err) {
      toast.error("Failed to update user");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers =
    filterStatus === "all"
      ? users
      : users.filter((user) =>
          filterStatus === "active" ? !user.isBlocked : user.isBlocked
        );

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* Heading */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-primary flex items-center gap-2">
          <Users className="w-6 h-6" />
          User Management
        </h1>

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
            {filteredUsers.map((user, idx) => (
              <tr key={user.id}>
                <td>{idx + 1}</td>
                <td>{user.id}</td>
                <td>
                  <div className="avatar">
                    <div className="w-8 sm:w-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                      <img
                        src={user.profileImage || "/placeholder.png"}
                        alt={user.name}
                      />
                    </div>
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-1">
                    <UserRound className="w-4 h-4 text-info" />
                    {user.name}
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
                      user.isBlocked ? "badge-error" : "badge-success"
                    }`}
                  >
                    {user.isBlocked ? "Blocked" : "Active"}
                  </span>
                </td>
                <td>
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
                </td>
              </tr>
            ))}

            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan="8" className="text-center text-gray-400 italic py-4">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserManagement;
