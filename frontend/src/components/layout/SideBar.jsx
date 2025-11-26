import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import taskit from '../../assets/icons/codesandbox.svg';

const SideBar = ({ isOpen, setIsOpen, currentPath }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Use currentPath prop if provided, otherwise use location.pathname as fallback
  const activePath = currentPath || location.pathname;

  // Menu items configuration
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      path: '/dashboard',
      color: 'from-purple-400 to-purple-600'
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
      path: '/projects',
      color: 'from-blue-400 to-blue-600'
    },
    {
      id: 'tasks',
      label: 'My Tasks',
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
      path: '/tasks',
      color: 'from-green-400 to-green-600'
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      path: '/calendar',
      color: 'from-red-400 to-red-600'
    },
    {
      id: 'team',
      label: 'Team',
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
      path: '/team',
      color: 'from-yellow-400 to-yellow-600'
    },
  ];

  // Check if current path matches menu item
  const isActive = (path) => {
    // Safety check: ensure activePath is defined
    if (!activePath) return false;
    
    if (path === '/dashboard') {
      return activePath === path;
    }
    // For other paths, check if current path starts with the menu path
    return activePath.startsWith(path);
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 shadow-lg transition-all duration-300 z-30 ${
        isOpen ? 'w-64' : 'w-20'
      } ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
    >
      <div className="flex flex-col h-full">
        {/* Logo & Toggle Section */}
        <div className="p-3 mt-5 sm:p-4 border-b border-gray-200">
          <div className="flex items-center justify-center mb-3 sm:mb-4">
            {isOpen && (
              <div onClick={()=>{navigate("/dashboard")}} className="flex items-center gap-2 hover:cursor-pointer sm:gap-3">
                <div  className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#E31B54] to-[#E91E63] rounded-xl flex items-center justify-center p-2">
                  <img src={taskit} alt="TaskIT" className="w-full h-full object-contain brightness-0 invert" />
                </div>
                <span className="font-bold text-lg sm:text-xl bg-gradient-to-r from-[#E31B54] to-[#E91E63] bg-clip-text text-transparent">
                  TASKIT
                </span>
              </div>
            )}
            {!isOpen && (
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#E31B54] to-[#E91E63] rounded-xl flex items-center justify-center p-2 mx-auto">
                <img src={taskit} onClick={()=>{navigate("/dashboard")}} alt="TaskIT" className="w-full hover:cursor-pointer h-full object-contain brightness-0 invert" />
              </div>
            )}
          </div>

          {/* Toggle Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full h-9 sm:h-10 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 flex items-center justify-center transition-all border border-gray-200 group"
            title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <svg
              className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-600 transition-transform duration-300 ${
                isOpen ? 'rotate-0' : 'rotate-180'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            </svg>
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-3 sm:p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.id}
                onClick={() => {
                  navigate(item.path);
                  // Close sidebar on mobile after navigation
                  if (window.innerWidth < 1024) {
                    setIsOpen(false);
                  }
                }}
                className={`w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2.5 sm:py-3 rounded-xl transition-all group relative ${
                  active
                    ? `bg-gradient-to-r ${item.color} text-white shadow-lg scale-105`
                    : 'hover:bg-gray-50 text-gray-700 hover:scale-105'
                }`}
                title={!isOpen ? item.label : ''}
              >
                {/* Active Indicator */}
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 sm:h-8 bg-white rounded-r-full"></div>
                )}

                {/* Icon */}
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                    active
                      ? 'bg-white/20 backdrop-blur-sm'
                      : `bg-gradient-to-br ${item.color} text-white group-hover:scale-110`
                  }`}
                >
                  <svg
                    className={`w-4 h-4 sm:w-5 sm:h-5 ${active ? 'text-white' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={item.icon}
                    />
                  </svg>
                </div>

                {/* Label */}
                {isOpen && (
                  <span
                    className={`font-semibold text-xs sm:text-sm whitespace-nowrap ${
                      active ? 'text-white' : 'text-gray-700'
                    }`}
                  >
                    {item.label}
                  </span>
                )}

                {/* Chevron for active */}
                {active && isOpen && (
                  <svg
                    className="w-3 h-3 sm:w-4 sm:h-4 ml-auto text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Section - Settings */}
        <div className="p-3 sm:p-4 border-t border-gray-200 space-y-2">
          <button
            onClick={() => {
              navigate('/settings');
              // Close sidebar on mobile after navigation
              if (window.innerWidth < 1024) {
                setIsOpen(false);
              }
            }}
            className={`w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2.5 sm:py-3 rounded-xl transition-all hover:bg-gray-50 text-gray-700 hover:scale-105`}
            title={!isOpen ? 'Settings' : ''}
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white flex-shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            {isOpen && <span className="font-semibold text-xs sm:text-sm">Settings</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default SideBar;