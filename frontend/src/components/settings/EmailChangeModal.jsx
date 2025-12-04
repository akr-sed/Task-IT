import React from 'react';
import { X } from 'lucide-react';

const EmailChangeModal = ({
  show,
  step,
  emailChangeData,
  setEmailChangeData,
  saving,
  onClose,
  onSendCode,
  onVerify
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slide-down">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            {step === 1 ? 'Change Email Address' : 'Verify Email Change'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {step === 1 && (
          <form onSubmit={onSendCode} className="space-y-5">
            <div>
              <p className="text-gray-600 mb-4">
                Enter your new email address. We'll send a verification code to confirm the change.
              </p>
              <label htmlFor="newEmail" className="block text-sm font-semibold text-gray-700 mb-2">
                New Email Address
              </label>
              <input
                type="email"
                id="newEmail"
                value={emailChangeData.newEmail}
                onChange={(e) => setEmailChangeData({ ...emailChangeData, newEmail: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#E31B54] focus:outline-none transition-colors"
                placeholder="Enter new email address"
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#E31B54] to-[#E91E63] text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Sending...' : 'Send Code'}
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={onVerify} className="space-y-5">
            <div>
              <p className="text-gray-600 mb-4">
                We've sent a verification code to <strong>{emailChangeData.newEmail}</strong>. 
                Please check your email and enter the code below.
              </p>
              <label htmlFor="verificationCode" className="block text-sm font-semibold text-gray-700 mb-2">
                Verification Code
              </label>
              <input
                type="text"
                id="verificationCode"
                value={emailChangeData.verificationCode}
                onChange={(e) => setEmailChangeData({ ...emailChangeData, verificationCode: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#E31B54] focus:outline-none transition-colors text-center text-2xl font-mono tracking-widest"
                placeholder="000000"
                maxLength={6}
                required
              />
              <p className="mt-2 text-xs text-gray-500">Code expires in 10 minutes</p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || emailChangeData.verificationCode.length !== 6}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-[#E31B54] to-[#E91E63] text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Verifying...' : 'Verify'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EmailChangeModal;
