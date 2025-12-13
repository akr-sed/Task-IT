import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authService } from '../../api';
import background from '../../assets/images/Frame14main.svg';
import taskit from '../../assets/icons/task-it.svg';
import { XCircle, Eye, EyeOff, Loader2 } from "lucide-react";

function LoginForm() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Check for message from navigation state (used for invitation redirects)
  const stateMessage = location.state?.message;
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await authService.login({ email, password });

      // Store token in localStorage
      localStorage.setItem("token", data.token);

      // Store basic user info in localStorage
      localStorage.setItem("user", JSON.stringify(data.user));

      sessionStorage.setItem("justLoggedIn", "true");

      const redirectUrl = localStorage.getItem("redirectAfterLogin");
      if (redirectUrl) {
        localStorage.removeItem("redirectAfterLogin");
        navigate(redirectUrl);
      } else {
        // Redirect to dashboard
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.message || err.response?.data?.error || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex flex-row-reverse min-h-screen overflow-hidden relative'>
      {/* Background image with blur - hidden on mobile, visible on desktop */}
      <div className="hidden lg:block fixed inset-0 w-full h-full z-0">
        <img
          src={background}
          className="w-full h-full object-cover blur-sm"
          alt="Background"
          style={{ filter: 'blur(10px)' }}
        />
        
        {/* Hero Text Overlay on Background - Only in the left 68% area */}
        <div className="absolute inset-0 right-[32%] flex items-center justify-center z-10 px-12">
          <div className="max-w-2xl text-center space-y-6">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-2xl">
                <img src={taskit} alt="Task IT" className="h-16 w-auto" />
              </div>
            </div>
            
            {/* Heading */}
            <h1 className="text-5xl font-bold text-gray-800 leading-tight">
              Organize All Your Tasks
              <span className="block text-[#E31B54] mt-2">In One Place</span>
            </h1>
            
            {/* Subheading */}
            <p className="text-xl text-gray-700 leading-relaxed max-w-xl mx-auto">
              Streamline your workflow, collaborate with your team, and get more done with Task IT
            </p>
            
            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3 justify-center mt-8">
              <div className="bg-white/80 backdrop-blur-sm px-5 py-2 rounded-full shadow-md">
                <span className="text-sm font-medium text-gray-700">📋 Project Management</span>
              </div>
              <div className="bg-white/80 backdrop-blur-sm px-5 py-2 rounded-full shadow-md">
                <span className="text-sm font-medium text-gray-700">👥 Team Collaboration</span>
              </div>
              <div className="bg-white/80 backdrop-blur-sm px-5 py-2 rounded-full shadow-md">
                <span className="text-sm font-medium text-gray-700">⚡ Real-time Updates</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Login Form Container */}
      <div className='flex flex-col relative w-full lg:w-[32%] min-h-screen z-10 lg:bg-opacity-95 p-4 sm:p-6 lg:p-8 '>
        <div className='bg-white rounded-[45px] px-6 sm:px-8 py-8 flex flex-col items-center h-full w-full gap-6 justify-center shadow-2xl'>

          {/* Logo and Welcome Text */}
          <div className='flex flex-col items-center gap-2'>
            <p className='text-[#828484] text-sm'>welcome to</p>
            <img src={taskit} alt="Task IT" className="h-8 sm:h-10" />
          </div>

          {/* Invitation Info Message */}
          {stateMessage && (
            <div className="w-full p-3 bg-[#E31B54]/10 border-l-4 border-[#E31B54] rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-[#E31B54]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="ml-2 text-sm text-[#E31B54] font-medium">{stateMessage}</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="w-full p-3 bg-red-50 border-l-4 border-red-500 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <XCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className='flex flex-col gap-5 w-full'>
            {/* Email Address */}
            <div className='flex flex-col gap-2'>
              <label htmlFor="email" className="text-[#E31B54] font-medium text-sm ml-4">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-2 border-[#D9D9D9] rounded-[15px] w-full h-[50px] px-4 focus:border-[#E31B54] focus:outline-none text-[#333333] text-sm transition-colors"
                placeholder="Enter your email"
              />
            </div>

            {/* Password */}
            <div className='flex flex-col gap-2'>
              <label htmlFor="password" className="text-[#E31B54] font-medium text-sm ml-4">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-2 border-[#D9D9D9] rounded-[15px] w-full h-[50px] px-4 pr-12 focus:border-[#E31B54] focus:outline-none text-[#333333] text-sm transition-colors"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#E31B54] transition-colors"
                >
                  {showPassword ? (
                    <Eye className="w-5 h-5" />
                  ) : (
                    <EyeOff className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className='flex flex-row gap-2 items-center ml-4'>
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 accent-[#E31B54] bg-gray-100 border-2 border-gray-300 rounded focus:ring-[#E31B54] cursor-pointer"
              />
              <label htmlFor="remember-me" className='text-[#E31B54] text-sm cursor-pointer select-none'>
                Remember my information's
              </label>
            </div>

            {/* Buttons */}
            <div className='flex flex-col w-full gap-4 items-center mt-6'>
              {/* Log in Button - Filled Pink */}
              <button
                type="submit"
                disabled={loading}
                className='w-full sm:w-4/5 h-[50px] bg-gradient-to-r from-[#E31B54] to-[#E91E63] text-white font-semibold rounded-full hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
              >
                {loading ? (
                  <span className='flex items-center justify-center'>
                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                    Logging in...
                  </span>
                ) : (
                  'Log in'
                )}
              </button>

              {/* Sign up Button - Outlined Pink */}
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className='w-full sm:w-4/5 h-[50px] border-2 border-[#E31B54] text-[#E31B54] font-semibold rounded-full hover:bg-[#E31B54] hover:text-white hover:shadow-lg hover:scale-[1.02] transition-all'
              >
                Sign up
              </button>

              {/* Forgot Password Link */}
              <button
                type="button"
                onClick={() => navigate('/reset-password')}
                className='text-[#E31B54] text-sm font-medium cursor-pointer hover:underline transition-all mt-2'
              >
                Forgot your password ?
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}

export default LoginForm;