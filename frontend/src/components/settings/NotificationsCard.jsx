import React from 'react';
import { Bell } from 'lucide-react';

const NotificationsCard = ({ notifications, onToggle }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E31B54] to-[#E91E63] flex items-center justify-center">
          <Bell className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
      </div>
      
      <div className="space-y-4">
        <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors group">
          <div>
            <p className="font-medium text-gray-900 group-hover:text-[#E31B54] transition-colors">
              Email Notifications
            </p>
            <p className="text-sm text-gray-500">Updates about your projects</p>
          </div>
          <input
            type="checkbox"
            checked={notifications.email}
            onChange={() => onToggle('email')}
            className="w-5 h-5 accent-[#E31B54] rounded cursor-pointer"
          />
        </label>
        
        <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors group">
          <div>
            <p className="font-medium text-gray-900 group-hover:text-[#E31B54] transition-colors">
              Task Reminders
            </p>
            <p className="text-sm text-gray-500">Upcoming task deadlines</p>
          </div>
          <input
            type="checkbox"
            checked={notifications.tasks}
            onChange={() => onToggle('tasks')}
            className="w-5 h-5 accent-[#E31B54] rounded cursor-pointer"
          />
        </label>
        
        <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors group">
          <div>
            <p className="font-medium text-gray-900 group-hover:text-[#E31B54] transition-colors">
              Team Updates
            </p>
            <p className="text-sm text-gray-500">Member activity notifications</p>
          </div>
          <input
            type="checkbox"
            checked={notifications.team}
            onChange={() => onToggle('team')}
            className="w-5 h-5 accent-[#E31B54] rounded cursor-pointer"
          />
        </label>
      </div>
    </div>
  );
};

export default NotificationsCard;
