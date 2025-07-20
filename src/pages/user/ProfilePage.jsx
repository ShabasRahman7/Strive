import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  Mail,
  UserRound,
  Edit3,
  Save,
  Home,
  Trash2,
  Plus,
  ImageIcon,
} from "lucide-react";
import api from "../../api/axios";
import Swal from "sweetalert2";

function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [profileImage, setProfileImage] = useState(user?.profileImage || "");
  const [formErrors, setFormErrors] = useState({});

  const [form, setForm] = useState({
    line1: "",
    line2: "",
    city: "",
    state: "",
    pin: "",
    type: "home",
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg font-semibold text-error">User not logged in.</p>
      </div>
    );
  }

  const handleSave = async () => {
    try {
      const updatedUser = {
        ...user,
        name,
        profileImage,
      };
      await api.patch(`/users/${user.id}`, updatedUser);
      updateUser(updatedUser);
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err.message);
    }
  };

  const addAddress = async () => {
    const fullAddress = {
      ...form,
      id: crypto.randomUUID(),
    };

    const updatedUser = {
      ...user,
      addresses: [...(user.addresses || []), fullAddress],
    };

    try {
      await api.patch(`/users/${user.id}`, updatedUser);
      updateUser(updatedUser);
      setShowAdd(false);
      setForm({
        line1: "",
        line2: "",
        city: "",
        state: "",
        pin: "",
        type: "home",
      });
    } catch (err) {
      console.error("Failed to add address:", err.message);
    }
  };

  const deleteAddress = async (id) => {
    const result = await Swal.fire({
      title: "Delete this address?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it",
    });

    if (result.isConfirmed) {
      const updatedUser = {
        ...user,
        addresses: user.addresses.filter((addr) => addr.id !== id),
      };

      try {
        await api.patch(`/users/${user.id}`, updatedUser);
        updateUser(updatedUser);

        await Swal.fire({
          title: "Deleted!",
          text: "The address has been removed.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (err) {
        console.error("Failed to delete address:", err.message);
        Swal.fire("Error", "Could not delete address. Try again.", "error");
      }
    }
  };

  return (
    <div className="min-h-screen bg-base-200 py-10 px-4">
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
          <div className="mt-2">
            {isEditing ? (
              <button
                onClick={handleSave}
                className="btn btn-sm btn-primary flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-outline btn-sm flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        <div className="mt-8 space-y-6">
          {/* Email */}
          <div className="flex items-start gap-3">
            <Mail className="text-primary mt-1" />
            <div>
              <h4 className="font-semibold">Email</h4>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>

          {/* Address List */}
          <div className="flex items-start gap-3">
            <Home className="text-primary mt-1" />
            <div className="w-full">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold">Saved Addresses</h4>
                <button
                  onClick={() => setShowAdd(true)}
                  className="btn btn-sm btn-outline btn-primary"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Address
                </button>
              </div>

              {user.addresses && user.addresses.length > 0 ? (
                <ul className="space-y-3">
                  {user.addresses.map((addr) => (
                    <li
                      key={addr.id}
                      className="border p-4 rounded-lg bg-base-100 flex justify-between items-start"
                    >
                      <div>
                        <p className="font-medium">{addr.type.toUpperCase()}</p>
                        <p className="text-sm text-gray-500">{addr.line1}</p>
                        {addr.line2 && (
                          <p className="text-sm text-gray-500">{addr.line2}</p>
                        )}
                        <p className="text-sm text-gray-500">
                          {addr.city}, {addr.state} - {addr.pin}
                        </p>
                      </div>
                      <button
                        className="btn btn-sm btn-error btn-circle"
                        onClick={() => deleteAddress(addr.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="italic text-sm text-gray-400">
                  No addresses saved.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* DaisyUI Modal for Adding Address */}
      <input
        type="checkbox"
        id="add-address-modal"
        className="modal-toggle"
        checked={showAdd}
        readOnly
      />
      <div className="modal">
        <div className="modal-box w-full max-w-md">
          <h3 className="font-bold text-lg mb-4">Add New Address</h3>

          {/* Address form with validation */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const errors = {};

              if (!form.line1.trim()) errors.line1 = "Address line is required";
              if (!form.city.trim()) errors.city = "City is required";
              if (!form.state.trim()) errors.state = "State is required";
              if (!form.pin.trim()) {
                errors.pin = "PIN code is required";
              } else if (!/^\d{6}$/.test(form.pin)) {
                errors.pin = "PIN code must be 6 digits";
              }

              if (Object.keys(errors).length > 0) {
                setFormErrors(errors);
                return;
              }

              setFormErrors({});
              addAddress();
            }}
          >
            {/* Field errors state */}
            {Object.keys(formErrors || {}).length > 0 && (
              <div className="alert alert-error mb-4 p-2 text-sm">
                Please enter the mandatory fields.
              </div>
            )}

            <div className="mb-2">
              <input
                type="text"
                placeholder="House No, Street *"
                value={form.line1}
                onChange={(e) => setForm({ ...form, line1: e.target.value })}
                className={`input input-bordered w-full ${
                  formErrors?.line1 ? "input-error" : ""
                }`}
              />
              {formErrors?.line1 && (
                <p className="text-xs text-error mt-1">{formErrors.line1}</p>
              )}
            </div>

            <div className="mb-2">
              <input
                type="text"
                placeholder="Landmark / Area (Optional)"
                value={form.line2}
                onChange={(e) => setForm({ ...form, line2: e.target.value })}
                className="input input-bordered w-full"
              />
            </div>

            <div className="mb-2">
              <input
                type="text"
                placeholder="City *"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className={`input input-bordered w-full ${
                  formErrors?.city ? "input-error" : ""
                }`}
              />
              {formErrors?.city && (
                <p className="text-xs text-error mt-1">{formErrors.city}</p>
              )}
            </div>

            <div className="mb-2">
              <input
                type="text"
                placeholder="State *"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                className={`input input-bordered w-full ${
                  formErrors?.state ? "input-error" : ""
                }`}
              />
              {formErrors?.state && (
                <p className="text-xs text-error mt-1">{formErrors.state}</p>
              )}
            </div>

            <div className="mb-2">
              <input
                type="text"
                placeholder="PIN Code *"
                value={form.pin}
                onChange={(e) => setForm({ ...form, pin: e.target.value })}
                className={`input input-bordered w-full ${
                  formErrors?.pin ? "input-error" : ""
                }`}
              />
              {formErrors?.pin && (
                <p className="text-xs text-error mt-1">{formErrors.pin}</p>
              )}
            </div>

            <div className="mb-4">
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="select select-bordered w-full"
              >
                <option value="home">Home</option>
                <option value="work">Work</option>
              </select>
            </div>

            <div className="modal-action">
              <button
                type="button"
                onClick={() => {
                  setShowAdd(false);
                  setFormErrors({});
                }}
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

export default ProfilePage;
