import React, { useState, useEffect, useCallback, useRef } from "react";
import { projectService, taskService, authService } from '../../../api';
import { useNavigate } from "react-router-dom";
import Card from "../../common/Card";
import { getInitials, getRandomColor } from "../../../utils/avatarUtils";
import { MessageCircle, ChevronLeft, ChevronRight, Clock, Quote, Send, Loader2, RefreshCw } from 'lucide-react';

const ActivityCard = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);
  const [membersMap, setMembersMap] = useState({});
  const navigate = useNavigate();
  const isFetchingRef = useRef(false);

  // Fetch all comments from tasks where user is a member
  const fetchActivities = useCallback(async () => {
    if (isFetchingRef.current) {
      console.log("🔄 Already fetching activities, skipping...");
      return;
    }

    isFetchingRef.current = true;
    setLoading(true);

    try {
      // Get all projects where user is a member
      const projectsResponse = await projectService.getAllProjects();

      const projects = projectsResponse.data.projects || [];

      if (projects.length === 0) {
        setActivities([]);
        setLoading(false);
        isFetchingRef.current = false;
        return;
      }

      // Fetch tasks for all projects in parallel
      const taskPromises = projects.map((project) =>
        taskService.getTasksByProject(project._id)  
          .catch((err) => {
            console.error(
              `Error fetching tasks for project ${project._id}:`,
              err
            );
            return { data: { tasks: [] } };
          })
      );

      const tasksResponses = await Promise.all(taskPromises);

      // Combine all tasks with project info
      const allTasks = tasksResponses.flatMap((response, index) => {
        const tasks = response.data.tasks || [];
        return tasks.map((task) => ({
          ...task,
          projectId: projects[index]._id,
          projectName: projects[index].name,
        }));
      });

      // Filter tasks that have comments
      const tasksWithComments = allTasks.filter(
        (task) => task.comments && task.comments.length > 0
      );

      // Flatten all comments with task info
      const allComments = tasksWithComments.flatMap((task) =>
        task.comments.map((comment) => ({
          ...comment,
          taskId: task._id,
          taskTitle: task.title,
          projectId: task.projectId,
          projectName: task.projectName,
        }))
      );

      // Sort by date (newest first)
      allComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setActivities(allComments);

      // Fetch user data for comment authors
      const userIds = [
        ...new Set(allComments.map((c) => c.authorId).filter(Boolean)),
      ];

      if (userIds.length > 0) {
        const usersResponse = await authService.getUsersByIds(userIds);

        const users = usersResponse.data.users || [];
        const map = {};
        users.forEach((user) => {
          map[user._id] = user;
        });
        setMembersMap(map);
      }
    } catch (err) {
      console.error("Error fetching activities:", err);
      setError("Failed to load activities");
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
    
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  , [navigate]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const handlePostComment = async (e) => {
    e.preventDefault();

    if (!newComment.trim() || activities.length === 0) return;

    const currentActivity = activities[currentSlide];
    if (!currentActivity) return;

    setPosting(true);

    try {
      const currentUser = JSON.parse(localStorage.getItem("user"));

      const response = await taskService.addComment(currentActivity.projectId, currentActivity.taskId, newComment.trim());

      // Add new comment to activities
      const newCommentData = {
        ...response.data.comment,
        taskId: currentActivity.taskId,
        taskTitle: currentActivity.taskTitle,
        projectId: currentActivity.projectId,
        projectName: currentActivity.projectName,
        authorId: currentUser.id,
      };

      setActivities((prev) => [newCommentData, ...prev]);
      setNewComment("");
      setCurrentSlide(0); // Go to the newest comment

      // Add current user to members map if not already there
      if (!membersMap[currentUser.id]) {
        setMembersMap((prev) => ({
          ...prev,
          [currentUser.id]: {
            _id: currentUser.id,
            name: currentUser.name,
            email: currentUser.email,
          },
        }));
      }
    } catch (err) {
      console.error("Error posting comment:", err);
      setError("Failed to post comment");
      setTimeout(() => setError(""), 3000);
    } finally {
      setPosting(false);
    }
  };

  const handleNavigateToTask = (activity) => {
    navigate(`/projects/${activity.projectId}/tasks/${activity.taskId}`);
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
    });
  };

  const getUserName = (userId) => {
    return membersMap[userId]?.name || "Unknown User";
  };

  if (loading) {
    return (
      <Card className="h-full">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#E31B54] mx-auto mb-2"></div>
            <p className="text-xs text-gray-500">Loading activity...</p>
          </div>
        </div>
      </Card>
    );
  }

  const currentActivity = activities[currentSlide];
  const hasActivities = activities.length > 0;

  return (
    <Card className="h-full">
      <div className="relative h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </div>
            <h3 className="font-bold text-gray-900 text-sm sm:text-base">Recent Activity</h3>
          </div>
          {hasActivities && (
            <span className="text-[10px] sm:text-xs text-gray-500">
              {currentSlide + 1} / {activities.length}
            </span>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-lg flex-shrink-0">
            <p className="text-[10px] sm:text-xs text-red-600">{error}</p>
          </div>
        )}

        {/* Activity Content - Takes remaining space */}
        <div className="flex-1 flex items-center justify-center mb-3 relative overflow-hidden">
          {hasActivities ? (
            <>
              {/* Previous Button */}
              <button
                onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                disabled={currentSlide === 0}
                className="absolute left-0 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed z-10 border border-gray-200"
              >
                <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 text-gray-700" />
              </button>

              {/* Modern Activity Card */}
              <div className="w-full px-8 sm:px-10 h-full">
                <div className="h-full flex flex-col bg-gradient-to-br from-purple-50 via-white to-pink-50 rounded-2xl p-4 border border-purple-100 shadow-sm">
                  {/* Header with Project Info */}
                  <div className="flex items-start justify-between mb-3 flex-shrink-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0"></div>
                        <p className="text-[10px] sm:text-xs text-purple-600 font-semibold truncate">
                          {currentActivity.projectName}
                        </p>
                      </div>
                      <h4 
                        className="text-sm sm:text-base font-bold text-gray-900 truncate cursor-pointer hover:text-purple-600 transition-colors"
                        onClick={() => handleNavigateToTask(currentActivity)}
                      >
                        {currentActivity.taskTitle}
                      </h4>
                    </div>
                  </div>

                  {/* Author Card */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 mb-3 flex-shrink-0 border border-purple-100/50">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br ${getRandomColor(
                          currentActivity.authorId
                        )} flex items-center justify-center text-white text-xs sm:text-sm font-bold shadow-md flex-shrink-0`}
                      >
                        {getInitials(getUserName(currentActivity.authorId))}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                          {getUserName(currentActivity.authorId)}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <p className="text-[10px] sm:text-xs text-gray-500">
                            {formatTimeAgo(currentActivity.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Modern Comment Display */}
                  <div className="flex-1 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-dashed border-purple-200 p-3 sm:p-4 overflow-y-auto">
                      {/* Quote Icon */}
                      <Quote className="w-5 h-5 sm:w-6 sm:h-6 text-purple-300 mb-2" fill="currentColor" />
                      <p className="text-xs sm:text-sm text-gray-700 leading-relaxed italic">
                        "{currentActivity.text}"
                      </p>
                    </div>
                  </div>

                  {/* View Task Button */}
                  <button
                    onClick={() => handleNavigateToTask(currentActivity)}
                    className="mt-3 w-full py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-xs sm:text-sm font-semibold rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 flex-shrink-0"
                  >
                    <span>View Task</span>
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>

              {/* Next Button */}
              <button
                onClick={() =>
                  setCurrentSlide(
                    Math.min(activities.length - 1, currentSlide + 1)
                  )
                }
                disabled={currentSlide >= activities.length - 1}
                className="absolute right-0 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed z-10 border border-gray-200"
              >
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-700" />
              </button>
            </>
          ) : (
            // Empty State
            <div className="text-center py-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="w-8 h-8 sm:w-10 sm:h-10 text-purple-400" />
              </div>
              <p className="text-gray-500 text-xs sm:text-sm font-semibold mb-1">
                No activity yet
              </p>
              <p className="text-gray-400 text-[10px] sm:text-xs">
                Comments will appear here
              </p>
            </div>
          )}
        </div>

        {/* Comment Input - Only show if there's at least one activity */}
        {hasActivities && (
          <form onSubmit={handlePostComment} className="relative flex-shrink-0">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              disabled={posting}
              className="w-full h-9 sm:h-10 pl-3 sm:pl-4 pr-10 sm:pr-12 rounded-full bg-gray-50 border border-gray-200 focus:border-[#E31B54] focus:outline-none text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={posting || !newComment.trim()}
              className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-r from-[#E31B54] to-[#E91E63] rounded-full flex items-center justify-center hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {posting ? (
                <Loader2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white animate-spin" />
              ) : (
                <Send className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
              )}
            </button>
          </form>
        )}

        {/* Refresh Button */}
        <button
          onClick={fetchActivities}
          className="absolute top-0 right-0 w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all"
          title="Refresh activities"
        >
          <RefreshCw className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-600" />
        </button>
      </div>
    </Card>
  );
};

export default ActivityCard;
