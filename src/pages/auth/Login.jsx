import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Alert message state
  const [alert, setAlert] = useState({ message: "", type: "error" }); // type: "success" | "error"

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  // Auto-clear alert after 3s
  useEffect(() => {
    if (alert.message) {
      const timer = setTimeout(
        () => setAlert({ message: "", type: "error" }),
        3000
      );
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const validate = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      await login(email, password);
      sessionStorage.setItem("showLoginToast", "true");
      navigate("/");
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input input-bordered"
            />
          </div>

          <div className="form-control">
            <label className="label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input input-bordered"
            />
          </div>

          <div className="form-control mt-6">
            <button
              className="btn btn-primary"
              type="submit"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>

          <p className="mt-3 text-center">
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
