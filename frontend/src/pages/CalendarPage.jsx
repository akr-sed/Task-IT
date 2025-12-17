import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  GripVertical,
} from "lucide-react";
import { taskService, projectService } from "../api";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [projectsMap, setProjectsMap] = useState({});

  const [viewMode, setViewMode] = useState("all"); // 'my' or 'all'
  const currentUserId = JSON.parse(localStorage.getItem("user"))?.id;

  // Helper to get days in month
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    // Adjust for Monday start (0 = Mon, 6 = Sun)
    const startingDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    return { daysInMonth, startingDay };
  };

  const { daysInMonth, startingDay } = getDaysInMonth(currentDate);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Navigation handlers
  const prevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  // Fetch all tasks for the user (across all projects)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Fetch user's projects
        const projectsResp = await projectService.getAllProjects();
        const projects = projectsResp.data.projects || [];

        // Create a map of project ID to project names/colors
        const pMap = {};
        projects.forEach((p) => (pMap[p._id] = p));
        setProjectsMap(pMap);

        // 2. Fetch tasks for all projects in one go
        const tasksResponse = await taskService.getAllProjectsTasks();

        const allTasks = tasksResponse.data.tasks || [];

        // Enrich tasks with project data for filtering
        const enrichedTasks = allTasks.map((task) => ({
          ...task,
          project: pMap[task.projectId],
        }));

        console.log("Fetched tasks for calendar:", enrichedTasks);
        setTasks(enrichedTasks);
      } catch (err) {
        console.error("Error fetching calendar data:", err);
        setError("Failed to load calendar data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
  }, [currentDate.getMonth()]);

  // --- Helpers for Filtering ---

  const canDragTask = (task) => {
    if (!task || !task.project) return false;
    const isOwner = task.project.ownedBy === currentUserId;
    const isAdmin = task.project.members?.some(
      (m) => m.id === currentUserId && m.role === "admin"
    );
    // Allow owner or admin to drag. User asked for "admin or owner".
    // Optionally allow assignee? Prompt said "admin or owner... can drag". sticking to that.
    return isOwner || isAdmin;
  };

  const filterTasks = (taskList, filterType = "calendar", dateStr = null) => {
    return taskList.filter((task) => {
      // 1. Permission Logic for VIEWing
      let hasPermission = false;
      if (viewMode === "my") {
        hasPermission = task.assignedTo === currentUserId;
      } else {
        // 'all' mode
        if (!task.project) return false;
        const isOwner = task.project.ownedBy === currentUserId;
        const isAdmin = task.project.members?.some(
          (m) => m.id === currentUserId && m.role === "admin"
        );
        hasPermission = isOwner || isAdmin || task.assignedTo === currentUserId;
      }
      if (!hasPermission) return false;

      // 2. Location Logic (Calendar vs Unscheduled)
      if (filterType === "calendar") {
        if (!task.dueDate) return false;
        return task.dueDate.startsWith(dateStr);
      } else {
        // 'unscheduled'
        return !task.dueDate;
      }
    });
  };

  const getTasksForDay = (day) => {
    // Create date using local time to avoid timezone shifts
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(d.getDate()).padStart(2, "0")}`;
    return filterTasks(tasks, "calendar", dateStr);
  };

  const getUnscheduledTasks = () => {
    // Only show unscheduled tasks if in 'all' mode (so admins can see what to schedule)?
    // Or 'my' unscheduled tasks?
    // Typically scheduling is an admin activity. Let's respect the viewMode.
    return filterTasks(tasks, "unscheduled");
  };

  // --- Drag and Drop Handler ---

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Identify the task
    const task = tasks.find((t) => t._id === draggableId);
    if (!task) return;

    // Check permissions again just in case
    if (!canDragTask(task)) {
      alert("You don't have permission to move this task.");
      return;
    }

    // Determine new Due Date
    let newDueDate = null; // Default to unscheduled
    if (destination.droppableId !== "unscheduled") {
      newDueDate = destination.droppableId; // The ID is the date string YYYY-MM-DD
    }

    // Optimistic Update
    // const oldDueDate = task.dueDate;
    const updatedTasks = tasks.map((t) => {
      if (t._id === draggableId) {
        return {
          ...t,
          dueDate: newDueDate ? new Date(newDueDate).toISOString() : null,
        };
      }
      return t;
    });
    setTasks(updatedTasks);

    try {
      await taskService.updateTask(task.projectId, task._id, {
        ...task,
        dueDate: newDueDate, // Backend expects 'dueDate' string or Date
      });
      // Success - no action needed (optimistic update handles UI)
    } catch (err) {
      console.error("Failed to update task date:", err);
      // Revert on failure
      setTasks(tasks); // Reverts to pre-optimistic state because 'tasks' in closure is old state?
      // Actually 'tasks' here is from the render scope, which is fine for simple revert if we didn't re-fetch.
      // Better:
      // setTasks(prev => prev.map(t => t._id === draggableId ? { ...t, dueDate: oldDueDate } : t));
      alert("Failed to update task due date. Please try again.");
    }
  };

  // --- Styles ---

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "low":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "done":
        return "line-through opacity-60";
      default:
        return "";
    }
  };

  if (loading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#E31B54] mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your Calendar...</p>
          <p className="text-gray-400 text-sm mt-2">Please wait while we fetch your data</p>
        </div>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="max-w-[1600px] mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-[25px] shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#E31B54] to-[#E91E63] rounded-xl flex items-center justify-center text-white shadow-lg shadow-pink-200">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h1>
              <p className="text-gray-500 text-sm">
                Manage your schedule and deadlines
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* View Toggle */}
            <div className="bg-gray-100 p-1 rounded-xl flex">
              <button
                onClick={() => setViewMode("my")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  viewMode === "my"
                    ? "bg-white text-[#E31B54] shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Assigned to Me
              </button>
              <button
                onClick={() => setViewMode("all")}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  viewMode === "all"
                    ? "bg-white text-[#E31B54] shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                All Tasks
              </button>
            </div>

            {/* Navigation */}
            <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-gray-200">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-gray-600"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={goToToday}
                className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-white hover:shadow-sm rounded-lg transition-all"
              >
                Today
              </button>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-gray-600"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Calendar Area */}
          <div className="lg:col-span-3 bg-white rounded-[25px] shadow-sm border border-gray-100 overflow-hidden">
            {/* Days Header */}
            <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50/50">
              {daysOfWeek.map((day) => (
                <div
                  key={day}
                  className="py-4 text-center text-sm font-semibold text-gray-500 uppercase tracking-wider"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Body */}
            <div className="grid grid-cols-7 auto-rows-fr bg-gray-200 gap-[1px]">
              {/* Empty cells for start of month */}
              {Array.from({ length: startingDay }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="bg-white min-h-[140px] p-2 bg-gray-50/30"
                />
              ))}

              {/* Days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const d = new Date(
                  currentDate.getFullYear(),
                  currentDate.getMonth(),
                  day
                );
                const dateStr = `${d.getFullYear()}-${String(
                  d.getMonth() + 1
                ).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

                const dayTasks = getTasksForDay(day);
                const isCurrentDay = isToday(day);

                return (
                  <Droppable key={dateStr} droppableId={dateStr}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`bg-white min-h-[140px] p-3 transition-colors ${
                          snapshot.isDraggingOver
                            ? "bg-blue-50/50"
                            : "hover:bg-gray-50"
                        } ${isCurrentDay ? "bg-pink-50/30" : ""}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span
                            className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full ${
                              isCurrentDay
                                ? "bg-[#E31B54] text-white shadow-md"
                                : "text-gray-700"
                            }`}
                          >
                            {day}
                          </span>
                          {dayTasks.length > 0 && (
                            <span className="text-xs text-gray-400 font-medium">
                              {dayTasks.length}
                            </span>
                          )}
                        </div>

                        <div className="space-y-1.5 overflow-y-auto max-h-[100px] custom-scrollbar min-h-[50px]">
                          {dayTasks.map((task, index) => {
                            const isDraggable = canDragTask(task);
                            return (
                              <Draggable
                                key={task._id}
                                draggableId={task._id}
                                index={index}
                                isDragDisabled={!isDraggable}
                              >
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    style={{ ...provided.draggableProps.style }}
                                  >
                                    <Link
                                      to={`/projects/${task.projectId}/tasks/${task._id}`}
                                      className={`block text-xs p-2 rounded-lg border border-transparent hover:border-gray-200 hover:shadow-sm transition-all text-left group ${getPriorityColor(
                                        task.priority
                                      )} ${getStatusColor(task.status)} ${
                                        !isDraggable
                                          ? "cursor-default"
                                          : "cursor-grab active:cursor-grabbing"
                                      }`}
                                    >
                                      <div className="font-semibold truncate flex items-center gap-1">
                                        {isDraggable && (
                                          <GripVertical className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100" />
                                        )}
                                        {task.title}
                                      </div>
                                      <div className="flex items-center gap-1 mt-0.5 opacity-70 pl-4">
                                        <span className="truncate max-w-[80px]">
                                          {projectsMap[task.projectId]?.name ||
                                            "Unknown"}
                                        </span>
                                      </div>
                                    </Link>
                                  </div>
                                )}
                              </Draggable>
                            );
                          })}
                          {provided.placeholder}
                        </div>
                      </div>
                    )}
                  </Droppable>
                );
              })}

              {/* Fill remaining cells */}
              {Array.from({ length: 42 - (daysInMonth + startingDay) }).map(
                (_, i) => (
                  <div
                    key={`next-empty-${i}`}
                    className="bg-white min-h-[140px] bg-gray-50/30"
                  />
                )
              )}
            </div>
          </div>

          {/* Unscheduled Tasks Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[25px] shadow-sm border border-gray-100 p-6 h-full flex flex-col">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="bg-gray-100 p-2 rounded-lg">📋</span>
                Unscheduled
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Drag tasks here to remove their due date, or drag from here to
                the calendar to schedule them.
              </p>

              <Droppable droppableId="unscheduled">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 bg-gray-50 rounded-xl p-4 space-y-3 overflow-y-auto max-h-[600px] custom-scrollbar transition-colors ${
                      snapshot.isDraggingOver
                        ? "bg-blue-50 border-2 border-dashed border-blue-200"
                        : "border-2 border-transparent"
                    }`}
                  >
                    {getUnscheduledTasks().length === 0 ? (
                      <div className="text-center text-gray-400 py-10 text-sm">
                        No unscheduled tasks found.
                      </div>
                    ) : (
                      getUnscheduledTasks().map((task, index) => {
                        const isDraggable = canDragTask(task);
                        return (
                          <Draggable
                            key={task._id}
                            draggableId={task._id}
                            index={index}
                            isDragDisabled={!isDraggable}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={{ ...provided.draggableProps.style }}
                                className={`bg-white p-3 rounded-xl shadow-sm border border-gray-100 group hover:shadow-md transition-all ${
                                  !isDraggable
                                    ? "opacity-70"
                                    : "cursor-grab active:cursor-grabbing"
                                }`}
                              >
                                <div className="flex justify-between items-start">
                                  <h4 className="font-semibold text-gray-800 text-sm mb-1 line-clamp-2">
                                    {task.title}
                                  </h4>
                                  {isDraggable && (
                                    <GripVertical className="w-4 h-4 text-gray-300" />
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                                  <span
                                    className={`px-2 py-0.5 rounded-full ${getPriorityColor(
                                      task.priority
                                    )} text-[10px]`}
                                  >
                                    {task.priority}
                                  </span>
                                  <span className="truncate max-w-[100px]">
                                    {projectsMap[task.projectId]?.name}
                                  </span>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        );
                      })
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </div>
        </div>
      </div>
    </DragDropContext>
  );
};

export default CalendarPage;
