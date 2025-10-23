import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import api from "../../api/axios";
import { toast } from "react-toastify";

const schema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
});

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await api.post("/api/forgot_password/", { email: data.email });
      setSent(true);
      toast.success("Reset link sent to your email");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-base-200">
        <div className="card w-96 bg-base-100 shadow-xl mx-4">
          <div className="flex justify-center pt-6">
            <img src="/strive-logo.png" alt="Logo" className="h-16 w-auto" />
          </div>
          <div className="card-body text-center">
            <h2 className="text-2xl font-bold">Check Your Email</h2>
            <p className="text-gray-600 mt-2">
              We've sent a password reset link to your email address.
            </p>
            <div className="mt-6">
              <Link to="/login" className="btn btn-primary">
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-base-200">
      <div className="card w-96 bg-base-100 shadow-xl mx-4">
        <div className="flex justify-center pt-6">
          <img src="/strive-logo.png" alt="Logo" className="h-16 w-auto" />
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="card-body">
          <h2 className="text-2xl font-bold text-center">Forgot Password</h2>
          <p className="text-gray-600 text-center mt-2">
            Enter your email address and we'll send you a reset link.
          </p>

          <div className="form-control mt-6">
            <label className="label">Email</label>
            <input
              type="email"
              {...register("email")}
              className="input input-bordered"
              placeholder="Enter your email"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div className="form-control mt-6">
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Sending...
                </>
              ) : (
                "Send Link"
              )}
            </button>
          </div>

          <p className="mt-3 text-center">
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
