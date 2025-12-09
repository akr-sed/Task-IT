import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { Users, RefreshCcw, Search, Filter, Layers } from "lucide-react";
import { projectService, authService } from "../api";
import Card from "../components/common/Card";
import Avatar from "../components/common/Avatar";
import EmptyState from "../components/common/EmptyState";

const selectStyles = {
  control: (base, state) => ({
    ...base,
    height: "44px",
    minHeight: "44px",
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
    fontWeight: state.isSelected ? 600 : 500,
  }),
  singleValue: (base) => ({
    ...base,
    color: "#374151",
    fontWeight: "600",
  }),
  menu: (base) => ({
    ...base,
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
  }),
};

const roleOptions = [
  { value: "all", label: "All roles" },
  { value: "owner", label: "Owners" },
  { value: "admin", label: "Admins" },
  { value: "member", label: "Members" },
];

const sortOptions = [
  { value: "projects", label: "Most shared projects" },
  { value: "name", label: "Name (A-Z)" },
  { value: "recent", label: "Recent collaborations" },
];

const formatRoleBadge = (role) => {
  if (role === "owner") return { label: "Owner", className: "bg-purple-100 text-purple-700" };
  if (role === "admin") return { label: "Admin", className: "bg-green-100 text-green-700" };
  return { label: "Member", className: "bg-blue-100 text-blue-700" };
};

const Team = () => {
  const [collaborators, setCollaborators] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterProject, setFilterProject] = useState({ value: "all", label: "All projects" });
  const [filterRole, setFilterRole] = useState(roleOptions[0]);
  const [sortBy, setSortBy] = useState(sortOptions[0]);

  const navigate = useNavigate();
  const currentUserId = useMemo(() => JSON.parse(localStorage.getItem("user"))?.id, []);

  const fetchTeamData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const projectsResponse = await projectService.getAllProjects();
      const projectsData = projectsResponse.data.projects || [];
      setProjects(projectsData);

      const collaboratorMap = new Map();

      const addCollaborator = (userId, project, role) => {
        if (!userId || userId === currentUserId) return;
        if (!collaboratorMap.has(userId)) {
          collaboratorMap.set(userId, {
            projects: [],
            latestCollab: project.createdAt ? new Date(project.createdAt).getTime() : 0,
          });
        }

        const entry = collaboratorMap.get(userId);
        const exists = entry.projects.some((p) => p.id === project._id);
        if (!exists) {
          entry.projects.push({
            id: project._id,
            name: project.displayName || project.name,
            role,
            createdAt: project.createdAt || null,
          });
        }

        if (project.createdAt) {
          const projectTime = new Date(project.createdAt).getTime();
          entry.latestCollab = Math.max(entry.latestCollab || 0, projectTime);
        }
      };

      projectsData.forEach((project) => {
        addCollaborator(project.ownedBy, project, "owner");
        if (project.members && Array.isArray(project.members)) {
          project.members.forEach((member) => addCollaborator(member.id, project, member.role || "member"));
        }
      });

      const collaboratorIds = Array.from(collaboratorMap.keys());
      let usersData = [];

      if (collaboratorIds.length > 0) {
        try {
          const usersResponse = await authService.getUsersByIds(collaboratorIds);
          usersData = usersResponse.data.users || [];
        } catch (batchError) {
          console.error("Batch user fetch failed, falling back to individual requests", batchError);
          const userPromises = collaboratorIds.map((id) => authService.getUserById(id).then((res) => res.data).catch(() => null));
          usersData = await Promise.all(userPromises);
        }
      }

      const usersMap = new Map(usersData.filter(Boolean).map((user) => [user._id, user]));

      const result = collaboratorIds.map((id) => {
        const user = usersMap.get(id);
        const base = collaboratorMap.get(id);
        return {
          id,
          name: user?.name || "Unknown User",
          email: user?.email || "No email",
          projects: base.projects,
          latestCollab: base.latestCollab || 0,
        };
      });

      setCollaborators(result);
    } catch (err) {
      console.error("Error fetching team data:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }
      setError(err.response?.data?.message || "Failed to load team");
    } finally {
      setLoading(false);
    }
  }, [currentUserId, navigate]);

  useEffect(() => {
    fetchTeamData();
  }, [fetchTeamData]);

  const projectOptions = useMemo(() => {
    const base = [{ value: "all", label: "All projects" }];
    const options = projects.map((project) => ({
      value: project._id,
      label: project.displayName || project.name,
    }));
    return [...base, ...options];
  }, [projects]);

  const filteredCollaborators = useMemo(() => {
    return collaborators
      .filter((collaborator) => {
        const matchesSearch = collaborator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          collaborator.email.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesProject = filterProject.value === "all" || collaborator.projects.some((p) => p.id === filterProject.value);
        const matchesRole = filterRole.value === "all" || collaborator.projects.some((p) => p.role === filterRole.value);

        return matchesSearch && matchesProject && matchesRole;
      })
      .sort((a, b) => {
        if (sortBy.value === "name") return a.name.localeCompare(b.name);
        if (sortBy.value === "recent") return (b.latestCollab || 0) - (a.latestCollab || 0);
        return (b.projects?.length || 0) - (a.projects?.length || 0);
      });
  }, [collaborators, filterProject.value, filterRole.value, searchQuery, sortBy.value]);

  const stats = useMemo(() => {
    const sharedProjects = new Set();
    let admins = 0;
    filteredCollaborators.forEach((collab) => {
      collab.projects.forEach((p) => sharedProjects.add(p.id));
      if (collab.projects.some((p) => p.role === "admin")) admins += 1;
    });

    return {
      collaborators: filteredCollaborators.length,
      sharedProjects: sharedProjects.size,
      admins,
    };
  }, [filteredCollaborators]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#E31B54] mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading team...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <Card className="max-w-xl">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center">
              <Filter className="w-7 h-7" />
            </div>
            <p className="text-gray-800 font-semibold">{error}</p>
            <button
              onClick={fetchTeamData}
              className="px-4 py-2 bg-gradient-to-r from-[#E31B54] to-[#E91E63] text-white rounded-full text-sm font-medium hover:shadow-lg transition-all"
            >
              Try again
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-yellow-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
            <Users className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Team</h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1 text-sm text-gray-600">
              <span>{stats.collaborators} collaborators</span>
              <span className="text-gray-300 hidden sm:inline">•</span>
              <span className="text-purple-700 font-semibold">{stats.sharedProjects} shared projects</span>
              <span className="text-gray-300 hidden sm:inline">•</span>
              <span className="text-green-700 font-semibold">{stats.admins} admins</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchTeamData}
            className="px-3 py-2 rounded-xl border border-gray-200 text-gray-700 hover:border-[#E31B54] hover:text-[#E31B54] transition-all flex items-center gap-2"
          >
            <RefreshCcw className="w-4 h-4" />
            <span className="text-sm font-semibold">Refresh</span>
          </button>
        </div>
      </div>

      <Card className="w-full">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or email"
                className="w-full h-11 pl-10 pr-4 rounded-xl border-2 border-gray-200 focus:border-[#E31B54] focus:outline-none text-sm"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Select
                value={filterProject}
                onChange={(val) => setFilterProject(val)}
                options={projectOptions}
                styles={selectStyles}
                placeholder="Filter by project"
                classNamePrefix="project-select"
              />
              <Select
                value={filterRole}
                onChange={(val) => setFilterRole(val)}
                options={roleOptions}
                styles={selectStyles}
                placeholder="Filter by role"
                classNamePrefix="role-select"
              />
              <Select
                value={sortBy}
                onChange={(val) => setSortBy(val)}
                options={sortOptions}
                styles={selectStyles}
                placeholder="Sort by"
                classNamePrefix="sort-select"
              />
            </div>
          </div>
        </div>
      </Card>

      {filteredCollaborators.length === 0 ? (
        <EmptyState
          icon={<Layers className="w-12 h-12 text-gray-300 mx-auto" />}
          message="No collaborators match your filters yet"
          actionLabel="Reset filters"
          onAction={() => {
            setSearchQuery("");
            setFilterProject(projectOptions[0]);
            setFilterRole(roleOptions[0]);
            setSortBy(sortOptions[0]);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {filteredCollaborators.map((collab) => {
            const primaryRole = collab.projects.find((p) => p.role === "owner")?.role ||
              collab.projects.find((p) => p.role === "admin")?.role ||
              "member";
            const roleBadge = formatRoleBadge(primaryRole);

            return (
              <Card key={collab.id} className="h-full">
                <div className="flex flex-col gap-4 h-full">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <Avatar name={collab.name} id={collab.id} size="xl" />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-lg font-bold text-gray-900">{collab.name}</p>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${roleBadge.className}`}>
                            {roleBadge.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{collab.email}</p>
                        <p className="text-xs text-gray-500 mt-1">{collab.projects.length} shared project{collab.projects.length > 1 ? "s" : ""}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {collab.projects.map((project) => {
                      const badge = formatRoleBadge(project.role);
                      return (
                        <div
                          key={`${project.id}-${project.role}`}
                          className="px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 flex items-center gap-2 text-sm text-gray-800"
                        >
                          <span className="font-semibold">{project.name}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${badge.className}`}>
                            {badge.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Team;
