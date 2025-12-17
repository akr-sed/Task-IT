import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { projectService } from '../api';
import Select from "react-select";
import { getInitials, getRandomColor } from "../utils/avatarUtils";
import { 
  Archive, 
  Plus, 
  Search as SearchIcon, 
  X, 
  Grid3x3, 
  List, 
  Mail,
  Check,
  Star,
  Users as UsersIcon,
  Clock,
  Calendar,
  ChevronRight,
  FolderOpen
} from "lucide-react";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState({
    value: "all",
    label: "All Projects",
  });
  const [sortBy, setSortBy] = useState({
    value: "recent",
    label: "Most Recent",
  });
  const [viewMode, setViewMode] = useState("grid");
  const navigate = useNavigate();
  const isFetchingRef = useRef(false);

  // Custom styles for react-select
  const selectStyles = {
    control: (base, state) => ({
      ...base,
      height: "40px",
      minHeight: "40px",
      borderRadius: "12px",
      borderWidth: "2px",
      borderColor: state.isFocused ? "#E31B54" : "#E5E7EB",
      boxShadow: "none",
      "&:hover": {
        borderColor: "#E31B54",
      },
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#E31B54"
        : state.isFocused
        ? "#FFF5F8"
        : "white",
      color: state.isSelected ? "white" : "#374151",
      cursor: "pointer",
      "&:active": {
        backgroundColor: "#E31B54",
      },
    }),
    singleValue: (base) => ({
      ...base,
      color: "#374151",
      fontWeight: "500",
    }),
    menu: (base) => ({
      ...base,
      borderRadius: "12px",
      overflow: "hidden",
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    }),
  };

  const roleOptions = [
    { value: "all", label: "📦 All Projects" },
    { value: "owner", label: "👑 My Projects" },
    { value: "member", label: "👥 Shared with Me" },
  ];

  const sortOptions = [
    { value: "recent", label: "🕐 Most Recent" },
    { value: "name", label: "🔤 Name (A-Z)" },
    { value: "members", label: "👥 Most Members" },
  ];

  const fetchProjectsAndInvites = useCallback(async () => {
    if (isFetchingRef.current) {
      console.log('🔄 Already fetching projects, skipping...');
      return;
    }

    isFetchingRef.current = true;
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const [projectsRes, invitesRes] = await Promise.allSettled([
        projectService.getAllProjects(),
        projectService.getMyInvitations(),
        
      ]);
      

      if (projectsRes.status === "fulfilled") {
        setProjects(projectsRes.value.data.projects || []);
      } else {
        console.error("Error fetching projects:", projectsRes.reason);
        setError(projectsRes.reason.response?.data?.message || "Failed to load projects");
      }

      if (invitesRes.status === "fulfilled") {
        const formattedInvites = invitesRes.value.data.invitations.map((invite) => ({
          _id: invite._id,
          inviteCode: invite.inviteCode,
          projectId: {
            _id: invite.projectId,
            name:
              invitesRes.value.data.projectNames[invite.projectId] ||
              "Unknown Project",
          },
          invitedBy: {
            _id: invite.invitedBy,
            name: invitesRes.value.data.invitorNames[invite._id] || "Unknown",
            email: invitesRes.value.data.invitorEmails[invite._id] || "",
          },
          invitedEmail: invite.invitedEmail,
        }));
        setInvitations(formattedInvites);
      } else {
        console.error("Error fetching invitations:", invitesRes.reason);
        setInvitations([]);
      }

    } catch (err) {
      console.error("Error fetching projects:", err);
      setError(err.response?.data?.message || "Failed to load projects");
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [navigate]);

  useEffect(() => {
    fetchProjectsAndInvites();
  }, [fetchProjectsAndInvites]);

  const handleAcceptInvite = (projectId, inviteId, inviteCode) => {
    navigate(`/projects/${projectId}/invite/${inviteId}/${inviteCode}`);
  };

  const handleDeclineInvite = async (projectId, inviteId, inviteCode) => {
    try {
      await projectService.declineInvitation(projectId, inviteId, inviteCode);
      setInvitations((prev) => prev.filter((inv) => inv._id !== inviteId));
    } catch (err) {
      console.error("Error declining invite:", err);
    }
  };

  const currentUserId = JSON.parse(localStorage.getItem("user"))?.id;
  const isOwner = (project) => project.ownedBy === currentUserId;

  const filteredProjects = projects
    .filter((project) => {
      const matchesSearch =
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (project.displayName || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (project.description || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchesRole =
        filterRole.value === "all" ||
        (filterRole.value === "owner" && isOwner(project)) ||
        (filterRole.value === "member" && !isOwner(project));

      return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      if (sortBy.value === "name") {
        return a.name.localeCompare(b.name);
      } else if (sortBy.value === "members") {
        return (b.members?.length || 0) - (a.members?.length || 0);
      } else {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

  const stats = {
    total: projects.length,
    owned: projects.filter((p) => isOwner(p)).length,
    member: projects.filter((p) => !isOwner(p)).length,
    invites: invitations.length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#E31B54] mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your Projects.</p>
          <p className="text-gray-400 text-sm mt-2">Please wait while we fetch your data</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* ✅ Responsive Header with Inline Stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-[#E31B54] to-[#E91E63] rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
            <Archive className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Projects</h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
              <span className="text-xs sm:text-sm text-gray-600">{stats.total} total</span>
              <span className="text-gray-300 hidden sm:inline">•</span>
              <span className="text-xs sm:text-sm text-purple-600 font-medium">{stats.owned} owned</span>
              <span className="text-gray-300 hidden sm:inline">•</span>
              <span className="text-xs sm:text-sm text-blue-600 font-medium">{stats.member} shared</span>
              {stats.invites > 0 && (
                <>
                  <span className="text-gray-300 hidden sm:inline">•</span>
                  <span className="text-xs sm:text-sm text-green-600 font-semibold flex items-center gap-1">
                    {stats.invites} pending
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate("/projects/new")}
          className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-[#E31B54] to-[#E91E63] text-white rounded-xl sm:rounded-2xl font-semibold hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>New Project</span>
        </button>
      </div>

      {/* Filters & Controls */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-gray-200 shadow-sm">
        <div className="flex flex-col gap-3">
          {/* Search */}
          <div className="w-full relative">
            <SearchIcon className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 sm:h-10 pl-9 sm:pl-12 pr-4 border-2 border-gray-200 rounded-xl focus:border-[#E31B54] focus:outline-none transition-colors text-xs sm:text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}
          </div>

          {/* Filter and Sort Row */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            {/* Filter by Role with Clear */}
            <div className="flex-1 flex gap-2">
              <div className="flex-1">
                <Select
                  value={filterRole}
                  onChange={setFilterRole}
                  options={roleOptions}
                  styles={selectStyles}
                  isSearchable={false}
                  placeholder="Filter by role..."
                />
              </div>
              {filterRole.value !== "all" && (
                <button
                  onClick={() => setFilterRole({ value: "all", label: "📦 All Projects" })}
                  className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-all flex-shrink-0"
                  title="Clear filter"
                >
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              )}
            </div>

            {/* Sort with Clear */}
            <div className="flex-1 flex gap-2">
              <div className="flex-1">
                <Select
                  value={sortBy}
                  onChange={setSortBy}
                  options={sortOptions}
                  styles={selectStyles}
                  isSearchable={false}
                  placeholder="Sort by..."
                />
              </div>
              {sortBy.value !== "recent" && (
                <button
                  onClick={() => setSortBy({ value: "recent", label: "🕐 Most Recent" })}
                  className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-all flex-shrink-0"
                  title="Reset sort"
                >
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex border-2 border-gray-200 rounded-xl overflow-hidden h-9 sm:h-10 flex-shrink-0">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 sm:px-4 flex items-center gap-1 sm:gap-2 transition-all ${
                  viewMode === "grid"
                    ? "bg-gradient-to-r from-[#E31B54] to-[#E91E63] text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
                title="Grid View"
              >
                <Grid3x3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 sm:px-4 flex items-center gap-1 sm:gap-2 transition-all ${
                  viewMode === "list"
                    ? "bg-gradient-to-r from-[#E31B54] to-[#E91E63] text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
                title="List View"
              >
                <List className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              Pending Invitations
              <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs sm:text-sm rounded-full font-semibold animate-pulse">
                {invitations.length}
              </span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {invitations.map((invite) => (
              <div
                key={invite._id}
                className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border-2 border-dashed border-gray-300 hover:border-green-500 hover:shadow-xl transition-all group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                      <Mail className="w-7 h-7" />
                    </div>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full flex items-center gap-1">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                      Pending
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                    {invite.projectId?.name}
                  </h3>
                  <div className="flex items-center gap-2 mb-4">
                    <div className={`w-8 h-8 bg-gradient-to-br ${getRandomColor(invite.invitedBy._id)} rounded-full flex items-center justify-center text-white text-xs font-bold`}>
                      {getInitials(invite.invitedBy?.name)}
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        Invited by <span className="font-semibold text-gray-900">{invite.invitedBy?.name}</span>
                      </p>
                      <p className="text-xs text-gray-500">{invite.invitedBy?.email}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAcceptInvite(invite.projectId._id, invite._id, invite.inviteCode)}
                      className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Accept
                    </button>
                    <button
                      onClick={() => handleDeclineInvite(invite.projectId._id, invite._id, invite.inviteCode)}
                      className="flex-1 px-4 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Decline
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects Section - Responsive Grid */}
      {filteredProjects.length > 0 ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project._id}
                onClick={() => navigate(`/projects/${project._id}`)}
                className="bg-white rounded-xl sm:rounded-2xl border-2 border-gray-200 hover:border-[#E31B54] hover:shadow-2xl transition-all cursor-pointer group overflow-hidden transform hover:-translate-y-2"
              >
                {/* Project Header */}
                <div className={`bg-gradient-to-r ${getRandomColor(project._id)} p-4 sm:p-6 relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-24 sm:h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl flex items-center justify-center text-white font-bold text-base sm:text-xl shadow-lg group-hover:scale-110 transition-transform">
                        {getInitials(project.name)}
                      </div>
                      {isOwner(project) && (
                        <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-white/20 backdrop-blur-sm text-white text-[10px] sm:text-xs font-bold rounded-full flex items-center gap-1">
                          <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="currentColor" />
                          Owner
                        </span>
                      )}
                    </div>
                    <h3 className="text-base sm:text-xl font-bold text-white truncate group-hover:scale-105 transition-transform origin-left">
                      {project.displayName || project.name}
                    </h3>
                  </div>
                </div>

                {/* Project Body */}
                <div className="p-4 sm:p-6">
                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-3 sm:mb-4 h-8 sm:h-10">
                    {project.description || "No description provided."}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-gray-500">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <UsersIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>
                      <span className="font-semibold text-xs sm:text-sm">{(project.members?.length || 0) + 1}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-white/90">
                      <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="text-[10px] sm:text-xs font-medium">
                        {new Date(project.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="h-1 bg-gradient-to-r from-[#E31B54] to-[#E91E63] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {filteredProjects.map((project) => (
              <div
                key={project._id}
                onClick={() => navigate(`/projects/${project._id}`)}
                className="bg-white rounded-xl sm:rounded-2xl border-2 border-gray-200 hover:border-[#E31B54] hover:shadow-xl transition-all cursor-pointer p-4 sm:p-6 group"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br ${getRandomColor(project._id)} rounded-lg sm:rounded-xl flex items-center justify-center text-white font-bold text-base sm:text-xl flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    {getInitials(project.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm sm:text-lg font-bold text-gray-900 truncate">{project.displayName || project.name}</h3>
                      {isOwner(project) && (
                        <span className="px-1.5 sm:px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] sm:text-xs font-bold rounded-full flex items-center gap-1">
                          <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="currentColor" />
                          <span className="hidden sm:inline">Owner</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 line-clamp-1">{project.description || "No description"}</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-4 lg:gap-6 text-xs sm:text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <UsersIcon className="w-4 h-4" />
                      </div>
                      <span className="font-medium">{(project.members?.length || 0) + 1} members</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span className="hidden lg:inline">{new Date(project.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                      <span className="lg:hidden">{new Date(project.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 group-hover:text-[#E31B54] group-hover:translate-x-2 transition-all flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-dashed border-gray-300 p-8 sm:p-16 text-center">
          <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <FolderOpen className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            {searchQuery || filterRole.value !== "all" ? "No projects found" : "No projects yet"}
          </h3>
          <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 max-w-md mx-auto px-4">
            {searchQuery || filterRole.value !== "all"
              ? "Try adjusting your search or filters"
              : "Get started by creating your first project"}
          </p>
          {!searchQuery && filterRole.value === "all" && (
            <button
              onClick={() => navigate("/projects/new")}
              className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#E31B54] to-[#E91E63] text-white rounded-full font-bold hover:shadow-2xl hover:scale-105 transition-all inline-flex items-center gap-2 sm:gap-3 text-sm sm:text-base"
            >
              <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
              Create Your First Project
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Projects;