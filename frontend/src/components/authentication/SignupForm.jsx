import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import taskit from '../../assets/icons/task-it.svg';

const SignupForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [tempUserId, setTempUserId] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/signup",
        formData
      );
      setSuccess(true);
      setTempUserId(response.data.tempUser._id);
    } catch (error) {
      setError(
        error.response?.data?.message || "An error occurred during signup"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-[#FFF5F8] via-white to-[#FFF0F5] flex items-center justify-center p-4 relative overflow-hidden'>
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#E31B54] rounded-full opacity-5 blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#E91E63] rounded-full opacity-5 blur-3xl translate-x-1/2 translate-y-1/2"></div>
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-[#E31B54] rounded-full opacity-3 blur-3xl"></div>

      {success ? (
        // Success State - Full Screen Centered
        <div className='w-full max-w-2xl z-10'>
          <div className='bg-white rounded-[45px] p-8 sm:p-12 shadow-2xl border-2 border-[#E31B54]/10'>
            <div className="text-center space-y-6">
              {/* Animated Success Icon */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center animate-pulse">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="absolute inset-0 w-24 h-24 bg-green-400 rounded-full animate-ping opacity-20"></div>
                </div>
              </div>

              {/* Success Content */}
              <div className="space-y-4">
                <h2 className="text-4xl font-bold text-gray-800">
                  Welcome Aboard! 🎉
                </h2>
                <div className="bg-[#FFF5F8] rounded-[20px] p-6 border-2 border-[#E31B54]/20">
                  <p className="text-gray-700 text-lg">
                    We've sent a verification code to
                  </p>
                  <p className="text-[#E31B54] font-bold text-xl mt-2">
                    {formData.email}
                  </p>
                </div>
                <p className="text-gray-600">
                  Check your inbox and verify your account to get started!
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <button
                  onClick={() => navigate(`/verify?id=${tempUserId}`)}
                  className='px-8 py-4 bg-gradient-to-r from-[#E31B54] to-[#E91E63] text-white font-semibold rounded-full hover:shadow-xl hover:scale-105 transition-all text-lg'
                >
                  Verify Now →
                </button>
                <button
                  onClick={() => setSuccess(false)}
                  className='px-8 py-4 border-2 border-[#E31B54] text-[#E31B54] font-semibold rounded-full hover:bg-[#E31B54] hover:text-white transition-all text-lg'
                >
                  Resend Code
                </button>
              </div>

              {/* Help Text */}
              <p className="text-sm text-gray-500 mt-6">
                Didn't receive the email? Check your spam folder or{" "}
                <button className="text-[#E31B54] font-medium hover:underline">
                  contact support
                </button>
              </p>
            </div>
          </div>
        </div>
      ) : (
        // Signup Form - Card Style
        <div className='w-full max-w-5xl z-10'>
          <div className='bg-white rounded-[45px] shadow-2xl overflow-hidden border-2 border-[#E31B54]/10'>
            <div className='grid lg:grid-cols-2'>
              {/* Left Side - Branding & Info */}
              <div className='hidden lg:flex flex-col justify-center p-12 bg-gradient-to-br from-[#E31B54] to-[#E91E63] text-white relative overflow-hidden'>
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
                
                <div className='relative z-10 space-y-8'>
                  {/* Logo */}
                  <div className="bg-white/20 backdrop-blur-sm rounded-[25px] p-6 inline-block">
                    <img src={taskit} alt="Task IT" className="h-12 brightness-0 invert" />
                  </div>

                  {/* Heading */}
                  <div>
                    <h1 className="text-4xl font-bold mb-4">
                      Start Your Journey
                    </h1>
                    <p className="text-white/90 text-lg">
                      Join thousands of teams already using Task IT to streamline their workflow.
                    </p>
                  </div>

                  {/* Features List */}
                  <div className="space-y-4">
                    {[
                      { icon: "⚡", text: "Get started in under 2 minutes" },
                      { icon: "🎯", text: "Organize unlimited projects" },
                      { icon: "👥", text: "Collaborate with your team" },
                      { icon: "📊", text: "Track progress in real-time" }
                    ].map((feature, index) => (
                      <div key={index} className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-[15px] border border-white/20 p-4">
                        <span className="text-2xl">{feature.icon}</span>
                        <span className="text-white/95">{feature.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Side - Form */}
              <div className='p-8 sm:p-12 flex flex-col justify-center'>
                {/* Mobile Logo */}
                <div className="lg:hidden flex justify-center mb-8">
                  <img src={taskit} alt="Task IT" className="h-10" />
                </div>

                {/* Header */}
                <div className='mb-8'>
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">
                    Create Account
                  </h2>
                  <p className="text-gray-600">
                    Fill in your details to get started
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg animate-shake">
                    <div className="flex items-start gap-3">
                      <svg className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className='space-y-5'>
                  {/* Name Input */}
                  <div>
                    <label htmlFor="name" className="block text-[#E31B54] font-semibold text-sm mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </span>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        minLength={3}
                        maxLength={50}
                        className="border-2 border-[#D9D9D9] rounded-[15px] w-full h-[55px] pl-12 pr-4 focus:border-[#E31B54] focus:outline-none text-[#333333] transition-all hover:border-[#E31B54]/50"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  {/* Email Input */}
                  <div>
                    <label htmlFor="email" className="block text-[#E31B54] font-semibold text-sm mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </span>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="border-2 border-[#D9D9D9] rounded-[15px] w-full h-[55px] pl-12 pr-4 focus:border-[#E31B54] focus:outline-none text-[#333333] transition-all hover:border-[#E31B54]/50"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div>
                    <label htmlFor="password" className="block text-[#E31B54] font-semibold text-sm mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        minLength={8}
                        className="border-2 border-[#D9D9D9] rounded-[15px] w-full h-[55px] pl-12 pr-12 focus:border-[#E31B54] focus:outline-none text-[#333333] transition-all hover:border-[#E31B54]/50"
                        placeholder="Min. 8 characters"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#E31B54] transition-colors"
                      >
                        {showPassword ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {/* Password Strength Indicator */}
                    <div className="mt-2 flex gap-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded-full transition-all ${
                            formData.password.length >= level * 2
                              ? formData.password.length >= 12
                                ? 'bg-green-500'
                                : formData.password.length >= 8
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                              : 'bg-gray-200'
                          }`}
                        ></div>
                      ))}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className='w-full h-[55px] bg-gradient-to-r from-[#E31B54] to-[#E91E63] text-white font-bold rounded-full hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-lg mt-6'
                  >
                    {loading ? (
                      <span className='flex items-center justify-center'>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating your account...
                      </span>
                    ) : (
                      'Create Account'
                    )}
                  </button>

                  {/* Login Link */}
                  <p className='text-center text-gray-600 mt-6'>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => navigate('/login')}
                      className='text-[#E31B54] font-semibold hover:underline transition-all'
                    >
                      Log in here
                    </button>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignupForm;

