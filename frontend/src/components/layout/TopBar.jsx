import React, { useState, Fragment, useEffect, useRef, useCallback } from "react";
import { getInitials, getRandomColor } from "../../utils/avatarUtils";
import { useNavigate } from "react-router-dom";
import { projectService, authService, taskService } from '../../api';
import NotificationDropdown from '../common/NotificationDropdown';
import {
  Menu,
  MenuButton,
  MenuItems,
  MenuItem,
  Transition,
} from "@headlessui/react";
import { 
  Search, 
  X, 
  Menu as MenuIcon, 
  Loader2, 
  Users, 
  FolderKanban, 
  ListTodo, 
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  User as UserIcon,
  Home,
  Settings,
  LogOut,
  Bell,
  BellOff,
  Frown,
  CheckCircle2,
  Archive
} from "lucide-react";

const TopBar = ({ user, onLogout, loggingOut = false, sidebarOpen, setSidebarOpen }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({
    users: [],
    projects: [],
    tasks: [],
  });
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const searchTimeoutRef = useRef(null);

  // Keyboard shortcuts (Cmd+K or Ctrl+K to focus search)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        const searchInput = searchRef.current?.querySelector("input");
        if (searchInput) {
          searchInput.focus();
        }
      }
      
      // Escape to close results
      if (e.key === "Escape") {
        setShowResults(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Perform search
  const performSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults({ users: [], projects: [], tasks: [] });
      setShowResults(false);
      return;
    }

    setSearching(true);
    setShowResults(true);

    try {
      // Search for projects
      const projectsResponse = await projectService.getAllProjects();

      const allProjects = projectsResponse.data.projects || [];
      const filteredProjects = allProjects.filter(
        (project) =>
          project.name?.toLowerCase().includes(query.toLowerCase()) ||
          project.displayName?.toLowerCase().includes(query.toLowerCase()) ||
          project.description?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);

      // Search for tasks across all projects
      const tasksPromises = allProjects.map((project) =>
        taskService
          .getTasksByProject(project._id)
          .then((res) => ({
            projectId: project._id,
            projectName: project.displayName || project.name,
            tasks: res.data.tasks || [],
          }))
          .catch(() => ({ projectId: project._id, projectName: project.name, tasks: [] }))
      );

      const tasksData = await Promise.all(tasksPromises);
      const allTasks = tasksData.flatMap((data) =>
        data.tasks.map((task) => ({
          ...task,
          projectId: data.projectId,
          projectName: data.projectName,
        }))
      );

      const filteredTasks = allTasks.filter(
        (task) =>
          task.title?.toLowerCase().includes(query.toLowerCase()) ||
          task.description?.toLowerCase().includes(query.toLowerCase()) ||
          task.activity?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);

      // Search for users (team members, owners, and creators)
      const uniqueUserIds = new Set();
      allProjects.forEach((project) => {
        // Add project owner and creator
        if (project.ownedBy) uniqueUserIds.add(project.ownedBy);
        if (project.createdBy) uniqueUserIds.add(project.createdBy);
        
        // Add all project members
        if (project.members) {
          project.members.forEach((member) => {
            if (member.id) uniqueUserIds.add(member.id);
          });
        }
      });

      let filteredUsers = [];
      if (uniqueUserIds.size > 0) {
        const usersResponse = await authService.getUsersByIds(Array.from(uniqueUserIds));

        const allUsers = usersResponse.data.users || [];
        filteredUsers = allUsers.filter(
          (u) =>
            u.name?.toLowerCase().includes(query.toLowerCase()) ||
            u.email?.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 5);
      }

      setSearchResults({
        users: filteredUsers,
        projects: filteredProjects,
        tasks: filteredTasks,
      });
    } catch (err) {
      console.error("Search error:", err);
      setSearchResults({ users: [], projects: [], tasks: [] });
    } finally {
      setSearching(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(searchQuery);
      }, 300);
    } else {
      setSearchResults({ users: [], projects: [], tasks: [] });
      setShowResults(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, performSearch]);

  const handleLogoutClick = async () => {
    if (loggingOut) return; // Prevent double-click
    await onLogout();
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-3 sm:px-4 lg:px-6 py-3 sm:py-4 sticky top-0 z-20">
      <div className="flex items-center justify-between gap-2 sm:gap-4 lg:gap-6">
        {/* Hamburger Menu - Only visible on mobile */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden w-10 h-10 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-all hover:scale-105 active:scale-95 flex-shrink-0"
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? (
            <X className="w-5 h-5 text-gray-700" />
          ) : (
            <MenuIcon className="w-5 h-5 text-gray-700" />
          )}
        </button>

        {/* Left Section - Search */}
        <div className="flex items-center gap-2 sm:gap-4 flex-1 max-w-2xl">
          {/* Enhanced Search Bar with Results */}
          <div className="flex-1 relative group" ref={searchRef}>
            <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
              {searching ? (
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#E31B54] animate-spin" />
              ) : (
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-focus-within:text-[#E31B54] transition-colors" />
              )}
            </div>
            <input
              type="text"
              placeholder="Search projects, tasks, users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery && setShowResults(true)}
              className="w-full h-10 sm:h-12 pl-9 sm:pl-12 pr-9 sm:pr-12 rounded-xl sm:rounded-2xl bg-gray-50/50 border-2 border-gray-200/50 focus:border-[#E31B54] focus:bg-white focus:outline-none transition-all text-xs sm:text-sm font-medium placeholder:text-gray-400 shadow-sm hover:shadow-md"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}
            {!searchQuery && (
              <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:block">
                <kbd className="px-2 py-1 text-xs font-semibold text-gray-400 bg-gray-100 border border-gray-200 rounded-lg">
                  ⌘K
                </kbd>
              </div>
            )}

            {/* Search Results Dropdown */}
            {showResults && searchQuery && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border-2 border-gray-100 overflow-hidden z-50 max-h-[70vh] overflow-y-auto">
                {searching ? (
                  <div className="p-8 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#E31B54] mb-3"></div>
                    <p className="text-sm text-gray-500">Searching...</p>
                  </div>
                ) : (
                  <>
                    {searchResults.projects.length === 0 &&
                    searchResults.tasks.length === 0 &&
                    searchResults.users.length === 0 ? (
                      <div className="p-8 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Frown className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-sm font-semibold text-gray-900 mb-1">
                          No results found
                        </p>
                        <p className="text-xs text-gray-500">
                          Try searching with different keywords
                        </p>
                      </div>
                    ) : (
                      <div className="py-2">
                        {/* Projects Section */}
                        {searchResults.projects.length > 0 && (
                          <div className="mb-2">
                            <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                              <FolderKanban className="w-4 h-4" />
                              Projects ({searchResults.projects.length})
                            </div>
                            {searchResults.projects.map((project) => (
                              <button
                                key={project._id}
                                onClick={() => {
                                  navigate(`/projects/${project._id}`);
                                  setShowResults(false);
                                  setSearchQuery("");
                                }}
                                className="w-full px-4 py-3 hover:bg-gray-50 transition-colors flex items-start gap-3 group"
                              >
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getRandomColor(project._id)} flex items-center justify-center text-white font-bold text-sm flex-shrink-0 group-hover:scale-105 transition-transform`}>
                                  {getInitials(project.displayName || project.name)}
                                </div>
                                <div className="flex-1 text-left min-w-0">
                                  <p className="text-sm font-semibold text-gray-900 group-hover:text-[#E31B54] transition-colors truncate">
                                    {project.displayName || project.name}
                                  </p>
                                  {project.description && (
                                    <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                                      {project.description}
                                    </p>
                                  )}
                                  <p className="text-xs text-gray-400 mt-1">
                                    {project.members?.length + 1 || 1} members
                                  </p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Tasks Section */}
                        {searchResults.tasks.length > 0 && (
                          <div className="mb-2">
                            <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                              <ListTodo className="w-4 h-4" />
                              Tasks ({searchResults.tasks.length})
                            </div>
                            {searchResults.tasks.map((task) => (
                              <button
                                key={task._id}
                                onClick={() => {
                                  navigate(`/projects/${task.projectId}/tasks/${task._id}`);
                                  setShowResults(false);
                                  setSearchQuery("");
                                }}
                                className="w-full px-4 py-3 hover:bg-gray-50 transition-colors flex items-start gap-3 group"
                              >
                                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-[#E31B54] group-hover:text-white transition-all">
                                  <CheckCircle2 className="w-5 h-5" />
                                </div>
                                <div className="flex-1 text-left min-w-0">
                                  <p className="text-sm font-semibold text-gray-900 group-hover:text-[#E31B54] transition-colors line-clamp-1">
                                    {task.title}
                                  </p>
                                  {task.description && (
                                    <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                                      {task.description}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">
                                      {task.projectName}
                                    </span>
                                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">
                                      {task.status}
                                    </span>
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${
                                      task.priority === "high" ? "bg-red-100 text-red-700" :
                                      task.priority === "medium" ? "bg-yellow-100 text-yellow-700" :
                                      "bg-blue-100 text-blue-700"
                                    }`}>
                                      {task.priority}
                                    </span>
                                  </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Users Section */}
                        {searchResults.users.length > 0 && (
                          <div>
                            <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              Team Members ({searchResults.users.length})
                            </div>
                            {searchResults.users.map((u) => (
                              <div
                                key={u._id}
                                className="px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-3 cursor-default"
                              >
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getRandomColor(u._id)} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                                  {getInitials(u.name)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-gray-900 truncate">
                                    {u.name}
                                  </p>
                                  <p className="text-xs text-gray-500 truncate">
                                    {u.email}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Section - Actions & User */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Navigation Buttons - Hidden on mobile */}
          <div className="hidden lg:flex items-center gap-2 mr-2">
            <button
              onClick={() => window.history.back()}
              className="w-10 h-10 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
              title="Go back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => window.history.forward()}
              className="w-10 h-10 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
              title="Go forward"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Divider - Hidden on mobile */}
          <div className="hidden lg:block w-px h-8 bg-gray-200"></div>

          {/* Notification Dropdown - Hidden on small mobile */}
          <div className="hidden sm:block">
            <NotificationDropdown />
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-8 bg-gray-200"></div>

          {/* User Menu Dropdown */}
          <Menu as="div" className="relative">
            <MenuButton
              className="flex items-center gap-2 sm:gap-3 hover:bg-gray-50 rounded-xl sm:rounded-2xl px-2 sm:px-3 py-1.5 sm:py-2 transition-all group focus:outline-none data-[active]:bg-gray-50"
              disabled={loggingOut}
            >
              {/* User Info - Hidden on mobile and tablet */}
              <div className="text-right hidden xl:block">
                <p className="text-xs text-gray-500 font-medium">
                  Welcome back 👋
                </p>
                <p className="text-sm font-bold text-gray-900">
                  {user.name || "User"}
                </p>
              </div>

              {/* Avatar with status */}
              <div className="relative">
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 rounded-lg sm:rounded-xl bg-gradient-to-br ${getRandomColor(
                    user.id
                  )} flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-lg ring-2 ring-white group-hover:ring-[#E31B54]/20 transition-all ${
                    loggingOut ? "opacity-50" : ""
                  }`}
                >
                  {loggingOut ? (
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  ) : (
                    getInitials(user.name)
                  )}
                </div>
                {!loggingOut && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-3.5 lg:h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>

              {/* Dropdown Icon - Hidden on mobile */}
              <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 group-hover:text-gray-600 transition-colors hidden sm:block" />
            </MenuButton>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-150"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <MenuItems className="absolute right-0 mt-2 sm:mt-3 w-64 sm:w-72 bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-gray-200 overflow-hidden focus:outline-none z-50">
                {/* User Info Header */}
                <div className="bg-gradient-to-br from-[#E31B54] to-[#E91E63] p-4 sm:p-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                  <div className="relative flex items-center gap-2 sm:gap-3">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg">
                      {getInitials(user.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-sm sm:text-base truncate">
                        {user.name}
                      </p>
                      <p className="text-white/80 text-xs truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="p-2">
                  <MenuItem>
                    {({ focus }) => (
                      <button
                        onClick={() => navigate("/profile")}
                        className={`${
                          focus ? "bg-gray-50" : ""
                        } w-full px-3 py-2.5 text-left flex items-center gap-3 transition-colors group rounded-xl`}
                      >
                        <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <UserIcon className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">
                            Profile
                          </p>
                          <p className="text-xs text-gray-500">
                            View your profile
                          </p>
                        </div>
                      </button>
                    )}
                  </MenuItem>

                  <MenuItem>
                    {({ focus }) => (
                      <button
                        onClick={() => navigate("/dashboard")}
                        className={`${
                          focus ? "bg-gray-50" : ""
                        } w-full px-3 py-2.5 text-left flex items-center gap-3 transition-colors group rounded-xl`}
                      >
                        <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Home className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">
                            Dashboard
                          </p>
                          <p className="text-xs text-gray-500">Your overview</p>
                        </div>
                      </button>
                    )}
                  </MenuItem>

                  <MenuItem>
                    {({ focus }) => (
                      <button
                        onClick={() => navigate("/projects")}
                        className={`${
                          focus ? "bg-gray-50" : ""
                        } w-full px-3 py-2.5 text-left flex items-center gap-3 transition-colors group rounded-xl`}
                      >
                        <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Archive className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">
                            Projects
                          </p>
                          <p className="text-xs text-gray-500">All projects</p>
                        </div>
                      </button>
                    )}
                  </MenuItem>

                  <MenuItem>
                    {({ focus }) => (
                      <button
                        onClick={() => navigate("/settings")}
                        className={`${
                          focus ? "bg-gray-50" : ""
                        } w-full px-3 py-2.5 text-left flex items-center gap-3 transition-colors group rounded-xl`}
                      >
                        <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Settings className="w-4 h-4 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">
                            Settings
                          </p>
                          <p className="text-xs text-gray-500">Preferences</p>
                        </div>
                      </button>
                    )}
                  </MenuItem>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 my-1"></div>

                {/* Logout Button */}
                <div className="p-2">
                  <MenuItem>
                    {({ focus }) => (
                      <button
                        onClick={handleLogoutClick}
                        disabled={loggingOut}
                        className={`${
                          focus ? "bg-red-50" : ""
                        } w-full px-3 py-2.5 text-left flex items-center gap-3 transition-colors group rounded-xl disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                          {loggingOut ? (
                            <Loader2 className="w-4 h-4 text-red-600 animate-spin" />
                          ) : (
                            <LogOut className="w-4 h-4 text-red-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-red-600">
                            {loggingOut ? "Signing Out..." : "Sign Out"}
                          </p>
                          <p className="text-xs text-red-500">
                            {loggingOut ? "Please wait" : "See you soon!"}
                          </p>
                        </div>
                      </button>
                    )}
                  </MenuItem>
                </div>
              </MenuItems>
            </Transition>
          </Menu>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
