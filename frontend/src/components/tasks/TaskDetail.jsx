import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { taskService, projectService, authService } from '../../api';
import Select from "react-select";
import { getInitials, getRandomColor } from "../../utils/avatarUtils";
import {activityIcons , priorityColors,statusLabels,statusColors, selectStyles, activityOptions, priorityOptions, statusOptions } from "../../utils/tasksDetailsStyles";
// Custom styles for react-select


const TaskDetail = () => {
  const [task, setTask] = useState(null);
  const [project, setProject] = useState(null);
  const [membersMap, setMembersMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState({});
  const [updating, setUpdating] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Comments state
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentError, setCommentError] = useState("");
  const [deletingComment, setDeletingComment] = useState(null);

  const { projectId, taskId } = useParams();
  const navigate = useNavigate();

  const currentUserId = JSON.parse(localStorage.getItem("user"))?.id;
  const currentUserName = JSON.parse(localStorage.getItem("user"))?.name;

  const isOwner = () => {
    if (!project || !project.ownedBy) return false;
    return project.ownedBy === currentUserId;
  };

  const isAdmin = () => {
    if (!project || !project.members) return false;
    return project.members.some(
      (m) => m.id === currentUserId && m.role === "admin"
    );
  };

  const canEditTasks = () => isOwner() || isAdmin();

  const getMemberName = (memberId) => {
    if (!memberId) return "";
    if (membersMap[memberId]) return membersMap[memberId].name;
    return "Unknown Member";
  };

  // Fetch comments
  const fetchComments = async () => {
    try {
      setCommentsLoading(true);
      const response = await taskService.getComments(projectId, taskId);


      setComments(response.data.comments || []);
    } catch (err) {
      console.error("Error fetching comments:", err);
    } finally {
      setCommentsLoading(false);
    }
  };

  // Add comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setCommentLoading(true);
    setCommentError("");

    try {
      const response = await taskService.addComment(projectId, taskId, newComment);

      setComments([...comments, response.data.comment]);
      setNewComment("");
    } catch (err) {
      console.error("Error adding comment:", err);
      setCommentError(err.response?.data?.message || "Failed to add comment");
    } finally {
      setCommentLoading(false);
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId) => {
    setDeletingComment(commentId);
    try {
      await taskService.deleteComment(projectId, taskId, commentId);

      setComments(comments.filter((c) => c._id !== commentId));
    } catch (err) {
      console.error("Error deleting comment:", err);
      alert(err.response?.data?.message || "Failed to delete comment");
    } finally {
      setDeletingComment(null);
    }
  };

  useEffect(() => {
    const fetchProjectAndTask = async () => {
      try {
        const projectResponse = await projectService.getProjectById(projectId);
        const projectData =
          projectResponse.data.project || projectResponse.data;
        setProject(projectData);

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

        const taskResponse = await taskService.getTaskById(projectId, taskId);
        const taskData = taskResponse.data.task || taskResponse.data;
        setTask(taskData);
        setEditedTask(taskData);

        // Fetch comments
        await fetchComments();
      } catch (err) {
        console.error("Error fetching task or project:", err);
        setError(err.response?.data?.message || "Failed to load task details");
      } finally {
        setLoading(false);
      }
    };

    fetchProjectAndTask();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, taskId]);

  const handleUpdateTask = async (e) => {
    e.preventDefault();

    if (!canEditTasks()) {
      setError("You don't have permission to edit this task");
      return;
    }

    setUpdating(true);
    try {
      const response = await taskService.updateTask(projectId, taskId, editedTask);

      const updated = response.data.task || response.data;
      setTask(updated);
      setIsEditing(false);
      setError("");
    } catch (err) {
      console.error("Error updating task:", err);
      setError(err.response?.data?.message || "Failed to update task");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!canEditTasks()) {
      setError("You don't have permission to delete this task");
      setShowDeleteModal(false);
      return;
    }

    setDeleting(true);
    try {
      await taskService.deleteTask(projectId, taskId);

      navigate(`/projects/${projectId}`, {
        state: { successMessage: "Task deleted successfully" },
      });
    } catch (err) {
      console.error("Error deleting task:", err);
      setError(err.response?.data?.message || "Failed to delete task");
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleQuickStatusChange = async (newStatus) => {
    if (!canEditTasks()) return;

    try {
      const response = await taskService.updateTask(projectId, taskId, { ...task, status: newStatus });

      const updated = response.data.task || response.data;
      setTask(updated);
      setEditedTask(updated);
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  // Create options for react-select

  const assigneeOptions = React.useMemo(() => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFF5F8] via-white to-[#FFF0F5] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#E31B54] mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading task...</p>
        </div>
      </div>
    );
  }

  if (error && !task) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFF5F8] via-white to-[#FFF0F5] flex items-center justify-center p-4">
        <div className="bg-white rounded-[25px] shadow-2xl p-8 max-w-md w-full border-2 border-red-200">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
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
          </div>
          <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
            Error Loading Task
          </h2>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <button
            onClick={() => navigate(`/projects/${projectId}`)}
            className="w-full px-6 py-3 bg-gradient-to-r from-[#E31B54] to-[#E91E63] text-white rounded-full font-semibold hover:shadow-lg transition-all"
          >
            Back to Project
          </button>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFF5F8] via-white to-[#FFF0F5] flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Task not found</p>
          <button
            onClick={() => navigate(`/projects/${projectId}`)}
            className="px-6 py-3 bg-gradient-to-r from-[#E31B54] to-[#E91E63] text-white rounded-full font-semibold hover:shadow-lg transition-all"
          >
            Back to Project
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF5F8] via-white to-[#FFF0F5] p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(`/projects/${projectId}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-[#E31B54] transition-colors"
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span className="font-medium">Back to Project</span>
          </button>

          <div className="flex gap-2">
            {!isEditing && canEditTasks() && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-gradient-to-r from-[#E31B54] to-[#E91E63] text-white rounded-full font-medium hover:shadow-lg transition-all flex items-center gap-2"
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
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Task Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Task Header Card */}
            <div className="bg-white rounded-[25px] shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-[#E31B54]/10 to-[#E91E63]/10 p-6 border-b border-gray-200">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#E31B54] to-[#E91E63] rounded-2xl flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-7 h-7 text-white"
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
                  <div className="flex-1">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedTask.title || ""}
                        onChange={(e) =>
                          setEditedTask({
                            ...editedTask,
                            title: e.target.value,
                          })
                        }
                        className="text-2xl font-bold text-gray-900 w-full border-2 border-gray-200 rounded-xl px-4 py-2 focus:border-[#E31B54] focus:outline-none"
                      />
                    ) : (
                      <h1 className="text-2xl font-bold text-gray-900">
                        {task.title}
                      </h1>
                    )}
                    <p className="text-sm text-gray-600 mt-1">
                      {task.activity}
                    </p>
                  </div>
                </div>
              </div>

              {/* Task Body */}
              <div className="p-6 space-y-6">
                {/* Description */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Description
                  </label>
                  {isEditing ? (
                    <textarea
                      rows={6}
                      value={editedTask.description || ""}
                      onChange={(e) =>
                        setEditedTask({
                          ...editedTask,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#E31B54] focus:outline-none resize-none"
                      placeholder="Add a description..."
                    />
                  ) : (
                    <p className="text-gray-700 bg-gray-50 rounded-xl p-4">
                      {task.description || "No description provided."}
                    </p>
                  )}
                </div>

                {/* Edit Form Fields with react-select */}
                {isEditing && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Activity Type with react-select */}
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Activity Type
                        </label>
                        <Select
                          value={activityOptions.find(
                            (opt) => opt.value === editedTask.activity
                          )}
                          onChange={(option) =>
                            setEditedTask({
                              ...editedTask,
                              activity: option.value,
                            })
                          }
                          options={activityOptions}
                          styles={selectStyles}
                          isSearchable={false}
                        />
                      </div>

                      {/* Priority with react-select */}
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Priority
                        </label>
                        <Select
                          value={priorityOptions.find(
                            (opt) => opt.value === editedTask.priority
                          )}
                          onChange={(option) =>
                            setEditedTask({
                              ...editedTask,
                              priority: option.value,
                            })
                          }
                          options={priorityOptions}
                          styles={selectStyles}
                          isSearchable={false}
                        />
                      </div>
                    </div>

                    {/* Status with react-select */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Status
                      </label>
                      <Select
                        value={statusOptions.find(
                          (opt) => opt.value === editedTask.status
                        )}
                        onChange={(option) =>
                          setEditedTask({ ...editedTask, status: option.value })
                        }
                        options={statusOptions}
                        styles={selectStyles}
                        isSearchable={false}
                      />
                    </div>

                    {/* Assign To with react-select */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Assign To
                      </label>
                      
                      <Select
                        value={assigneeOptions.find(
                          (opt) => opt.value === (editedTask.assignedTo || "")
                        )}
                        onChange={(option) =>
                          setEditedTask({
                            ...editedTask,
                            assignedTo: option.value || null,
                          })
                        }
                        options={assigneeOptions}
                        styles={selectStyles}
                        isSearchable={true}
                        menuPlacement="top"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={() => setShowDeleteModal(true)}
                        className="px-4 py-2 bg-red-50 text-red-600 rounded-full font-medium hover:bg-red-100 transition-all"
                      >
                        Delete Task
                      </button>
                      <div className="flex-1"></div>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-full font-medium hover:bg-gray-50 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleUpdateTask}
                        disabled={updating}
                        className="px-6 py-2 bg-gradient-to-r from-[#E31B54] to-[#E91E63] text-white rounded-full font-medium hover:shadow-lg disabled:opacity-50 transition-all"
                      >
                        {updating ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Comments Section */}
            {!isEditing && (
              <div className="bg-white rounded-[25px] shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-[#E31B54]/10 to-[#E91E63]/10 p-6 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <svg
                      className="w-6 h-6 text-[#E31B54]"
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
                    <span className="px-2 py-0.5 bg-[#E31B54] text-white text-xs rounded-full">
                      {comments.length}
                    </span>
                  </h3>
                </div>

                <div className="p-6 space-y-4">
                  {/* Add Comment Form */}
                  <form onSubmit={handleAddComment} className="space-y-3">
                    <div className="flex gap-3">
                      <div
                        className={`w-10 h-10 rounded-full bg-gradient-to-br ${getRandomColor(
                          currentUserId
                        )} flex items-center justify-center text-white font-bold flex-shrink-0`}
                      >
                        {getInitials(currentUserName)}
                      </div>
                      <div className="flex-1">
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Add a comment..."
                          rows={3}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#E31B54] focus:outline-none resize-none"
                        />
                      </div>
                    </div>

                    {commentError && (
                      <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded-lg">
                        <p className="text-sm text-red-700">{commentError}</p>
                      </div>
                    )}

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={commentLoading || !newComment.trim()}
                        className="px-6 py-2 bg-gradient-to-r from-[#E31B54] to-[#E91E63] text-white rounded-full font-medium hover:shadow-lg disabled:opacity-50 transition-all flex items-center gap-2"
                      >
                        {commentLoading ? (
                          <>
                            <svg
                              className="animate-spin h-4 w-4"
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
                            Posting...
                          </>
                        ) : (
                          <>
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
                                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                              />
                            </svg>
                            Post Comment
                          </>
                        )}
                      </button>
                    </div>
                  </form>

                  {/* Comments List */}
                  <div className="space-y-4 pt-4 border-t border-gray-200">
                    {commentsLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#E31B54] mx-auto"></div>
                        <p className="text-sm text-gray-500 mt-2">
                          Loading comments...
                        </p>
                      </div>
                    ) : comments.length === 0 ? (
                      <div className="text-center py-8">
                        <svg
                          className="w-16 h-16 text-gray-300 mx-auto mb-3"
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
                        <p className="text-gray-500 font-medium">
                          No comments yet
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          Be the first to comment on this task
                        </p>
                      </div>
                    ) : (
                      comments.map((comment) => (
                        <div key={comment._id} className="flex gap-3 group">
                          <div
                            className={`w-10 h-10 rounded-full bg-gradient-to-br ${getRandomColor(
                              comment.authorId
                            )} flex items-center justify-center text-white font-bold flex-shrink-0`}
                          >
                            {getInitials(getMemberName(comment.authorId))}
                          </div>
                          <div className="flex-1 bg-gray-50 rounded-xl p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-semibold text-gray-900 text-sm">
                                  {getMemberName(comment.authorId)}
                                  {comment.userId === currentUserId && (
                                    <span className="ml-2 text-xs text-gray-500">
                                      (You)
                                    </span>
                                  )}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(comment.createdAt).toLocaleString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )}
                                </p>
                              </div>
                              {(comment.authorId === currentUserId ||
                                canEditTasks()) && (
                                <button
                                  onClick={() =>
                                    handleDeleteComment(comment._id)
                                  }
                                  disabled={deletingComment === comment._id}
                                  className="opacity-0 group-hover:opacity-100 p-1 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                  title="Delete comment"
                                >
                                  {deletingComment === comment._id ? (
                                    <svg
                                      className="animate-spin h-4 w-4"
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
                                  )}
                                </button>
                              )}
                            </div>
                            <p className="text-gray-700 text-sm whitespace-pre-wrap">
                              {comment.text}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Metadata & Workflow */}
          <div className="space-y-6">
            {/* Status Workflow Card */}
            {!isEditing && canEditTasks() && (
              <div className="bg-white rounded-[25px] shadow-lg border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  {["todo", "in progress", "to review", "done"].map(
                    (status) => (
                      <button
                        key={status}
                        onClick={() => handleQuickStatusChange(status)}
                        disabled={task.status === status}
                        className={`w-full px-4 py-3 rounded-xl font-medium text-sm transition-all flex items-center justify-between ${
                          task.status === status
                            ? `${statusColors[status]} border-2 cursor-default`
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100 border-2 border-transparent"
                        }`}
                      >
                        <span>{statusLabels[status]}</span>
                        {task.status === status && (
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
                        )}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Task Meta Card */}
            {!isEditing && (
              <div className="bg-white rounded-[25px] shadow-lg border border-gray-100 p-6 space-y-4">
                <h3 className="text-lg font-bold text-gray-900">
                  Task Details
                </h3>

                {/* Status */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase block mb-2">
                    Status
                  </label>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${
                      statusColors[task.status]
                    }`}
                  >
                    {statusLabels[task.status]}
                  </span>
                </div>

                {/* Priority */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase block mb-2">
                    Priority
                  </label>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${
                      priorityColors[task.priority]
                    }`}
                  >
                    {task.priority.charAt(0).toUpperCase() +
                      task.priority.slice(1)}
                  </span>
                </div>

                {/* Assigned To */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase block mb-2">
                    Assigned To
                  </label>
                  {task.assignedTo ? (
                    <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
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
                    <span className="text-sm text-gray-500">Unassigned</span>
                  )}
                </div>

                {/* Created Date */}
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase block mb-2">
                    Created
                  </label>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
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
                    {new Date(task.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && canEditTasks() && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="bg-white rounded-[25px] max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-red-600 p-6 rounded-t-[25px]">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                Delete Task
              </h3>
              <p className="text-red-100 text-sm mt-2">
                This action cannot be undone!
              </p>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-gray-700">
                Are you sure you want to delete this task? All information will
                be permanently removed.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 h-12 border-2 border-gray-300 text-gray-700 rounded-full font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteTask}
                  disabled={deleting}
                  className="flex-1 h-12 bg-red-600 text-white rounded-full font-semibold hover:bg-red-700 disabled:opacity-50 transition-all"
                >
                  {deleting ? "Deleting..." : "Delete Forever"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskDetail;
