import React from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

const SecurityCard = ({ 
  passwordData, 
  setPasswordData, 
  showPasswordFields, 
  setShowPasswordFields, 
  saving, 
  onSubmit 
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E31B54] to-[#E91E63] flex items-center justify-center">
          <Lock className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Security</h2>
      </div>
      
      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label htmlFor="currentPassword" className="block text-sm font-semibold text-gray-700 mb-2">
            Current Password
          </label>
          <div className="relative">
            <input
              type={showPasswordFields ? "text" : "password"}
              id="currentPassword"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#E31B54] focus:outline-none transition-colors"
              placeholder="Enter current password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPasswordFields(!showPasswordFields)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPasswordFields ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
        
        <div>
          <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-700 mb-2">
            New Password
          </label>
          <input
            type={showPasswordFields ? "text" : "password"}
            id="newPassword"
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#E31B54] focus:outline-none transition-colors"
            placeholder="Enter new password"
            required
            minLength={8}
          />
          <p className="mt-2 text-xs text-gray-500">At least 8 characters</p>
        </div>
        
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
            Confirm Password
          </label>
          <input
            type={showPasswordFields ? "text" : "password"}
            id="confirmPassword"
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#E31B54] focus:outline-none transition-colors"
            placeholder="Confirm new password"
            required
          />
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-gradient-to-r from-[#E31B54] to-[#E91E63] text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SecurityCard;
