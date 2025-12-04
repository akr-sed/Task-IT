import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const AccountDeletionModal = ({
  show,
  user,
  verificationCode,
  setVerificationCode,
  saving,
  onClose,
  onSubmit
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slide-down">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-red-600">Confirm Account Deletion</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-800">
                <p className="font-semibold mb-1">Warning: This action cannot be undone!</p>
                <p>All your data including projects, tasks, and account information will be permanently deleted.</p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-gray-600 mb-4">
              We've sent a verification code to <strong>{user?.email}</strong>. 
              Please check your email and enter the code below to confirm deletion.
            </p>
            <label htmlFor="deleteCode" className="block text-sm font-semibold text-gray-700 mb-2">
              Verification Code
            </label>
            <input
              type="text"
              id="deleteCode"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-colors text-center text-2xl font-mono tracking-widest"
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
              disabled={saving || verificationCode.length !== 6}
              className="flex-1 px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Deleting...' : 'Delete Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountDeletionModal;
