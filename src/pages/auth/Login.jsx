import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const schema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().required("Password is required"),
});

export default function Login() {
  const { user, login, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ message: "", type: "error" });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
  if (!authLoading && user) {
    if (user.role === "admin") {
      navigate("/admin");
    } else {
      navigate("/");
    }
  }
}, [authLoading, user, navigate]);

  useEffect(() => {
    if (alert.message) {
      const timer = setTimeout(() => setAlert({ message: "", type: "error" }), 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await login(data.email, data.password);
      sessionStorage.setItem("showLoginToast", "true");
      navigate("/");
    } catch (error) {
      const friendly = error?.message || 'Login failed. Please try again.';
      setAlert({ message: friendly, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary"></span>
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
          <h2 className="text-2xl font-bold text-center">Login</h2>

          {alert.message && (
            <div className={`alert alert-${alert.type} shadow-sm`}>
              <span>{alert.message}</span>
            </div>
          )}

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
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>

          <div className="form-control mt-6">
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>
          </div>

          <p className="mt-3 text-center">
            <Link to="/forgot-password" className="text-primary hover:underline text-sm">
              Forgot Password?
            </Link>
          </p>

          <p className="mt-2 text-center">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary hover:underline">
              Register Here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
