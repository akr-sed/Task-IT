import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';

const PreferencesCard = () => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
          <SettingsIcon className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Preferences</h2>
      </div>
      
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Theme</label>
          <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#E31B54] focus:outline-none transition-colors cursor-pointer">
            <option>Light Mode</option>
            <option>Dark Mode (Coming Soon)</option>
            <option>Auto (System)</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Date Format</label>
          <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#E31B54] focus:outline-none transition-colors cursor-pointer">
            <option>MM/DD/YYYY</option>
            <option>DD/MM/YYYY</option>
            <option>YYYY-MM-DD</option>
          </select>
        </div>
        
        <div className="flex justify-end pt-2">
          <button
            type="button"
            className="px-6 py-3 bg-gradient-to-r from-[#E31B54] to-[#E91E63] text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreferencesCard;
