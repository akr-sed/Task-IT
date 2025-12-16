import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from '../../api';
import taskit from "../../assets/icons/task-it.svg";
import { Mail,Brain, Lock, Key, CheckCircle, XCircle, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';

const RequestPasswordResetForm = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const data = await authService.requestPasswordReset(email);
      setMessage(data.message);

      // Navigate to verification page after short delay
      setTimeout(() => {
        navigate(`/verify-reset?email=${encodeURIComponent(email)}`);
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.message || err.response?.data?.error || "Failed to request password reset"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF5F8] via-white to-[#FFF0F5] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-[#E31B54] rounded-full opacity-5 blur-3xl"></div>
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-[#E91E63] rounded-full opacity-5 blur-3xl"></div>

      {/* Floating Icons */}
      <div className="absolute top-20 left-20 opacity-10">
        <Mail className="w-16 h-16 text-[#E31B54] animate-float" fill="currentColor" />
      </div>
      <div className="absolute bottom-20 right-20 opacity-10">
        <Lock className="w-20 h-20 text-[#E91E63] animate-float-delayed" fill="currentColor" />
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md z-10">
        <div className="bg-white rounded-[45px] p-8 sm:p-12 shadow-2xl border-2 border-[#E31B54]/10 relative overflow-hidden">
          {/* Decorative corner accent */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#E31B54]/10 to-transparent rounded-bl-full"></div>

          {/* Header Section */}
          <div className="text-center mb-8 relative z-10">
            {/* Lock Icon with Key */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-[#E31B54] to-[#E91E63] rounded-full flex items-center justify-center transform hover:rotate-12 transition-transform duration-300">
                  <Key className="w-10 h-10 text-white" />
                </div>
                {/* Animated ring */}
                <div className="absolute inset-0 w-20 h-20 border-2 border-[#E31B54] rounded-full animate-ping opacity-20"></div>
              </div>
            </div>

            {/* Logo */}
            <div className="flex justify-center mb-4">
              <img src={taskit} alt="Task IT" className="h-8" />
            </div>

            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Forgot Password?
            </h2>
            <p className="text-gray-600 text-sm">
              No worries! Enter your email and we'll send you a reset code.
            </p>
          </div>

          {/* Success Message */}
          {message && (
            <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-500 rounded-lg animate-slideDown">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-green-500" fill="currentColor" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-700">
                    {message}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Redirecting you...
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg animate-shake">
              <div className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-[#E31B54] font-semibold text-sm mb-2"
              >
                Email Address
              </label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#E31B54] transition-colors">
                  <Mail className="w-5 h-5" />
                </span>
                <input
                  type="email"
                  id="email"
                  name="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-2 border-[#D9D9D9] rounded-[15px] w-full h-[55px] pl-12 pr-4 focus:border-[#E31B54] focus:outline-none text-[#333333] transition-all hover:border-[#E31B54]/50"
                  placeholder="you@example.com"
                />
              </div>
              <p className="text-xs flex justify-start gap-2 items-center text-gray-500 mt-2 ml-1">
                <Brain size={18} color="#E31B54"/> We'll send a 6-digit code to this email
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[55px] bg-gradient-to-r from-[#E31B54] to-[#E91E63] text-white font-bold rounded-full hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-lg relative overflow-hidden group"
            >
              {/* Button shine effect */}
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -skew-x-12 group-hover:translate-x-full transition-all duration-700"></span>

              {loading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                  Sending code...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Send Reset Code
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-gray-100"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">OR</span>
            </div>
          </div>

          {/* Back to Login */}
          <div className="text-center space-y-4">
            <button
              onClick={() => navigate("/login")}
              className="group flex items-center justify-center gap-2 w-full text-gray-600 hover:text-[#E31B54] font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Remember your password? Log in
            </button>

            <p className="text-xs text-gray-500">
              Need help?{" "}
              <button className="text-[#E31B54] font-medium hover:underline">
                Contact Support
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes float-delayed {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-15px) rotate(5deg);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }

        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default RequestPasswordResetForm;
