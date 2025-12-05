import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import taskit from '../../assets/icons/codesandbox.svg';
import { Home, FolderKanban, ListTodo, Calendar, Users, ChevronLeft, ChevronRight, Settings } from 'lucide-react';

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
      icon: Home,
      path: '/dashboard',
      color: 'from-purple-400 to-purple-600'
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: FolderKanban,
      path: '/projects',
      color: 'from-blue-400 to-blue-600'
    },
    {
      id: 'tasks',
      label: 'My Tasks',
      icon: ListTodo,
      path: '/tasks',
      color: 'from-green-400 to-green-600'
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: Calendar,
      path: '/calendar',
      color: 'from-red-400 to-red-600'
    },
    {
      id: 'team',
      label: 'Team',
      icon: Users,
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
            {isOpen ? (
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            ) : (
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            )}
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
                className={`w-full flex items-center ${isOpen ? 'gap-2 sm:gap-3 px-2 sm:px-3' : 'justify-center'} py-2.5 sm:py-3 rounded-xl transition-all group relative ${
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
                  <item.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${active ? 'text-white' : ''}`} />
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
                  <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-auto text-white" />
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
            className={`w-full flex items-center ${isOpen ? 'gap-2 sm:gap-3 px-2 sm:px-3' : 'justify-center'} py-2.5 sm:py-3 rounded-xl transition-all hover:bg-gray-50 text-gray-700 hover:scale-105`}
            title={!isOpen ? 'Settings' : ''}
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white flex-shrink-0">
              <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            {isOpen && <span className="font-semibold text-xs sm:text-sm">Settings</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default SideBar;