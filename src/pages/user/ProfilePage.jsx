import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Mail, Edit3, Save, Home, Trash2, Plus } from "lucide-react";
import api from "../../api/axios";
import Swal from "sweetalert2";
import { toast, ToastContainer } from "react-toastify";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import "react-toastify/dist/ReactToastify.css";

const addressSchema = yup.object().shape({
  line1: yup.string().trim().required("Address line is required"),
  line2: yup.string().optional(),
  city: yup.string().trim().required("City is required"),
  state: yup.string().trim().required("State is required"),
  pin: yup.string().matches(/^\d{6}$/, "PIN code must be 6 digits").required("PIN code is required"),
  type: yup.string().oneOf(["home", "work"]).required(),
});

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [profileImage, setProfileImage] = useState(user?.profileImage || "");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(addressSchema),
    defaultValues: { line1: "", line2: "", city: "", state: "", pin: "", type: "home" },
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg font-semibold text-error">User not logged in.</p>
      </div>
    );
  }

  const handleSaveProfile = async () => {
    try {
      const updatedUser = { ...user, name, profileImage };
      await api.patch(`/users/${user.id}`, updatedUser);
      updateUser(updatedUser);
      setIsEditing(false);
      toast.success("Profile updated");
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error("Failed to update profile");
    }
  };

  const addAddress = async (data) => {
    const newAddr = { ...data, id: crypto.randomUUID() };
    const updatedUser = { ...user, addresses: [...(user.addresses || []), newAddr] };
    try {
      await api.patch(`/users/${user.id}`, updatedUser);
      updateUser(updatedUser);
      setShowAdd(false);
      reset();
      toast.success("Address added");
    } catch (err) {
      console.error("Failed to add address:", err);
      toast.error("Failed to add address");
    }
  };

  const deleteAddress = async (id) => {
    const res = await Swal.fire({
      title: "Delete this address?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it",
    });
    if (!res.isConfirmed) return;

    try {
      const updatedUser = { ...user, addresses: user.addresses.filter((a) => a.id !== id) };
      await api.patch(`/users/${user.id}`, updatedUser);
      updateUser(updatedUser);
      toast.success("Address deleted");
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete address");
    }
  };

  return (
    <div className="min-h-screen bg-base-200 py-10 px-4">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="max-w-3xl mx-auto bg-base-100 shadow-lg rounded-lg p-8">
        <div className="flex flex-col items-center gap-4">
          <img
            src={profileImage || "/default-avatar.png"}
            alt="User Avatar"
            className="w-24 h-24 rounded-full object-cover shadow"
          />
          {isEditing && (
            <input
              type="text"
              placeholder="Profile Image URL"
              value={profileImage}
              onChange={(e) => setProfileImage(e.target.value)}
              className="input input-sm input-bordered w-full max-w-xs"
            />
          )}
          <h2 className="text-2xl font-bold">
            {isEditing ? (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input input-sm input-bordered w-full max-w-xs"
              />
            ) : (
              user.name
            )}
          </h2>
          <div>
            {isEditing ? (
              <button onClick={handleSaveProfile} className="btn btn-sm btn-primary flex items-center gap-2">
                <Save className="w-4 h-4" /> Save Changes
              </button>
            ) : (
              <button onClick={() => setIsEditing(true)} className="btn btn-outline btn-sm flex items-center gap-2">
                <Edit3 className="w-4 h-4" /> Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Email section */}
        <div className="mt-8 flex items-start gap-3">
          <Mail className="text-primary mt-1" />
          <div>
            <h4 className="font-semibold">Email</h4>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>

        {/* Addresses */}
        <div className="mt-8 flex items-start gap-3">
          <Home className="text-primary mt-1" />
          <div className="w-full">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold">Saved Addresses</h4>
              <button onClick={() => setShowAdd(true)} className="btn btn-sm btn-outline btn-primary">
                <Plus className="w-4 h-4 mr-1" /> Add Address
              </button>
            </div>

            {user.addresses?.length ? (
              <ul className="space-y-3">
                {user.addresses.map((addr) => (
                  <li
                    key={addr.id}
                    className="border p-4 rounded-lg bg-base-100 flex justify-between items-start"
                  >
                    <div>
                      <p className="font-medium">{addr.type.toUpperCase()}</p>
                      <p className="text-sm text-gray-500">{addr.line1}</p>
                      {addr.line2 && <p className="text-sm text-gray-500">{addr.line2}</p>}
                      <p className="text-sm text-gray-500">
                        {addr.city}, {addr.state} - {addr.pin}
                      </p>
                    </div>
                    <button className="btn btn-sm btn-error btn-circle" onClick={() => deleteAddress(addr.id)}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="italic text-sm text-gray-400">No addresses saved.</p>
            )}
          </div>
        </div>
      </div>

      {/* Add Address modal */}
      <input type="checkbox" id="add-address-modal" className="modal-toggle" checked={showAdd} readOnly />
      <div className="modal">
        <div className="modal-box w-full max-w-md">
          <h3 className="font-bold text-lg mb-4">Add New Address</h3>

          <form onSubmit={handleSubmit(addAddress)}>
            <div className="mb-2">
              <input
                type="text"
                placeholder="House No, Street *"
                {...register("line1")}
                className={`input input-bordered w-full ${errors.line1 ? "input-error" : ""}`}
              />
              {errors.line1 && <p className="text-xs text-error mt-1">{errors.line1.message}</p>}
            </div>

            <div className="mb-2">
              <input
                type="text"
                placeholder="Landmark / Area (Optional)"
                {...register("line2")}
                className="input input-bordered w-full"
              />
            </div>

            <div className="mb-2">
              <input
                type="text"
                placeholder="City *"
                {...register("city")}
                className={`input input-bordered w-full ${errors.city ? "input-error" : ""}`}
              />
              {errors.city && <p className="text-xs text-error mt-1">{errors.city.message}</p>}
            </div>

            <div className="mb-2">
              <input
                type="text"
                placeholder="State *"
                {...register("state")}
                className={`input input-bordered w-full ${errors.state ? "input-error" : ""}`}
              />
              {errors.state && <p className="text-xs text-error mt-1">{errors.state.message}</p>}
            </div>

            <div className="mb-2">
              <input
                type="text"
                placeholder="PIN Code *"
                {...register("pin")}
                className={`input input-bordered w-full ${errors.pin ? "input-error" : ""}`}
              />
              {errors.pin && <p className="text-xs text-error mt-1">{errors.pin.message}</p>}
            </div>

            <div className="mb-4">
              <select {...register("type")} className="select select-bordered w-full">
                <option value="home">Home</option>
                <option value="work">Work</option>
              </select>
            </div>

            <div className="modal-action">
              <button
                type="button"
                onClick={() => { setShowAdd(false); reset(); }}
                className="btn btn-ghost btn-sm"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary btn-sm">
                Save Address
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
