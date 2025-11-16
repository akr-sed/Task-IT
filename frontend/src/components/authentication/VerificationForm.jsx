import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { authService } from '../../api';
import taskit from '../../assets/icons/task-it.svg';

const VerificationForm = () => {
  const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef([]);
  const location = useLocation();
  const navigate = useNavigate();
  const tempUserId = new URLSearchParams(location.search).get("id");

  useEffect(() => {
    if (!tempUserId) {
      navigate("/signup");
    }
  }, [tempUserId, navigate]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0 && !canResend) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCanResend(true);
    }
  }, [countdown, canResend]);

  const handleInputChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6).split("");
    const newCode = [...verificationCode];
    
    pastedData.forEach((char, index) => {
      if (/^\d$/.test(char) && index < 6) {
        newCode[index] = char;
      }
    });
    
    setVerificationCode(newCode);
    
    // Focus the next empty input or last input
    const nextEmptyIndex = newCode.findIndex((code) => !code);
    if (nextEmptyIndex !== -1) {
      inputRefs.current[nextEmptyIndex]?.focus();
    } else {
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const code = verificationCode.join("");
    
    if (code.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await authService.verifyEmail({
        tempUserId,
        verificationCode: code,
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/dashboard", {
        state: { message: "Email verified successfully! Welcome to Task IT." },
      });
    } catch (error) {
      setError(error.response?.data?.message || error.response?.data?.error || "Verification failed. Please try again.");
      setVerificationCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend) return;
    
    setResendLoading(true);
    setResendSuccess(false);
    setError("");

    try {
      await authService.resendVerificationCode(tempUserId);
      setResendSuccess(true);
      setCountdown(60);
      setCanResend(false);
      
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (error) {
      setError(error.response?.data?.message || error.response?.data?.error || "Failed to resend verification code");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-[#FFF5F8] via-white to-[#FFF0F5] flex items-center justify-center p-4 relative overflow-hidden'>
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#E31B54] rounded-full opacity-5 blur-3xl translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#E91E63] rounded-full opacity-5 blur-3xl -translate-x-1/2 translate-y-1/2"></div>

      {/* Main Card */}
      <div className='w-full max-w-lg z-10'>
        <div className='bg-white rounded-[45px] p-8 sm:p-12 shadow-2xl border-2 border-[#E31B54]/10'>
          
          {/* Header */}
          <div className="text-center mb-8">
            {/* Email Icon with Animation */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-[#E31B54] to-[#E91E63] rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                {/* Pulse effect */}
                <div className="absolute inset-0 w-20 h-20 bg-[#E31B54] rounded-full animate-ping opacity-20"></div>
              </div>
            </div>

            {/* Logo */}
            <div className="flex justify-center mb-4">
              <img src={taskit} alt="Task IT" className="h-8" />
            </div>

            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Verify Your Email
            </h2>
            <p className="text-gray-600">
              We've sent a 6-digit code to your email.
              <br />
              Enter it below to verify your account.
            </p>
          </div>

          {/* Success Message */}
          {resendSuccess && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg animate-slideDown">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-green-700 font-medium">
                  New code sent! Check your inbox.
                </p>
              </div>
            </div>
          )}

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

          {/* Verification Code Inputs */}
          <form onSubmit={handleVerify} className="space-y-8">
            <div>
              <label className="block text-center text-[#E31B54] font-semibold text-sm mb-4">
                Enter Verification Code
              </label>
              
              {/* Code Input Boxes */}
              <div className="flex gap-2 sm:gap-3 justify-center" onPaste={handlePaste}>
                {verificationCode.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold border-2 border-[#D9D9D9] rounded-[15px] focus:border-[#E31B54] focus:outline-none transition-all hover:border-[#E31B54]/50 text-gray-800"
                    autoFocus={index === 0}
                  />
                ))}
              </div>

              <p className="text-xs text-gray-500 text-center mt-4">
                💡 Tip: You can paste the entire code
              </p>
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              disabled={loading || verificationCode.join("").length !== 6}
              className='w-full h-[55px] bg-gradient-to-r from-[#E31B54] to-[#E91E63] text-white font-bold rounded-full hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-lg'
            >
              {loading ? (
                <span className='flex items-center justify-center'>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </span>
              ) : (
                'Verify Email'
              )}
            </button>
          </form>

          {/* Resend Section */}
          <div className="mt-8 pt-6 border-t-2 border-gray-100">
            <div className="text-center space-y-3">
              <p className="text-sm text-gray-600">
                Didn't receive the code?
              </p>
              
              {canResend ? (
                <button
                  onClick={handleResendCode}
                  disabled={resendLoading}
                  className="text-[#E31B54] font-semibold hover:underline disabled:opacity-50 transition-all"
                >
                  {resendLoading ? "Sending..." : "Resend Code"}
                </button>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-8 h-8 rounded-full border-2 border-[#E31B54]/30 flex items-center justify-center">
                    <span className="text-sm font-semibold text-[#E31B54]">
                      {countdown}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    seconds until you can resend
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Having trouble?{" "}
              <button 
                onClick={() => navigate('/login')}
                className="text-[#E31B54] font-medium hover:underline"
              >
                Back to Login
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Add custom animations */}
      <style jsx>{`
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
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
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

export default VerificationForm;