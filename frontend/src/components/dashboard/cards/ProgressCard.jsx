import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectService, taskService } from '../../../api';
import Card from '../../common/Card';
import { getInitials, getRandomColor } from '../../../utils/avatarUtils';
import { BarChart3, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

const ProgressCard = () => {
  const [projects, setProjects] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const isFetchingRef = useRef(false);

  // Fetch projects with their tasks
  const fetchProjectsWithAnalytics = useCallback(async () => {
    if (isFetchingRef.current) {
      console.log('🔄 Already fetching analytics, skipping...');
      return;
    }

    isFetchingRef.current = true;
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Get all projects
      const projectsResponse = await projectService.getAllProjects();

      const projectsList = projectsResponse.data.projects || [];

      if (projectsList.length === 0) {
        setProjects([]);
        setLoading(false);
        isFetchingRef.current = false;
        return;
      }

      // Fetch tasks for all projects in parallel
      const projectsWithTasks = await Promise.all(
        projectsList.map(async (project) => {
          try {
            const tasksResponse = await taskService.getTasksByProject(project._id);

            const tasks = tasksResponse.data.tasks || [];

            // Calculate analytics
            const totalTasks = tasks.length;
            const todoTasks = tasks.filter(t => t.status === 'todo').length;
            const inProgressTasks = tasks.filter(t => t.status === 'in progress').length;
            const toReviewTasks = tasks.filter(t => t.status === 'to review').length;
            const doneTasks = tasks.filter(t => t.status === 'done').length;
            
            const highPriorityTasks = tasks.filter(t => t.priority === 'high').length;
            const mediumPriorityTasks = tasks.filter(t => t.priority === 'medium').length;
            const lowPriorityTasks = tasks.filter(t => t.priority === 'low').length;

            const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

            return {
              ...project,
              analytics: {
                totalTasks,
                todoTasks,
                inProgressTasks,
                toReviewTasks,
                doneTasks,
                highPriorityTasks,
                mediumPriorityTasks,
                lowPriorityTasks,
                progress,
              },
            };
          } catch (err) {
            console.error(`Error fetching tasks for project ${project._id}:`, err);
            return {
              ...project,
              analytics: {
                totalTasks: 0,
                todoTasks: 0,
                inProgressTasks: 0,
                toReviewTasks: 0,
                doneTasks: 0,
                highPriorityTasks: 0,
                mediumPriorityTasks: 0,
                lowPriorityTasks: 0,
                progress: 0,
              },
            };
          }
        })
      );

      setProjects(projectsWithTasks);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load project analytics');
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [navigate]);

  useEffect(() => {
    fetchProjectsWithAnalytics();
  }, [fetchProjectsWithAnalytics]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(projects.length - 1, prev + 1));
  };

  const handleNavigateToProject = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  if (loading) {
    return (
      <Card>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#E31B54] mx-auto mb-2"></div>
            <p className="text-xs text-gray-500">Loading analytics...</p>
          </div>
        </div>
      </Card>
    );
  }

  if (error || projects.length === 0) {
    return (
      <Card>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <BarChart3 className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 text-sm font-medium">
            {error || 'No projects yet'}
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Create a project to see analytics
          </p>
        </div>
      </Card>
    );
  }

  const currentProject = projects[currentIndex];
  const analytics = currentProject.analytics;

  return (
    <Card>
      <div className="relative h-full flex flex-col">
        {/* Redesigned Header - Navigation on sides, Avatar in center */}
        <div className="flex items-center justify-between mb-3 flex-shrink-0">
          {/* Left Navigation Button */}
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0 || projects.length === 1}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
          >
            <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 text-gray-700" />
          </button>

          {/* Center - Clickable Avatar & Project Info */}
          <div 
            className="flex flex-col items-center flex-1 cursor-pointer group px-2"
            onClick={() => handleNavigateToProject(currentProject._id)}
          >
            {/* Avatar */}
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${getRandomColor(currentProject._id)} flex items-center justify-center text-white text-sm sm:text-base font-bold shadow-lg mb-1.5 group-hover:scale-105 transition-transform`}>
              {getInitials(currentProject.name)}
            </div>
            
            {/* Project Name */}
            <h3 className="font-bold text-gray-900 text-xs sm:text-sm truncate max-w-full px-2 group-hover:text-[#E31B54] transition-colors text-center">
              {currentProject.displayName || currentProject.name}
            </h3>
            
            {/* Project Counter */}
            <p className="text-[9px] sm:text-[10px] text-gray-500">
              {currentIndex + 1} of {projects.length}
            </p>
          </div>

          {/* Right Navigation Button */}
          <button
            onClick={handleNext}
            disabled={currentIndex >= projects.length - 1 || projects.length === 1}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
          >
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-700" />
          </button>
        </div>

        {/* Progress Circle & Priority Cards */}
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 mb-3 flex-shrink-0">
          {/* Progress Circle */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="50%" cy="50%" r="38%" fill="none" stroke="#F3F4F6" strokeWidth="6" />
              <circle
                cx="50%"
                cy="50%"
                r="38%"
                fill="none"
                stroke="url(#gradient-progress)"
                strokeWidth="6"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - analytics.progress / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
              <defs>
                <linearGradient id="gradient-progress">
                  <stop offset="0%" stopColor="#E31B54" />
                  <stop offset="100%" stopColor="#E91E63" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-base sm:text-xl lg:text-2xl font-bold text-gray-900">{analytics.progress}%</span>
              <span className="text-[7px] sm:text-[8px] lg:text-[9px] text-gray-500 font-medium">Complete</span>
            </div>
          </div>

          {/* Priority Distribution Cards - Compact */}
          <div className="flex-1 grid grid-cols-3 gap-1.5 sm:gap-2 w-full">
            {/* High Priority */}
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-md sm:rounded-lg p-1.5 sm:p-2 text-center border border-red-200 hover:border-red-300 transition-all">
              <div className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 bg-red-200 rounded-full flex items-center justify-center mx-auto mb-0.5 sm:mb-1">
                <span className="text-[10px] sm:text-xs">🔴</span>
              </div>
              <p className="text-sm sm:text-base lg:text-lg font-bold text-red-900">{analytics.highPriorityTasks}</p>
              <p className="text-[7px] sm:text-[8px] lg:text-[9px] text-red-700 font-semibold uppercase tracking-wide">High</p>
            </div>

            {/* Medium Priority */}
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-md sm:rounded-lg p-1.5 sm:p-2 text-center border border-yellow-200 hover:border-yellow-300 transition-all">
              <div className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 bg-yellow-200 rounded-full flex items-center justify-center mx-auto mb-0.5 sm:mb-1">
                <span className="text-[10px] sm:text-xs">🟡</span>
              </div>
              <p className="text-sm sm:text-base lg:text-lg font-bold text-yellow-900">{analytics.mediumPriorityTasks}</p>
              <p className="text-[7px] sm:text-[8px] lg:text-[9px] text-yellow-700 font-semibold uppercase tracking-wide">Med</p>
            </div>

            {/* Low Priority */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-md sm:rounded-lg p-1.5 sm:p-2 text-center border border-blue-200 hover:border-blue-300 transition-all">
              <div className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-0.5 sm:mb-1">
                <span className="text-[10px] sm:text-xs">🔵</span>
              </div>
              <p className="text-sm sm:text-base lg:text-lg font-bold text-blue-900">{analytics.lowPriorityTasks}</p>
              <p className="text-[7px] sm:text-[8px] lg:text-[9px] text-blue-700 font-semibold uppercase tracking-wide">Low</p>
            </div>
          </div>
        </div>

        {/* Task Status Progress Bars - Bottom Section */}
        <div className="flex-1 flex flex-col min-h-0">
          <p className="text-xs sm:text-sm font-bold text-gray-700 mb-2 flex-shrink-0">Task Status</p>
          
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {/* To Do */}
            <div className="space-y-1 flex-shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs text-gray-600 font-medium">To Do</span>
                <span className="text-[10px] sm:text-xs font-semibold text-gray-900">{analytics.todoTasks}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-gray-400 to-gray-500 rounded-full transition-all duration-500"
                  style={{ width: analytics.totalTasks > 0 ? `${(analytics.todoTasks / analytics.totalTasks) * 100}%` : '0%' }}
                ></div>
              </div>
            </div>

            {/* In Progress */}
            <div className="space-y-1 flex-shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs text-purple-600 font-medium">In Progress</span>
                <span className="text-[10px] sm:text-xs font-semibold text-purple-900">{analytics.inProgressTasks}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full transition-all duration-500"
                  style={{ width: analytics.totalTasks > 0 ? `${(analytics.inProgressTasks / analytics.totalTasks) * 100}%` : '0%' }}
                ></div>
              </div>
            </div>

            {/* To Review */}
            <div className="space-y-1 flex-shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs text-orange-600 font-medium">To Review</span>
                <span className="text-[10px] sm:text-xs font-semibold text-orange-900">{analytics.toReviewTasks}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all duration-500"
                  style={{ width: analytics.totalTasks > 0 ? `${(analytics.toReviewTasks / analytics.totalTasks) * 100}%` : '0%' }}
                ></div>
              </div>
            </div>

            {/* Done */}
            <div className="space-y-1 flex-shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs text-green-600 font-medium">Done</span>
                <span className="text-[10px] sm:text-xs font-semibold text-green-900">{analytics.doneTasks}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-500"
                  style={{ width: analytics.totalTasks > 0 ? `${(analytics.doneTasks / analytics.totalTasks) * 100}%` : '0%' }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Refresh Button */}
        <button
          onClick={fetchProjectsWithAnalytics}
          className="absolute top-0 right-0 w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all"
          title="Refresh analytics"
        >
          <RefreshCw className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-600" />
        </button>
      </div>
    </Card>
  );
};

export default ProgressCard;