import React, { useState, useEffect, useRef } from "react";
import { taskService } from '../../api';
import {
  priorityColors,
  statusColors,
  statusLabels,
  activityIcons,
} from "../../utils/tasksDetailsStyles";
import { getInitials, getRandomColor } from "../../utils/avatarUtils";
import { Calendar } from "lucide-react";

const TaskListCard = ({
  task,
  onClick,
  getUserName,
  canManageTask,
  canUpdateTaskStatus,
  onRefresh,
  isVisibleAsAdmin,
}) => {
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(task.status);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const statusMenuRef = useRef(null);

  // Update local status when task changes
  useEffect(() => {
    setCurrentStatus(task.status);
  }, [task.status]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        statusMenuRef.current &&
        !statusMenuRef.current.contains(event.target)
      ) {
        setShowStatusMenu(false);
      }
    };

    if (showStatusMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showStatusMenu]);

  const handleStatusChange = async (e, newStatus) => {
    e.stopPropagation();
    if (!canUpdateTaskStatus) return;

    const previousStatus = currentStatus;
    setUpdatingStatus(true);
    setShowStatusMenu(false);
    setCurrentStatus(newStatus); // Optimistic update

    try {
      await taskService.updateTaskStatus(task.projectId, task._id, newStatus);
      onRefresh(); // Only refresh after success
    } catch (err) {
      console.error("Error updating status:", err);
      setCurrentStatus(previousStatus); // Revert on error
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!canManageTask) return;

    setDeleting(true);
    try {
      await taskService.deleteTask(task.projectId, task._id);
      onRefresh();
    } catch (err) {
      console.error("Error deleting task:", err);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div
      className="bg-white rounded-xl border border-gray-200 hover:border-[#E31B54] hover:shadow-md transition-all cursor-pointer group"
      onClick={onClick}
    >
      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* Activity Icon */}
          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#E31B54] group-hover:text-white transition-all">
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
                d={activityIcons[task.activity] || activityIcons.OTHER}
              />
            </svg>
          </div>

          {/* Task Info */}
          <div className="flex-1 min-w-0">
            {/* Admin Badge - Show when task is visible due to admin role */}
            {isVisibleAsAdmin && (
              <div className="mb-2">
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-yellow-400/20 to-amber-500/20 text-amber-700 rounded-lg text-xs font-semibold border border-yellow-400/30">
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  Admin Access
                </span>
              </div>
            )}
            
            {/* Project Name Badge - NEW */}
            <div className="mb-2">
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-[#E31B54]/10 to-[#E91E63]/10 text-[#E31B54] rounded-lg text-xs font-semibold">
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                  />
                </svg>
                <span className="truncate max-w-[150px]">
                  {task.projectName}
                </span>
              </span>
            </div>

            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1 min-w-0">
                <h4 className="text-base font-bold text-gray-900 group-hover:text-[#E31B54] transition-colors line-clamp-1">
                  {task.title}
                </h4>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Priority Badge */}
                <span
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                    priorityColors[task.priority]
                  }`}
                >
                  {task.priority === "high"
                    ? "🔴"
                    : task.priority === "medium"
                    ? "🟡"
                    : "🔵"}
                </span>

                {/* Delete Button - Only reserve space if user can delete */}
                {canManageTask && (
                  <div className="w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!showDeleteConfirm ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDeleteConfirm(true);
                        }}
                        className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all flex items-center justify-center"
                        title="Delete"
                      >
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    ) : (
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(e);
                          }}
                          disabled={deleting}
                          className="w-7 h-7 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-all flex items-center justify-center text-xs font-bold disabled:opacity-50"
                          title="Confirm Delete"
                        >
                          {deleting ? (
                            <svg
                              className="w-3 h-3 animate-spin"
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
                          ) : (
                            "✓"
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDeleteConfirm(false);
                          }}
                          className="w-7 h-7 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all flex items-center justify-center text-xs font-bold"
                          title="Cancel"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {task.description && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                {task.description}
              </p>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Status - Clickable */}
              {canUpdateTaskStatus ? (
                <div
                  className="relative"
                  ref={statusMenuRef}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setShowStatusMenu(!showStatusMenu)}
                    disabled={updatingStatus}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold border ${
                      statusColors[currentStatus]
                    } hover:opacity-80 transition-opacity flex items-center gap-1`}
                  >
                    {updatingStatus ? (
                      <svg
                        className="w-3 h-3 animate-spin"
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
                    ) : (
                      <>
                        {statusLabels[currentStatus]}
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </>
                    )}
                  </button>

                  {showStatusMenu && (
                    <div className="absolute left-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50 min-w-[140px]">
                      {Object.keys(statusLabels).map((status) => (
                        <button
                          key={status}
                          onClick={(e) => handleStatusChange(e, status)}
                          className={`w-full px-3 py-2 text-left text-xs font-semibold hover:bg-gray-50 transition-colors ${
                            currentStatus === status
                              ? "bg-gray-100 text-[#E31B54]"
                              : "text-gray-700"
                          }`}
                        >
                          {statusLabels[status]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <span
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border ${
                    statusColors[currentStatus]
                  }`}
                >
                  {statusLabels[currentStatus]}
                </span>
              )}

              {/* Activity Type */}
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
                {task.activity}
              </span>

              {/* Assigned User */}
              {task.assignedTo && (
                <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-2 py-1">
                  <div
                    className={`w-5 h-5 rounded-full bg-gradient-to-br ${getRandomColor(
                      task.assignedTo
                    )} flex items-center justify-center text-white text-xs font-bold`}
                  >
                    {getInitials(getUserName(task.assignedTo))}
                  </div>
                  <span className="text-xs font-medium text-gray-700">
                    {getUserName(task.assignedTo)}
                  </span>
                </div>
              )}

              {/* Comments Count */}
              {task.comments && task.comments.length > 0 && (
                <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 rounded-lg px-2 py-1">
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  {task.comments.length}
                </span>
              )}

              {/* Due Date*/}
              
              <span className="text-xs text-gray-500 flex gap-1 justify-center items-center bg-gray-50 rounded-lg px-2 py-1">
                <Calendar size={14} color="black"/>
                <span > Due To : </span>
                <span className="text-black">

                {task.dueDate ? (

                  new Date(task.dueDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year:"numeric"
                    
                  }
                )
              ):
              "not set"
              }

                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskListCard;