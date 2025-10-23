import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import api from "../../api/axios";
import { toast } from "react-toastify";

const schema = yup.object().shape({
  new_password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirm_password: yup
    .string()
    .oneOf([yup.ref("new_password")], "Passwords must match")
    .required("Confirm password is required"),
});

export default function ResetPassword() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (!token) {
      toast.error("Invalid reset link");
      navigate("/login");
    }
  }, [token, navigate]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await api.post("/api/reset_password/", {
        token,
        new_password: data.new_password,
      });
      setSuccess(true);
      toast.success("Password reset successfully");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-base-200">
        <div className="card w-96 bg-base-100 shadow-xl mx-4">
          <div className="flex justify-center pt-6">
            <img src="/strive-logo.png" alt="Logo" className="h-16 w-auto" />
          </div>
          <div className="card-body text-center">
            <h2 className="text-2xl font-bold text-green-600">Success!</h2>
            <p className="text-gray-600 mt-2">
              Your password has been reset successfully.
            </p>
            <div className="mt-6">
              <Link to="/login" className="btn btn-primary">
                Login Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!token) {
    return null; // Will redirect to login if token is invalid
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-base-200">
      <div className="card w-96 bg-base-100 shadow-xl mx-4">
        <div className="flex justify-center pt-6">
          <img src="/strive-logo.png" alt="Logo" className="h-16 w-auto" />
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="card-body">
          <h2 className="text-2xl font-bold text-center">Reset Password</h2>
          <p className="text-gray-600 text-center mt-2">
            Enter your new password below.
          </p>

          <div className="form-control mt-6">
            <label className="label">New Password</label>
            <input
              type="password"
              {...register("new_password")}
              className="input input-bordered"
              placeholder="Enter new password"
            />
            {errors.new_password && <p className="text-red-500 text-sm mt-1">{errors.new_password.message}</p>}
          </div>

          <div className="form-control">
            <label className="label">Confirm Password</label>
            <input
              type="password"
              {...register("confirm_password")}
              className="input input-bordered"
              placeholder="Confirm new password"
            />
            {errors.confirm_password && <p className="text-red-500 text-sm mt-1">{errors.confirm_password.message}</p>}
          </div>

          <div className="form-control mt-8">
            <button
              className="btn btn-primary w-full py-3 text-lg"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Resetting...
                </>
              ) : (
                "Reset Password"
              )}
            </button>
          </div>

          <p className="mt-6 text-center">
            Remember your password?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Login Here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
