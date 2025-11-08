import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import taskit from '../../assets/icons/task-it.svg';

const PasswordResetFlow = () => {
  // Verification step states
  const [email, setEmail] = useState("");
  const [resetCode, setResetCode] = useState(["", "", "", "", "", ""]);
  const [userId, setUserId] = useState("");
  const [resetToken, setResetToken] = useState("");

  // Password reset step states
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // UI states
  const [currentStep, setCurrentStep] = useState("verify"); // 'verify' or 'reset'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get("email");
    if (emailParam) setEmail(emailParam);
  }, [location]);

  // Timer for resend button
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (resendSuccess) {
      setResendSuccess(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendTimer, resendSuccess]);

  // Code input handlers
  const handleCodeChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...resetCode];
    newCode[index] = value;
    setResetCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyDown = (index, e) => {
    if (e.key === "Backspace" && !resetCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleCodePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6).split("");
    const newCode = [...resetCode];
    
    pastedData.forEach((char, index) => {
      if (/^\d$/.test(char) && index < 6) {
        newCode[index] = char;
      }
    });
    
    setResetCode(newCode);
    const nextEmptyIndex = newCode.findIndex((code) => !code);
    if (nextEmptyIndex !== -1) {
      inputRefs.current[nextEmptyIndex]?.focus();
    } else {
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    const code = resetCode.join("");
    
    if (code.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/reset-password/verify",
        { email, resetCode: code }
      );

      setUserId(response.data.userId);
      setResetToken(response.data.resetToken);
      setMessage("Code verified successfully! You can now set your new password.");
      
      setTimeout(() => {
        setCurrentStep("reset");
        setMessage("");
      }, 1500);
    } catch (err) {
      console.error("Verification error:", err);
      setError(err.response?.data?.message || "Failed to verify reset code");
      setResetCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendTimer > 0) return;

    setResendLoading(true);
    setError("");

    try {
      await axios.post("http://localhost:5000/api/auth/reset-password", { email });
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
      setMessage("A new verification code has been sent to your email");
      setResendTimer(60);
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend verification code");
    } finally {
      setResendLoading(false);
    }
  };

  const getPasswordStrength = () => {
    const password = newPassword;
    if (password.length === 0) return { strength: 0, label: "", color: "" };
    if (password.length < 6) return { strength: 1, label: "Weak", color: "bg-red-500" };
    if (password.length < 10) return { strength: 2, label: "Fair", color: "bg-yellow-500" };
    if (password.length < 12) return { strength: 3, label: "Good", color: "bg-blue-500" };
    return { strength: 4, label: "Strong", color: "bg-green-500" };
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const deviceInfo = {
        deviceId: localStorage.getItem("deviceId") || (() => {
          const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
          localStorage.setItem("deviceId", id);
          return id;
        })(),
        deviceName: navigator.userAgentData?.brands?.[0]?.brand || navigator.userAgent,
        deviceOsVersion: navigator.userAgentData?.platform || navigator.platform || "Unknown OS",
      };

      const response = await axios.post(
        "http://localhost:5000/api/auth/reset-password/new",
        { userId, resetToken, newPassword },
        {
          headers: {
            "X-Device-Id": deviceInfo.deviceId,
            "X-Device-Name": deviceInfo.deviceName,
            "X-Device-OsVersion": deviceInfo.deviceOsVersion,
          },
        }
      );

      if (response.data.token && response.data.user) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        setMessage("Password reset successful! You will be logged in automatically.");
        
        setTimeout(() => {
          navigate("/dashboard", {
            state: { message: "Password reset successful! You are now logged in." },
          });
        }, 1500);
      } else {
        setMessage("Password reset successful! Please log in with your new password.");
        setTimeout(() => navigate("/login"), 1500);
      }
    } catch (err) {
      console.error("Password reset error:", err);
      setError(err.response?.data?.message || "Failed to set new password");
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className='min-h-screen bg-gradient-to-br from-[#FFF5F8] via-white to-[#FFF0F5] flex items-center justify-center p-4 relative overflow-hidden'>
      {/* Decorative Background */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#E31B54] rounded-full opacity-5 blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#E91E63] rounded-full opacity-5 blur-3xl"></div>

      {/* Main Card */}
      <div className='w-full max-w-md z-10'>
        <div className='bg-white rounded-[45px] p-8 sm:p-12 shadow-2xl border-2 border-[#E31B54]/10 relative'>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-3">
              {/* Step 1 */}
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  currentStep === "verify" 
                    ? "bg-gradient-to-br from-[#E31B54] to-[#E91E63] shadow-lg" 
                    : "bg-green-500"
                }`}>
                  {currentStep === "reset" ? (
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span className="text-white font-bold">1</span>
                  )}
                </div>
                <span className={`text-xs mt-2 font-medium ${currentStep === "verify" ? "text-[#E31B54]" : "text-green-500"}`}>
                  Verify
                </span>
              </div>

              {/* Connector Line */}
              <div className={`w-16 h-1 rounded-full transition-all ${
                currentStep === "reset" ? "bg-green-500" : "bg-gray-200"
              }`}></div>

              {/* Step 2 */}
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  currentStep === "reset" 
                    ? "bg-gradient-to-br from-[#E31B54] to-[#E91E63] shadow-lg" 
                    : "bg-gray-200"
                }`}>
                  <span className={`font-bold ${currentStep === "reset" ? "text-white" : "text-gray-400"}`}>2</span>
                </div>
                <span className={`text-xs mt-2 font-medium ${currentStep === "reset" ? "text-[#E31B54]" : "text-gray-400"}`}>
                  Reset
                </span>
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img src={taskit} alt="Task IT" className="h-8" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {currentStep === "verify" ? "Verify Reset Code" : "Create New Password"}
            </h2>
            <p className="text-gray-600 text-sm">
              {currentStep === "verify" 
                ? "Enter the code we sent to your email" 
                : "Choose a strong password for your account"}
            </p>
          </div>

          {/* Messages */}
          {resendSuccess && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg animate-slideDown">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-green-700 font-medium">New code sent successfully!</p>
              </div>
            </div>
          )}

          {message && !resendSuccess && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg animate-slideDown">
              <p className="text-sm text-green-700 font-medium">{message}</p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg animate-shake">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Forms */}
          {currentStep === "verify" ? (
            <form onSubmit={handleVerifyCode} className="space-y-6">
              {/* Email (Read-only) */}
              <div>
                <label className="block text-[#E31B54] font-semibold text-sm mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    readOnly
                    className="border-2 border-[#D9D9D9] bg-gray-50 rounded-[15px] w-full h-[55px] px-4 text-[#333333] text-sm"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Code Input */}
              <div>
                <label className="block text-center text-[#E31B54] font-semibold text-sm mb-4">
                  Verification Code
                </label>
                <div className="flex gap-2 sm:gap-3 justify-center" onPaste={handleCodePaste}>
                  {resetCode.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleCodeKeyDown(index, e)}
                      className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold border-2 border-[#D9D9D9] rounded-[15px] focus:border-[#E31B54] focus:outline-none transition-all"
                      autoFocus={index === 0}
                    />
                  ))}
                </div>
              </div>

              {/* Verify Button */}
              <button
                type="submit"
                disabled={loading || resetCode.join("").length !== 6}
                className='w-full h-[55px] bg-gradient-to-r from-[#E31B54] to-[#E91E63] text-white font-bold rounded-full hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg'
              >
                {loading ? (
                  <span className='flex items-center justify-center'>
                    <svg className="animate-spin mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </span>
                ) : (
                  'Verify Code'
                )}
              </button>

              {/* Resend */}
              <div className="text-center pt-4">
                {resendTimer > 0 ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-8 h-8 rounded-full border-2 border-[#E31B54]/30 flex items-center justify-center">
                      <span className="text-sm font-semibold text-[#E31B54]">{resendTimer}</span>
                    </div>
                    <span className="text-sm text-gray-500">seconds until resend</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={resendLoading}
                    className="text-[#E31B54] font-semibold hover:underline disabled:opacity-50"
                  >
                    {resendLoading ? "Sending..." : "Resend Code"}
                  </button>
                )}
              </div>
            </form>
          ) : (
            <form onSubmit={handlePasswordReset} className="space-y-5">
              {/* New Password */}
              <div>
                <label className="block text-[#E31B54] font-semibold text-sm mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                    className="border-2 border-[#D9D9D9] rounded-[15px] w-full h-[55px] px-4 pr-12 focus:border-[#E31B54] focus:outline-none text-[#333333] transition-all"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#E31B54]"
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
                {/* Password Strength */}
                {newPassword && (
                  <div className="mt-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1.5 flex-1 rounded-full transition-all ${
                            level <= passwordStrength.strength ? passwordStrength.color : 'bg-gray-200'
                          }`}
                        ></div>
                      ))}
                    </div>
                    <p className={`text-xs mt-1 font-medium ${
                      passwordStrength.strength === 1 ? 'text-red-500' :
                      passwordStrength.strength === 2 ? 'text-yellow-500' :
                      passwordStrength.strength === 3 ? 'text-blue-500' : 'text-green-500'
                    }`}>
                      {passwordStrength.label}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-[#E31B54] font-semibold text-sm mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="border-2 border-[#D9D9D9] rounded-[15px] w-full h-[55px] px-4 pr-12 focus:border-[#E31B54] focus:outline-none text-[#333333] transition-all"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#E31B54]"
                  >
                    {showConfirmPassword ? (
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
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">Passwords don't match</p>
                )}
                {confirmPassword && newPassword === confirmPassword && (
                  <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Passwords match
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || newPassword !== confirmPassword}
                className='w-full h-[55px] bg-gradient-to-r from-[#E31B54] to-[#E91E63] text-white font-bold rounded-full hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg mt-6'
              >
                {loading ? (
                  <span className='flex items-center justify-center'>
                    <svg className="animate-spin mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Resetting...
                  </span>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
          )}

          {/* Back to Login */}
          <div className="text-center mt-6 pt-6 border-t border-gray-100">
            <button
              onClick={() => navigate('/login')}
              className="text-gray-600 hover:text-[#E31B54] font-medium text-sm transition-colors flex items-center justify-center gap-2 mx-auto"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Login
            </button>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-slideDown { animation: slideDown 0.3s ease-out; }
        .animate-shake { animation: shake 0.3s ease-in-out; }
      `}</style>
    </div>
  );
};

export default PasswordResetFlow;

