import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { projectService, taskService } from '../../api';
import Select from "react-select";
import {
  priorityColors,
  statusColors,
  statusLabels,
  activityIcons,
} from "../../utils/tasksDetailsStyles";
import { getInitials, getRandomColor } from "../../utils/avatarUtils";
import { fetchProjectMembers, getUserName } from "../../utils/userUtils";

const selectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: "40px",
    borderRadius: "12px",
    borderWidth: "2px",
    borderColor: state.isFocused ? "#E31B54" : "#E5E7EB",
    boxShadow: "none",
    "&:hover": { borderColor: "#E31B54" },
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
    zIndex: 100,
  }),
};

const TaskDetailModal = ({
  task,
  onClose,
  onRefresh,
  onUpdateTask,
  onAddComment,
  onDeleteComment,
  canManageTask,
  canUpdateTaskStatus,
  currentUserId,
}) => {
  const navigate = useNavigate();
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);
  const [assignedMember, setAssignedMember] = useState(null);
  const [updatingAssignment, setUpdatingAssignment] = useState(false);
  const [deletingComment, setDeletingComment] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(task.status);
  const [projectMembers, setProjectMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [membersMap, setMembersMap] = useState({});

  // Fetch project members when modal opens
  useEffect(() => {
    const loadProjectMembers = async () => {
      setLoadingMembers(true);
      try {
        const response = await projectService.getProjectById(task.projectId);
        const project = response.data.project || response.data;
        
        const { usersMap } = await fetchProjectMembers(project);
        setMembersMap(usersMap);
        
        // Convert map to array for select options
        const membersArray = Object.values(usersMap);
        setProjectMembers(membersArray);
      } catch (err) {
        console.error("Error fetching project members:", err);
      } finally {
        setLoadingMembers(false);
      }
    };

    loadProjectMembers();
  }, [task.projectId]);

  // Update assignedMember when membersMap is loaded
  useEffect(() => {
    if (task.assignedTo && Object.keys(membersMap).length > 0) {
      setAssignedMember({
        value: task.assignedTo,
        label: getUserName(task.assignedTo, membersMap)
      });
    }
  }, [task.assignedTo, membersMap]);

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setPosting(true);

    const tempComment = {
      _id: `temp-${Date.now()}`,
      text: newComment.trim(),
      authorId: currentUserId,
      createdAt: new Date().toISOString(),
    };

    onAddComment(task._id, tempComment);
    const commentText = newComment.trim();
    setNewComment("");

    try {
      const response = await taskService.addComment(task.projectId, task._id, commentText);

      onDeleteComment(task._id, tempComment._id);
      onAddComment(task._id, response.data.comment);
    } catch (err) {
      console.error("Error posting comment:", err);
      onDeleteComment(task._id, tempComment._id);
      setNewComment(commentText);
    } finally {
      setPosting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!canManageTask) return;

    setDeletingComment(commentId);
    onDeleteComment(task._id, commentId);

    try {
      await taskService.deleteComment(task.projectId, task._id, commentId);
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error("Error deleting comment:", err);
      onRefresh();
    } finally {
      setDeletingComment(null);
    }
  };

  const handleAssignMember = async (selectedOption) => {
    if (!canManageTask) return;

    setUpdatingAssignment(true);
    setAssignedMember(selectedOption);

    try {
      await taskService.assignTask(task.projectId, task._id, selectedOption ? selectedOption.value : null);

      onUpdateTask(task._id, {
        assignedTo: selectedOption ? selectedOption.value : null,
      });
    } catch (err) {
      console.error("Error assigning member:", err);
      setAssignedMember(
        task.assignedTo
          ? { value: task.assignedTo, label: getUserName(task.assignedTo, membersMap) }
          : null
      );
    } finally {
      setUpdatingAssignment(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!canUpdateTaskStatus) return;

    const previousStatus = selectedStatus;
    setUpdatingStatus(true);
    setSelectedStatus(newStatus);

    onUpdateTask(task._id, { status: newStatus });

    try {
      await taskService.updateTaskStatus(task.projectId, task._id, newStatus);
    } catch (err) {
      console.error("Error updating status:", err);
      setSelectedStatus(previousStatus);
      onUpdateTask(task._id, { status: previousStatus });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleEditTask = () => {
    navigate(`/projects/${task.projectId}/tasks/${task._id}`);
  };

  const getProjectMembersOptions = () => {
    return projectMembers.map((member) => ({
      value: member._id,
      label: member.name,
    }));
  };

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);

    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-start justify-center p-4 pt-10"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-5xl w-full shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#E31B54] to-[#E91E63] p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
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
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-bold text-white">
                    {task.title}
                  </h2>
                  <p className="text-white/80 text-sm">{task.projectName}</p>
                </div>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Edit Button - Only for owners/admins */}
              {canManageTask && (
                <button
                  onClick={handleEditTask}
                  className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all group"
                  title="Edit task"
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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
              )}

              {/* Close Button */}
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Left Column - Main Info (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {task.description && (
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-2">
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
                      d="M4 6h16M4 12h16m-7 6h7"
                    />
                  </svg>
                  Description
                </label>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {task.description}
                  </p>
                </div>
              </div>
            )}

            {/* Status Update Section */}
            {canUpdateTaskStatus && (
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase mb-3 flex items-center gap-2">
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
                      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                    />
                  </svg>
                  Update Status
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(statusLabels).map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      disabled={updatingStatus}
                      className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all border-2 disabled:opacity-50 ${
                        selectedStatus === status
                          ? statusColors[status] + " shadow-md"
                          : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {updatingStatus && selectedStatus === status ? (
                        <svg
                          className="w-4 h-4 animate-spin inline"
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
                        statusLabels[status]
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Comments Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
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
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  Comments
                  {task.comments && task.comments.length > 0 && (
                    <span className="text-sm text-gray-500">
                      ({task.comments.length})
                    </span>
                  )}
                </h3>
              </div>

              {/* Comments List */}
              <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                {loadingMembers ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E31B54]"></div>
                  </div>
                ) : task.comments && task.comments.length > 0 ? (
                  task.comments.map((comment) => (
                    <div
                      key={comment._id}
                      className="bg-gray-50 rounded-xl p-3 border border-gray-200 relative group"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-8 h-8 rounded-full bg-gradient-to-br ${getRandomColor(
                            comment.authorId
                          )} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
                        >
                          {getInitials(getUserName(comment.authorId, membersMap))}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-semibold text-gray-900">
                              {getUserName(comment.authorId, membersMap)}
                            </p>
                            <span className="text-xs text-gray-500">
                              {formatTimeAgo(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                            {comment.text}
                          </p>
                        </div>

                        {/* Delete Comment Button with Confirmation */}
                        {canManageTask && (
                          <div className="flex-shrink-0">
                            {showDeleteConfirm !== comment._id ? (
                              <button
                                onClick={() =>
                                  setShowDeleteConfirm(comment._id)
                                }
                                className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all flex items-center justify-center"
                                title="Delete comment"
                              >
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
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            ) : (
                              <div className="flex items-center gap-1 bg-red-50 rounded-lg px-1 py-1">
                                <span className="text-xs font-medium text-gray-700 px-1">
                                  Delete?
                                </span>
                                <button
                                  onClick={() =>
                                    handleDeleteComment(comment._id)
                                  }
                                  disabled={deletingComment === comment._id}
                                  className="w-6 h-6 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center"
                                  title="Confirm delete"
                                >
                                  {deletingComment === comment._id ? (
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
                                        d="M5 13l4 4L19 7"
                                      />
                                    </svg>
                                  )}
                                </button>
                                <button
                                  onClick={() => setShowDeleteConfirm(null)}
                                  className="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded-lg transition-all flex items-center justify-center"
                                  title="Cancel"
                                >
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
                                      d="M6 18L18 6M6 6l12 12"
                                    />
                                  </svg>
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-200">
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
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    <p className="text-sm text-gray-500 font-medium">
                      No comments yet
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Be the first to comment
                    </p>
                  </div>
                )}
              </div>

              {/* Add Comment Form */}
              {(canUpdateTaskStatus || canManageTask) && (
                <form onSubmit={handlePostComment} className="relative">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    disabled={posting}
                    rows={3}
                    className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-[#E31B54] focus:outline-none transition-colors resize-none disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={posting || !newComment.trim()}
                    className="absolute right-3 bottom-3 w-9 h-9 bg-gradient-to-r from-[#E31B54] to-[#E91E63] rounded-full flex items-center justify-center hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {posting ? (
                      <svg
                        className="w-4 h-4 text-white animate-spin"
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
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        />
                      </svg>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right Column - Metadata Sidebar */}
          <div className="space-y-4">
            {/* Task Details Card */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
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
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Task Details
              </h3>

              {/* Priority */}
              <div className="mb-4">
                <label className="text-xs font-semibold text-gray-500 uppercase block mb-2">
                  Priority
                </label>
                <span
                  className={`inline-block px-3 py-1.5 rounded-lg text-sm font-semibold border ${
                    priorityColors[task.priority]
                  }`}
                >
                  {task.priority.charAt(0).toUpperCase() +
                    task.priority.slice(1)}
                </span>
              </div>

              {/* Activity Type */}
              <div className="mb-4">
                <label className="text-xs font-semibold text-gray-500 uppercase block mb-2">
                  Activity Type
                </label>
                <span className="inline-block px-3 py-1.5 bg-white text-gray-700 rounded-lg text-sm font-medium border border-gray-200">
                  {task.activity}
                </span>
              </div>

              {/* Assigned To */}
              <div className="mb-4">
                <label className="text-xs font-semibold text-gray-500 uppercase block mb-2">
                  Assigned To
                </label>
                {loadingMembers ? (
                  <div className="flex items-center gap-2 bg-white rounded-lg p-2 border border-gray-200">
                    <div className="animate-pulse h-8 w-8 rounded-full bg-gray-200"></div>
                    <div className="animate-pulse h-4 w-24 bg-gray-200 rounded"></div>
                  </div>
                ) : canManageTask ? (
                  <Select
                    value={assignedMember}
                    onChange={handleAssignMember}
                    options={getProjectMembersOptions()}
                    styles={selectStyles}
                    isClearable
                    isDisabled={updatingAssignment}
                    placeholder="Assign member..."
                    className="text-sm"
                  />
                ) : task.assignedTo ? (
                  <div className="flex items-center gap-2 bg-white rounded-lg p-2 border border-gray-200">
                    <div
                      className={`w-8 h-8 rounded-full bg-gradient-to-br ${getRandomColor(
                        task.assignedTo
                      )} flex items-center justify-center text-white text-xs font-bold`}
                    >
                      {getInitials(getUserName(task.assignedTo, membersMap))}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {getUserName(task.assignedTo, membersMap)}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm text-gray-500 italic">
                    Unassigned
                  </span>
                )}
              </div>

              {/* Created Date */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase block mb-2">
                  Created
                </label>
                <div className="flex items-center gap-2 text-sm text-gray-700 bg-white rounded-lg p-2 border border-gray-200">
                  <svg
                    className="w-4 h-4 text-gray-500"
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
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
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
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Quick Actions
              </h3>

              {/* Edit Button in Quick Actions - Alternative placement */}
              {canManageTask && (
                <button
                  onClick={handleEditTask}
                  className="w-full px-4 py-2.5 bg-gradient-to-r from-[#E31B54] to-[#E91E63] hover:shadow-lg text-white rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 mb-2"
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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit Task
                </button>
              )}

              <button
                onClick={onClose}
                className="w-full px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 border border-gray-200"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;