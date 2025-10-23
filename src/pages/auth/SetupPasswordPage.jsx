import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { toast } from "react-toastify";
import { Lock, Eye, EyeOff } from "lucide-react";
import Swal from 'sweetalert2';
import { useAuth } from "../../context/AuthContext";

const SetupPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");
  const [tokenValidating, setTokenValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);

  // Function to validate token
  const validateToken = async (tokenToValidate) => {
    try {
      // Make a request to validate the token
      const response = await api.post("/api/password-setup/validate/", {
        token: tokenToValidate
      });
      
      if (response.status === 200) {
        setTokenValid(true);
        setTokenValidating(false);
      }
    } catch (error) {
      console.error("Token validation error:", error);
      
      let errorMessage = "Invalid or expired setup token";
      let errorTitle = "Token Error";
      
      if (error.response?.status === 400) {
        errorMessage = error.response.data?.error || "Invalid or expired setup token";
        errorTitle = "Token Expired";
      } else if (error.response?.status === 401) {
        // Try to refresh the page for 401 errors (might be CSRF/session issue)
        console.log("401 error detected, attempting page refresh...");
        window.location.reload();
        return;
      } else if (error.response?.status === 500) {
        errorMessage = "Server error occurred while validating token";
        errorTitle = "Server Error";
      }
      
      // Show SweetAlert for token error with DaisyUI styling
      Swal.fire({
        title: errorTitle,
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'Go to Login',
        confirmButtonColor: '#ef4444',
        background: '#ffffff',
        color: '#1f2937',
        customClass: {
          popup: 'rounded-lg shadow-lg bg-white border border-gray-200',
          title: 'text-red-600 font-semibold text-xl',
          content: 'text-gray-700 text-base',
          confirmButton: 'btn btn-error bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-md'
        },
        allowOutsideClick: false,
        allowEscapeKey: false
      }).then(() => {
        navigate("/login");
      });
      
      setTokenValid(false);
      setTokenValidating(false);
    }
  };

  useEffect(() => {
    // Wait for AuthContext to finish loading before proceeding
    if (authLoading) {
      return;
    }

    const tokenParam = searchParams.get("token");
    if (!tokenParam) {
      Swal.fire({
        title: 'Invalid Link',
        text: 'No token found in the setup link. Please contact your administrator.',
        icon: 'error',
        confirmButtonText: 'Go to Login',
        confirmButtonColor: '#ef4444',
        background: '#ffffff',
        color: '#1f2937',
        customClass: {
          popup: 'rounded-lg shadow-lg bg-white border border-gray-200',
          title: 'text-red-600 font-semibold text-xl',
          content: 'text-gray-700 text-base',
          confirmButton: 'btn btn-error bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-md'
        },
        allowOutsideClick: false,
        allowEscapeKey: false
      }).then(() => {
        navigate("/login");
      });
      return;
    }
    
    setToken(tokenParam);
    validateToken(tokenParam);
  }, [searchParams, navigate, authLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/password-setup/setup/", {
        token,
        password: formData.password,
        confirm_password: formData.confirmPassword,
      });
      
      // Show success SweetAlert with DaisyUI styling
      Swal.fire({
        title: 'Success!',
        text: 'Password set successfully! You can now login.',
        icon: 'success',
        confirmButtonText: 'Go to Login',
        confirmButtonColor: '#10b981',
        background: '#ffffff',
        color: '#1f2937',
        customClass: {
          popup: 'rounded-lg shadow-lg bg-white border border-gray-200',
          title: 'text-green-600 font-semibold text-xl',
          content: 'text-gray-700 text-base',
          confirmButton: 'btn btn-success bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md'
        },
        allowOutsideClick: false,
        allowEscapeKey: false
      }).then(() => {
        navigate("/login");
      });
    } catch (error) {
      console.error("Password setup error:", error);
      
      let errorMessage = "Failed to set password";
      let errorTitle = "Setup Failed";
      
      if (error.response?.status === 400) {
        errorMessage = error.response.data?.error || "Invalid or expired setup token";
        errorTitle = "Token Expired";
      } else if (error.response?.status === 500) {
        errorMessage = "Server error occurred. Please try again later.";
        errorTitle = "Server Error";
      }
      
      // Show SweetAlert for setup error with DaisyUI styling
      Swal.fire({
        title: errorTitle,
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'Go to Login',
        confirmButtonColor: '#ef4444',
        background: '#ffffff',
        color: '#1f2937',
        customClass: {
          popup: 'rounded-lg shadow-lg bg-white border border-gray-200',
          title: 'text-red-600 font-semibold text-xl',
          content: 'text-gray-700 text-base',
          confirmButton: 'btn btn-error bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-md'
        },
        allowOutsideClick: false,
        allowEscapeKey: false
      }).then(() => {
        navigate("/login");
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Show loading state while AuthContext is loading or validating token
  if (authLoading || tokenValidating) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary">
            <Lock className="h-6 w-6 text-primary-content" />
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-base-content">
              {authLoading ? 'Loading...' : 'Validating Setup Link'}
            </h2>
            <p className="mt-2 text-sm text-base-content/70">
              {authLoading ? 'Please wait...' : 'Please wait while we verify your setup link...'}
            </p>
          </div>
          <div className="flex justify-center">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        </div>
      </div>
    );
  }

  // Don't show form if token is invalid
  if (!tokenValid) {
    return null;
  }

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary">
            <Lock className="h-6 w-6 text-primary-content" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-base-content">
            Set Your Password
          </h2>
          <p className="mt-2 text-center text-sm text-base-content/70">
            Please set a password for your account to continue
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-base-content">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="input input-bordered w-full pr-10"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-base-content/50" />
                  ) : (
                    <Eye className="h-4 w-4 text-base-content/50" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-base-content">
                Confirm Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  className="input input-bordered w-full pr-10"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-base-content/50" />
                  ) : (
                    <Eye className="h-4 w-4 text-base-content/50" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Setting Password...
                </>
              ) : (
                "Set Password"
              )}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              className="btn btn-link"
              onClick={() => navigate("/login")}
            >
              Back to Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SetupPasswordPage;

