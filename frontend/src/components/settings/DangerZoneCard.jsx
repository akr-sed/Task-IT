import React from 'react';
import { AlertTriangle, Trash2, Download } from 'lucide-react';

const DangerZoneCard = ({ saving, onRequestAccountDeletion }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-red-200 p-6 hover:shadow-xl transition-shadow lg:col-span-2">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E31B54] to-[#E91E63] flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Danger Zone</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border-2 border-red-200 rounded-xl p-5 bg-red-50 hover:bg-red-100 transition-colors">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Account</h3>
              <p className="text-sm text-gray-600 mb-4">
                Permanently delete your account. This cannot be undone.
              </p>
              <button
                type="button"
                onClick={onRequestAccountDeletion}
                disabled={saving}
                className="px-5 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {saving ? 'Processing...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
        
        <div className="border-2 border-orange-200 rounded-xl p-5 bg-orange-50 hover:bg-orange-100 transition-colors">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Download className="w-6 h-6 text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Export Data</h3>
              <p className="text-sm text-gray-600 mb-4">
                Download all your projects, tasks, and account information.
              </p>
              <button
                type="button"
                className="px-5 py-2.5 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 hover:shadow-lg transition-all text-sm"
              >
                Export Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DangerZoneCard;
