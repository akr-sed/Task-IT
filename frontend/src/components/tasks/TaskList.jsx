import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { projectService, taskService, authService } from "../../api";
import Select from "react-select";
import { getInitials, getRandomColor } from "../../utils/avatarUtils";

const priorityColors = {
  low: "bg-blue-100 text-blue-700 border-blue-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  high: "bg-red-100 text-red-700 border-red-200",
};

const statusColors = {
  todo: "bg-gray-100 text-gray-700 border-gray-200",
  "in progress": "bg-indigo-100 text-indigo-700 border-indigo-200",
  "to review": "bg-purple-100 text-purple-700 border-purple-200",
  done: "bg-green-100 text-green-700 border-green-200",
};

const statusLabels = {
  todo: "To Do",
  "in progress": "In Progress",
  "to review": "To Review",
  done: "Done",
};

const activityIcons = {
  BACKEND:
    "M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  FRONTEND: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
  DESIGN:
    "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01",
  TESTING: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  DEVOPS:
    "M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01",
  OTHER:
    "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4",
};

// React-Select custom styles
const selectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: "48px",
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
    padding: "10px 12px",
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
  placeholder: (base) => ({
    ...base,
    color: "#9CA3AF",
  }),
};

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [project, setProject] = useState(null);
  const [membersMap, setMembersMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState({
    value: "all",
    label: "All Status",
  });
  const [filterPriority, setFilterPriority] = useState({
    value: "all",
    label: "All Priority",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const { projectId } = useParams();
  const navigate = useNavigate();
  const isFetchingRef = useRef(false); // ✅ Prevent duplicate calls

  const currentUserId = JSON.parse(localStorage.getItem("user"))?.id;

  const isOwner = () => project && project.ownedBy === currentUserId;
  const isAdmin = () =>
    project &&
    project.members &&
    project.members.some((m) => m.id === currentUserId && m.role === "admin");
  const canCreateTasks = () => isOwner() || isAdmin();

  // Filter options for react-select
  const statusOptions = [
    { value: "all", label: "📋 All Status" },
    { value: "todo", label: "📝 To Do" },
    { value: "in progress", label: "⚡ In Progress" },
    { value: "to review", label: "👀 To Review" },
    { value: "done", label: "✅ Done" },
  ];

  const priorityOptions = [
    { value: "all", label: "🎯 All Priority" },
    { value: "low", label: "🟦 Low" },
    { value: "medium", label: "🟨 Medium" },
    { value: "high", label: "🟥 High" },
  ];

  const fetchProjectAndTasks = useCallback(async () => {
    // ✅ Prevent duplicate calls
    if (isFetchingRef.current) {
      console.log("🔄 Already fetching tasks, skipping...");
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

      // ✅ PARALLEL FETCH - Get project and tasks together
      const [projectResp, tasksResp] = await Promise.all([
        projectService.getProjectById(projectId),
        taskService.getTasksByProject(projectId),
      ]);

      const projectData = projectResp.data.project || projectResp.data;
      setProject(projectData);
      setTasks(tasksResp.data.tasks || []);

      // ✅ BATCH FETCH MEMBERS
      const userIdsSet = new Set();
      if (projectData.ownedBy) userIdsSet.add(projectData.ownedBy);
      (projectData.members || []).forEach((m) => {
        if (m.id) userIdsSet.add(m.id);
      });

      const userIds = Array.from(userIdsSet);
      if (userIds.length > 0) {
        const batch = await authService.getUsersByIds(userIds);
        const users = batch.data.users || [];
        const map = {};
        users.forEach((u) => (map[u._id] = u));
        setMembersMap(map);
      }
    } catch (err) {
      console.error("Error fetching project or tasks:", err);
      setError(err.response?.data?.message || "Failed to load tasks");
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [projectId, navigate]);

  useEffect(() => {
    fetchProjectAndTasks();
  }, [fetchProjectAndTasks]);

  const getMemberName = (id) => (membersMap[id] ? membersMap[id].name : id);

  const filteredTasks = React.useMemo(() => tasks.filter((task) => {
    const matchesStatus =
      filterStatus.value === "all" || task.status === filterStatus.value;
    const matchesPriority =
      filterPriority.value === "all" || task.priority === filterPriority.value;
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesPriority && matchesSearch;
  }), [tasks, filterStatus, filterPriority, searchQuery]);

  const taskStats = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === "todo").length,
    inProgress: tasks.filter((t) => t.status === "in progress").length,
    toReview: tasks.filter((t) => t.status === "to review").length,
    done: tasks.filter((t) => t.status === "done").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#E31B54] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
        <div className="flex items-center gap-3">
          <svg
            className="w-6 h-6 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Project Tasks</h3>
          <p className="text-sm text-gray-600 mt-1">
            Manage and track all tasks in this project
          </p>
        </div>
        {canCreateTasks() && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-[#E31B54] to-[#E91E63] text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            New Task
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl p-4 border-2 border-gray-200 hover:border-[#E31B54] transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase">
                Total
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {taskStats.total}
              </p>
            </div>
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border-2 border-gray-200 hover:border-gray-400 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-semibold uppercase">
                To Do
              </p>
              <p className="text-2xl font-bold text-gray-700 mt-1">
                {taskStats.todo}
              </p>
            </div>
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border-2 border-indigo-200 hover:border-indigo-400 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-indigo-500 font-semibold uppercase">
                In Progress
              </p>
              <p className="text-2xl font-bold text-indigo-700 mt-1">
                {taskStats.inProgress}
              </p>
            </div>
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
              <svg
                className="w-5 h-5 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border-2 border-purple-200 hover:border-purple-400 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-purple-500 font-semibold uppercase">
                Review
              </p>
              <p className="text-2xl font-bold text-purple-700 mt-1">
                {taskStats.toReview}
              </p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <svg
                className="w-5 h-5 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border-2 border-green-200 hover:border-green-400 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-green-500 font-semibold uppercase">
                Done
              </p>
              <p className="text-2xl font-bold text-green-700 mt-1">
                {taskStats.done}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <svg
                className="w-5 h-5 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <svg
              className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-10 pr-4 border-2 border-gray-200 rounded-xl focus:border-[#E31B54] focus:outline-none transition-colors"
            />
          </div>

          {/* Status Filter with React-Select */}
          <div className="w-full lg:w-64">
            <Select
              value={filterStatus}
              onChange={setFilterStatus}
              options={statusOptions}
              styles={selectStyles}
              isSearchable={false}
              placeholder="Filter by status..."
            />
          </div>

          {/* Priority Filter with React-Select */}
          <div className="w-full lg:w-64">
            <Select
              value={filterPriority}
              onChange={setFilterPriority}
              options={priorityOptions}
              styles={selectStyles}
              isSearchable={false}
              placeholder="Filter by priority..."
            />
          </div>
        </div>
      </div>

      {/* Tasks List */}
      {filteredTasks.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredTasks.map((task) => (
            <div
              key={task._id}
              className="bg-white rounded-2xl border-2 border-gray-200 hover:border-[#E31B54] hover:shadow-lg transition-all overflow-hidden group"
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Task Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-5 h-5 text-gray-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d={
                              activityIcons[task.activity] ||
                              activityIcons.OTHER
                            }
                          />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-bold text-gray-900 truncate group-hover:text-[#E31B54] transition-colors">
                          {task.title}
                        </h4>
                        <p className="text-sm text-gray-500">{task.activity}</p>
                      </div>
                    </div>

                    {/* Description */}
                    {task.description && (
                      <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    {/* Task Meta */}
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Priority Badge */}
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                          priorityColors[task.priority]
                        }`}
                      >
                        {task.priority.charAt(0).toUpperCase() +
                          task.priority.slice(1)}
                      </span>

                      {/* Status Badge */}
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                          statusColors[task.status]
                        }`}
                      >
                        {statusLabels[task.status]}
                      </span>

                      {/* Assigned To */}
                      {task.assignedTo ? (
                        <div className="flex items-center gap-2 bg-gray-50 rounded-full px-3 py-1">
                          <div
                            className={`w-6 h-6 rounded-full bg-gradient-to-br ${getRandomColor(
                              task.assignedTo
                            )} flex items-center justify-center text-white text-xs font-bold`}
                          >
                            {getInitials(getMemberName(task.assignedTo))}
                          </div>
                          <span className="text-xs font-medium text-gray-700">
                            {getMemberName(task.assignedTo)}
                          </span>
                        </div>
                      ) : (
                        <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-medium">
                          Unassigned
                        </span>
                      )}

                      {/* Created Date */}
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        {new Date(task.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  {/* View Button */}
                  <button
                    onClick={() =>
                      navigate(`/projects/${projectId}/tasks/${task._id}`)
                    }
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gradient-to-r hover:from-[#E31B54] hover:to-[#E91E63] hover:text-white transition-all flex items-center gap-2 flex-shrink-0"
                  >
                    <span className="hidden sm:inline">View</span>
                    <svg
                      className="w-4 h-4"
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
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {searchQuery ||
            filterStatus.value !== "all" ||
            filterPriority.value !== "all"
              ? "No tasks match your filters"
              : "No tasks yet"}
          </h3>
          <p className="text-gray-600 mb-6">
            {canCreateTasks()
              ? "Get started by creating your first task"
              : "There are no tasks in this project yet"}
          </p>
          {canCreateTasks() && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-[#E31B54] to-[#E91E63] text-white rounded-full font-semibold hover:shadow-lg transition-all inline-flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create First Task
            </button>
          )}
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateModal && canCreateTasks() && (
        <CreateTaskModal
          projectId={projectId}
          membersMap={membersMap}
          project={project}
          onClose={() => setShowCreateModal(false)}
          onTaskCreated={(newTask) => {
            setTasks((prev) => [...prev, newTask]);
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
};

const CreateTaskModal = ({
  projectId,
  onClose,
  onTaskCreated,
  membersMap,
  project,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [activity, setActivity] = useState({
    value: "BACKEND",
    label: "🔧 Backend",
  });
  const [priority, setPriority] = useState({
    value: "medium",
    label: "🟨 Medium",
  });
  const [assignedTo, setAssignedTo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // React-Select custom styles
  const selectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: "48px",
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
      padding: "10px 12px",
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
    placeholder: (base) => ({
      ...base,
      color: "#9CA3AF",
    }),
  };

  const activityOptions = [
    { value: "BACKEND", label: "🔧 Backend" },
    { value: "FRONTEND", label: "🎨 Frontend" },
    { value: "DESIGN", label: "✨ Design" },
    { value: "TESTING", label: "🧪 Testing" },
    { value: "DEVOPS", label: "⚙️ DevOps" },
    { value: "OTHER", label: "📌 Other" },
  ];

  const priorityOptions = [
    { value: "low", label: "🟦 Low" },
    { value: "medium", label: "🟨 Medium" },
    { value: "high", label: "🟥 High" },
  ];

  const memberOptions = () => {
    const ids = [];
    if (project?.ownedBy) ids.push(project.ownedBy);
    (project?.members || []).forEach((m) => {
      if (m.id) ids.push(m.id);
    });
    const uniqueIds = [...new Set(ids)];
    return uniqueIds.map((id) => ({
      value: id,
      label: membersMap[id] ? membersMap[id].name : id,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const resp = await taskService.createTask({
        projectId,
        title,
        description,
        activity: activity.value,
        priority: priority.value,
        status: "todo",
        assignedTo: assignedTo ? assignedTo.value : null,
        dueDate: dueDate || null,
      });
      onTaskCreated(resp.data.task || resp.data);
    } catch (err) {
      console.error("Error creating task:", err);
      setError(err.response?.data?.message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#E31B54] to-[#E91E63] p-6 rounded-t-2xl">
          <h3 className="text-2xl font-bold text-white flex items-center gap-3">
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create New Task
          </h3>
          <p className="text-white/90 text-sm mt-1">
            Add a new task to your project
          </p>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Task Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-[#E31B54] focus:outline-none transition-colors"
              placeholder="Enter task title..."
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#E31B54] focus:outline-none transition-colors resize-none"
              placeholder="Describe the task..."
            />
          </div>

          {/* Activity & Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Activity Type
              </label>
              <Select
                value={activity}
                onChange={setActivity}
                options={activityOptions}
                styles={selectStyles}
                isSearchable={false}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Priority
              </label>
              <Select
                value={priority}
                onChange={setPriority}
                options={priorityOptions}
                styles={selectStyles}
                isSearchable={false}
              />
            </div>
          </div>

          {/* Due Date & Assign To */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full h-[48px] px-4 border-2 border-gray-200 rounded-xl focus:border-[#E31B54] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Assign To
              </label>
              <Select
                value={assignedTo}
                onChange={setAssignedTo}
                options={memberOptions()}
                styles={selectStyles}
                isClearable
                placeholder="Select a team member..."
              />
            </div>
          </div>

          {assignedTo && membersMap[assignedTo.value] && (
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl w-fit">
              <div
                className={`w-8 h-8 rounded-full bg-gradient-to-br ${getRandomColor(
                  assignedTo.value
                )} flex items-center justify-center text-white text-xs font-bold`}
              >
                {getInitials(membersMap[assignedTo.value].name)}
              </div>
              <span className="text-sm font-medium text-gray-700">
                {membersMap[assignedTo.value].name}
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-12 border-2 border-gray-300 text-gray-700 rounded-full font-semibold hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 h-12 bg-gradient-to-r from-[#E31B54] to-[#E91E63] text-white rounded-full font-semibold hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Create Task
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskList;
