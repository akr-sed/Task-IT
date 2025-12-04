import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { projectService, taskService, authService } from '../../api';
import Select from "react-select";
import { getInitials, getRandomColor } from "../../utils/avatarUtils";
import { priorityColors, activityIcons, selectStyles } from "../../utils/tasksDetailsStyles";

const TaskAssignment = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [project, setProject] = useState(null);
  const [membersMap, setMembersMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState({ value: "all", label: "All Statuses" });
  const [filterAssignment, setFilterAssignment] = useState({ value: "all", label: "All Tasks" });
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [bulkAssigning, setBulkAssigning] = useState(false);

  

  const currentUserId = JSON.parse(localStorage.getItem("user"))?.id;
  const isOwner = () => project && project.ownedBy === currentUserId;
  const isAdmin = () =>
    project &&
    project.members &&
    project.members.some((m) => m.id === currentUserId && m.role === "admin");
  const canAssign = () => isOwner() || isAdmin();

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try { 
      const [projectResp, tasksResp] = await Promise.all([
        projectService.getProjectById(projectId),
        taskService.getTasksByProject(projectId),
      ]);

      const projectData = projectResp.data.project || projectResp.data;
      setProject(projectData);

      const taskList = tasksResp.data.tasks || [];
      setTasks(taskList);

      // Fetch members
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
      console.error("Error fetching data:", err);
      setError(err.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
      
  }
  , [projectId]);

  const handleAssignTask = async (taskId, newAssigneeId) => {
    try {
      await taskService.assignTask(projectId, taskId, newAssigneeId);

      setTasks((prev) =>
        prev.map((t) =>
          t._id === taskId ? { ...t, assignedTo: newAssigneeId } : t
        )
      );
    } catch (err) {
      console.error("Error assigning task:", err);
      alert("Failed to assign task");
    }
  };

  const handleBulkAssign = async (assigneeId) => {
    if (selectedTasks.length === 0) return;

    setBulkAssigning(true);
    try {
      await Promise.all(
        selectedTasks.map((taskId) =>
          taskService.assignTask(projectId, taskId, assigneeId)
        )
      );

      setTasks((prev) =>
        prev.map((t) =>
          selectedTasks.includes(t._id) ? { ...t, assignedTo: assigneeId } : t
        )
      );
      setSelectedTasks([]);
    } catch (err) {
      console.error("Error bulk assigning:", err);
      alert("Failed to bulk assign tasks");
    } finally {
      setBulkAssigning(false);
    }
  };

  const getMemberName = (id) => membersMap[id]?.name || "Unknown";

  const memberOptions = React.useMemo(() => {
    const options = [
      { 
        value: null, 
        label: "⭕ Unassigned",
      },
      ...Object.keys(membersMap)
        .map((id) => ({
          value: id,
          label: `👤 ${membersMap[id].name}`,
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    ];

    return options;
  }, [membersMap]);

  // ✅ Filter Options for react-select
  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "todo", label: "📝 To Do" },
    { value: "in progress", label: "⚡ In Progress" },
    { value: "to review", label: "👀 To Review" },
    { value: "done", label: "✅ Done" },
  ];

  const assignmentOptions = [
    { value: "all", label: "All Tasks" },
    { value: "assigned", label: "✅ Assigned" },
    { value: "unassigned", label: "⭕ Unassigned" },
  ];

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus.value === "all" || task.status === filterStatus.value;

    const matchesAssignment =
      filterAssignment.value === "all" ||
      (filterAssignment.value === "assigned" && task.assignedTo) ||
      (filterAssignment.value === "unassigned" && !task.assignedTo);

    return matchesSearch && matchesStatus && matchesAssignment;
  });

  // Member workload
  const memberWorkload = {};
  tasks.forEach((task) => {
    if (task.assignedTo) {
      if (!memberWorkload[task.assignedTo]) {
        memberWorkload[task.assignedTo] = { total: 0, completed: 0 };
      }
      memberWorkload[task.assignedTo].total++;
      if (task.status === "done") {
        memberWorkload[task.assignedTo].completed++;
      }
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#E31B54] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assignments...</p>
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
          <h3 className="text-2xl font-bold text-gray-900">Task Assignments</h3>
          <p className="text-sm text-gray-600 mt-1">
            {canAssign()
              ? "Manage task assignments for your team"
              : "View task assignments"}
          </p>
        </div>
      </div>

      {/* Team Workload Overview */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-[#E31B54]/10 to-[#E91E63]/10 px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
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
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            Team Workload
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.keys(membersMap).map((memberId) => {
              const workload = memberWorkload[memberId] || {
                total: 0,
                completed: 0,
              };
              const completionRate =
                workload.total > 0
                  ? Math.round((workload.completed / workload.total) * 100)
                  : 0;

              return (
                <div
                  key={memberId}
                  className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-[#E31B54] transition-all"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`w-12 h-12 rounded-full bg-gradient-to-br ${getRandomColor(
                        memberId
                      )} flex items-center justify-center text-white text-sm font-bold shadow-md`}
                    >
                      {getInitials(getMemberName(memberId))}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {getMemberName(memberId)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {workload.total} tasks assigned
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-bold text-gray-900">
                        {workload.completed}/{workload.total}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-full bg-gradient-to-r from-[#E31B54] to-[#E91E63] rounded-full transition-all duration-300"
                        style={{ width: `${completionRate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
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
                className="w-full h-10 pl-10 pr-4 border-2 border-gray-200 rounded-lg focus:border-[#E31B54] focus:outline-none transition-colors text-sm"
              />
            </div>
          </div>

          {/* Status Filter - ✅ Now using react-select */}
          <div>
            <Select
              value={filterStatus}
              onChange={setFilterStatus}
              options={statusOptions}
              styles={selectStyles}
              isSearchable={false}
              menuPortalTarget={document.body}
              menuPosition="fixed"
            />
          </div>

          {/* Assignment Filter - ✅ Now using react-select */}
          <div>
            <Select
              value={filterAssignment}
              onChange={setFilterAssignment}
              options={assignmentOptions}
              styles={selectStyles}
              isSearchable={false}
              menuPortalTarget={document.body}
              menuPosition="fixed"
            />
          </div>
        </div>

        {/* Bulk Actions */}
        {canAssign() && selectedTasks.length > 0 && (
          <div className="mt-4 p-3 bg-purple-50 border-2 border-purple-200 rounded-lg">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-purple-900">
                  {selectedTasks.length} task{selectedTasks.length !== 1 ? "s" : ""} selected
                </span>
                <button
                  onClick={() => setSelectedTasks([])}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium underline"
                >
                  Clear selection
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-purple-700 font-medium">
                  Assign to:
                </span>
                <div className="w-56">
                  <Select
                    options={memberOptions}
                    onChange={(selected) => handleBulkAssign(selected.value)}
                    styles={selectStyles}
                    placeholder="Select member..."
                    isDisabled={bulkAssigning}
                    isSearchable={false}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tasks Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-[#E31B54]/10 to-[#E91E63]/10 px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">
            Tasks ({filteredTasks.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {canAssign() && (
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={
                        selectedTasks.length === filteredTasks.length &&
                        filteredTasks.length > 0
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTasks(filteredTasks.map((t) => t._id));
                        } else {
                          setSelectedTasks([]);
                        }
                      }}
                      className="w-4 h-4 text-[#E31B54] border-gray-300 rounded focus:ring-[#E31B54] cursor-pointer"
                    />
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Task
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td
                    colSpan={canAssign() ? 6 : 5}
                    className="px-6 py-12 text-center"
                  >
                    <div className="flex flex-col items-center">
                      <svg
                        className="w-12 h-12 text-gray-300 mb-3"
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
                      <p className="text-gray-500 font-medium">No tasks found</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Try adjusting your filters
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => (
                  <tr
                    key={task._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {canAssign() && (
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedTasks.includes(task._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTasks([...selectedTasks, task._id]);
                            } else {
                              setSelectedTasks(
                                selectedTasks.filter((id) => id !== task._id)
                              );
                            }
                          }}
                          className="w-4 h-4 text-[#E31B54] border-gray-300 rounded focus:ring-[#E31B54] cursor-pointer"
                        />
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
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
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-900 truncate">
                            {task.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {task.activity}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          task.status === "done"
                            ? "bg-green-100 text-green-700"
                            : task.status === "in progress"
                            ? "bg-blue-100 text-blue-700"
                            : task.status === "to review"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {task.status === "done"
                          ? "✅ Done"
                          : task.status === "in progress"
                          ? "⚡ In Progress"
                          : task.status === "to review"
                          ? "👀 Review"
                          : "📝 To Do"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                          priorityColors[task.priority]
                        }`}
                      >
                        {task.priority === "high"
                          ? "🔴 High"
                          : task.priority === "medium"
                          ? "🟡 Medium"
                          : "🔵 Low"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {task.assignedTo ? (
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-8 h-8 rounded-full bg-gradient-to-br ${getRandomColor(
                              task.assignedTo
                            )} flex items-center justify-center text-white text-xs font-bold`}
                          >
                            {getInitials(getMemberName(task.assignedTo))}
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {getMemberName(task.assignedTo)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 italic">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {canAssign() && (
                          <div className="w-48">
                            <Select
                              value={memberOptions.find(
                                (o) => o.value === task.assignedTo
                              )}
                              onChange={(selected) =>
                                handleAssignTask(task._id, selected.value)
                              }
                              options={memberOptions}
                              styles={selectStyles}
                              placeholder="Assign..."
                              isSearchable={false}
                              menuPortalTarget={document.body}
                              menuPosition="fixed"
                            />
                          </div>
                        )}
                        <button
                          onClick={() =>
                            navigate(`/projects/${projectId}/tasks/${task._id}`)
                          }
                          className="p-2 text-gray-400 hover:text-[#E31B54] transition-colors rounded-lg hover:bg-gray-100"
                          title="View details"
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
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TaskAssignment;