import React, { useState, useEffect } from "react";
import { taskService } from '../../api';
import { getInitials, getRandomColor } from "../../utils/avatarUtils";

const ProjectOverview = ({ project, members, ownerData }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasksAndActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project._id]);

  const fetchTasksAndActivities = async () => {
    try {
      const response = await taskService.getTasksByProject(project._id);
      setTasks(response.data.tasks || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setLoading(false);
    }
  };

  // Calculate stats
  const stats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === "done").length,
    inProgress: tasks.filter((t) => t.status === "in progress").length,
    toReview: tasks.filter((t) => t.status === "to review").length,
    todo: tasks.filter((t) => t.status === "todo").length,
    teamSize: (project.members?.length || 0) + 1,
  };

  const completionRate =
    stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  // Task by status for chart - WITH TO REVIEW
  const statusData = [
    { status: "To Do", count: stats.todo, color: "bg-gray-400" },
    { status: "In Progress", count: stats.inProgress, color: "bg-blue-500" },
    { status: "To Review", count: stats.toReview, color: "bg-yellow-500" },
    { status: "Done", count: stats.completed, color: "bg-green-500" },
  ];

  // Get member activity (who has most tasks)
  const memberActivity = {};
  tasks.forEach((task) => {
    if (task.assignedTo) {
      memberActivity[task.assignedTo] =
        (memberActivity[task.assignedTo] || 0) + 1;
    }
  });

  const topContributors = Object.entries(memberActivity)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Calculate activity level based on tasks
  const getActivityLevel = () => {
    if (stats.total === 0)
      return { label: "Getting Started", color: "text-gray-500", icon: "🌱" };
    if (stats.inProgress > stats.total * 0.5)
      return { label: "Very Active", color: "text-green-600", icon: "🔥" };
    if (stats.inProgress > stats.total * 0.3)
      return { label: "Active", color: "text-blue-600", icon: "⚡" };
    if (stats.completed === stats.total)
      return { label: "Completed", color: "text-purple-600", icon: "🎉" };
    return { label: "Moderate", color: "text-yellow-600", icon: "📊" };
  };

  const activityLevel = getActivityLevel();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#E31B54]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main 2x2 Asymmetric Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* TOP LEFT - Project Health (Larger) */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl col-span-2 shadow-lg border-2 border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-[#E31B54] to-[#E91E63] px-6 py-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Project Health
            </h3>
          </div>
          <div className="p-6">
            {/* Mini Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {/* Total Tasks */}
              <div className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-xl mx-auto mb-2 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
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
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
                <p className="text-xs text-gray-600 font-semibold">
                  Total Tasks
                </p>
              </div>

              {/* Completed */}
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-200">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl mx-auto mb-2 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
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
                <p className="text-2xl font-bold text-green-700">
                  {stats.completed}
                </p>
                <p className="text-xs text-green-600 font-semibold">
                  {completionRate}% Done
                </p>
              </div>

              {/* Team Size */}
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border-2 border-purple-200">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl mx-auto mb-2 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
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
                </div>
                <p className="text-2xl font-bold text-purple-700">
                  {stats.teamSize}
                </p>
                <p className="text-xs text-purple-600 font-semibold">
                  Team Members
                </p>
              </div>

              {/* Activity Level */}
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200">
                <div className="text-3xl mb-2">{activityLevel.icon}</div>
                <p className={`text-sm font-bold ${activityLevel.color}`}>
                  {activityLevel.label}
                </p>
                <p className="text-xs text-blue-600 font-semibold">Status</p>
              </div>
            </div>

            {/* Progress Bar */}
            {stats.total > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">
                    Overall Progress
                  </span>
                  <span className="text-sm font-bold text-[#E31B54]">
                    {completionRate}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-[#E31B54] to-[#E91E63] transition-all duration-500 rounded-full"
                    style={{ width: `${completionRate}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* TOP RIGHT - Task Distribution */}
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
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Project Info
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase block mb-2">
                Owner
              </label>
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${getRandomColor(
                    project.ownedBy
                  )} flex items-center justify-center text-white text-sm font-bold shadow-md`}
                >
                  {getInitials(ownerData?.name || "Owner")}
                </div>
                <div>
                  <p className="text-gray-900 font-semibold">
                    {ownerData?.name || "Unknown"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {ownerData?.email || ""}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase block mb-2">
                Created
              </label>
              <div className="flex items-center gap-2 text-gray-700">
                <svg
                  className="w-4 h-4 text-gray-400"
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
                <span className="text-sm font-medium">
                  {new Date(project.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase block mb-2">
                Description
              </label>
              <p className="text-sm text-gray-700 leading-relaxed">
                {project.description || "No description provided."}
              </p>
            </div>
          </div>
        </div>

        {/* BOTTOM LEFT - Task Distribution */}
        <div className="bg-white rounded-2xl col-span-2 shadow-lg border border-gray-100 overflow-hidden">
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
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              Task Distribution
            </h3>
          </div>
          <div className="p-6">
            {stats.total > 0 ? (
              <div className="space-y-4">
                {statusData.map((item) => {
                  const percentage =
                    stats.total > 0 ? (item.count / stats.total) * 100 : 0;
                  return (
                    <div key={item.status}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">
                          {item.status}
                        </span>
                        <span className="text-sm text-gray-500">
                          {item.count} ({Math.round(percentage)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                        <div
                          className={`h-full ${item.color} transition-all duration-500 rounded-full`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <svg
                  className="w-12 h-12 text-gray-300 mx-auto mb-2"
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
                <p>No tasks yet</p>
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM RIGHT - Top Contributors */}
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
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
              </svg>
              Top Contributors
              {topContributors.length > 0 && (
                <span className="text-sm font-normal text-gray-500">
                  (Top {topContributors.length})
                </span>
              )}
            </h3>
          </div>
          <div className="p-6">
            {topContributors.length > 0 ? (
              <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                {topContributors.map(([memberId, taskCount], index) => {
                  const memberName = members[memberId]?.name || "Unknown";
                  return (
                    <div
                      key={memberId}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <span className="text-lg font-bold text-gray-400 w-6">
                        #{index + 1}
                      </span>
                      <div
                        className={`w-10 h-10 rounded-full bg-gradient-to-br ${getRandomColor(
                          memberId
                        )} flex items-center justify-center text-white text-sm font-bold shadow-md flex-shrink-0`}
                      >
                        {getInitials(memberName)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">
                          {memberName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {taskCount} tasks assigned
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <svg
                  className="w-12 h-12 text-gray-300 mx-auto mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                <p className="text-sm">No contributors yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e31b54;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #c01545;
        }
      `}</style>
    </div>
  );
};

export default ProjectOverview;
