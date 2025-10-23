import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const schema = yup.object().shape({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords do not match")
    .required("Confirm password is required"),
});

export default function Register() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ message: "", type: "error" });
  const [otpStage, setOtpStage] = useState({ open: false, email: "" });
  const [otp, setOtp] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (user) {
      navigate("/profile");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (alert.message) {
      const timer = setTimeout(() => setAlert({ message: "", type: "error" }), 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await api.post("/api/register_request/", {
        name: data.name,
        email: data.email,
        password: data.password,
      });
      setOtpStage({ open: true, email: data.email });
      toast.info("OTP sent to your email");
    } catch (error) {
      const msg = error.response?.data?.error || error.message || "Registration failed";
      setAlert({ message: msg, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return toast.error("Enter OTP");
    try {
      setLoading(true);
      await api.post("/api/register_verify/", {
        email: otpStage.email,
        otp,
      });
      toast.success("Account created. Please login.");
      setOtpStage({ open: false, email: "" });
      setOtp("");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.error || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-base-200">
      <div className="card w-96 bg-base-100 shadow-xl mx-4">
        <div className="flex justify-center pt-6">
          <img src="/strive-logo.png" alt="Logo" className="h-16 w-auto" />
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="card-body">
          <h2 className="text-2xl font-bold text-center">Register</h2>

          {alert.message && (
            <div className={`alert alert-${alert.type} shadow-sm`}>
              <span>{alert.message}</span>
            </div>
          )}

          <div className="form-control">
            <label className="label">Name</label>
            <input
              type="text"
              {...register("name")}
              className="input input-bordered"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>

          <div className="form-control">
            <label className="label">Email</label>
            <input
              type="email"
              {...register("email")}
              className="input input-bordered"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div className="form-control">
            <label className="label">Password</label>
            <input
              type="password"
              {...register("password")}
              className="input input-bordered"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          <div className="form-control">
            <label className="label">Confirm Password</label>
            <input
              type="password"
              {...register("confirmPassword")}
              className="input input-bordered"
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="form-control mt-6">
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Registering...
                </>
              ) : (
                "Register"
              )}
            </button>
          </div>

          <p className="mt-3 text-center">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Login Here
            </Link>
          </p>
        </form>
      </div>

      {otpStage.open && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Verify Email</h3>
            <p className="py-2 text-sm text-gray-600">We sent an OTP to {otpStage.email}. Enter it to complete signup.</p>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="input input-bordered w-full"
              placeholder="Enter 6-digit OTP"
            />
            <div className="modal-action">
              <button className="btn btn-outline" onClick={() => setOtpStage({ open: false, email: "" })}>Cancel</button>
              <button className="btn btn-primary" onClick={handleVerifyOtp} disabled={loading}>
                {loading ? <span className="loading loading-spinner loading-sm"></span> : 'Verify'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
