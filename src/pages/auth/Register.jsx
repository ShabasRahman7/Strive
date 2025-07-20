import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ message: "", type: "error" }); 

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

  const validate = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name.trim()) {
      setAlert({ message: "Name is required.", type: "error" });
      return false;
    }
    if (!email.trim()) {
      setAlert({ message: "Email is required.", type: "error" });
      return false;
    }
    if (!emailRegex.test(email)) {
      setAlert({ message: "Enter a valid email.", type: "error" });
      return false;
    }
    if (!password) {
      setAlert({ message: "Password is required.", type: "error" });
      return false;
    }
    if (password.length < 6) {
      setAlert({
        message: "Password must be at least 6 characters.",
        type: "error",
      });
      return false;
    }
    if (!confirmPassword) {
      setAlert({ message: "Confirm password is required.", type: "error" });
      return false;
    }
    if (confirmPassword !== password) {
      setAlert({ message: "Passwords do not match.", type: "error" });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      await register(email, password, name);
      toast.success("Registration Successfull")
      navigate("/profile");
    } catch (error) {
      setAlert({ message: error.message, type: "error" });
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
        <form onSubmit={handleSubmit} className="card-body">
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
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input input-bordered"
              required
            />
          </div>

          <div className="form-control">
            <label className="label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input input-bordered"
              required
            />
          </div>

          <div className="form-control">
            <label className="label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input input-bordered"
              required
            />
          </div>

          <div className="form-control">
            <label className="label">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input input-bordered"
              required
            />
          </div>

          <div className="form-control mt-6">
            <button
              className="btn btn-primary"
              type="submit"
              disabled={loading}
            >
              {loading ? "Registering..." : "Register"}
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
    </div>
  );
}
