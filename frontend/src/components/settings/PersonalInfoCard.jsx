import React from 'react';
import { User } from 'lucide-react';

const PersonalInfoCard = ({ 
  profileData, 
  setProfileData, 
  saving, 
  onSubmit, 
  onRequestEmailChange 
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E31B54] to-[#E91E63] flex items-center justify-center">
          <User className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
      </div>
      
      <form onSubmit={onSubmit} className="flex flex-col flex-1">
        <div className="space-y-5 flex-1">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={profileData.name}
              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#E31B54] focus:outline-none transition-colors"
              placeholder="Enter your full name"
              required
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                value={profileData.email}
                readOnly
                className="w-full px-4 py-3 pr-28 border-2 border-gray-200 bg-gray-50 rounded-xl focus:outline-none transition-colors text-gray-600 pointer-events-none"
                placeholder="Enter your email"
              />
              <button
                type="button"
                onClick={onRequestEmailChange}
                disabled={saving}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gradient-to-tr from-[#E31B54] to-[#E91E63] text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed pointer-events-auto"
              >
                Change
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Click "Change" to update your email (requires verification)
            </p>
          </div>
        </div>
        
        <div className="flex justify-end pt-5 mt-5 border-t border-gray-100">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-gradient-to-r from-[#E31B54] to-[#E91E63] text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PersonalInfoCard;
