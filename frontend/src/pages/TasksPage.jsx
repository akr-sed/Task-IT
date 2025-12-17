import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { projectService, taskService } from "../api";
import Select from "react-select";
import { 
  ClipboardList, 
  RefreshCw, 
  User, 
  FolderKanban, 
  List, 
  LayoutGrid, 
  Search as SearchIcon, 
  X 
} from "lucide-react";

import { statusColumns } from "../utils/tasksDetailsStyles";
import { fetchUsersMap, getUserName } from "../utils/userUtils";

// import the components of the tasks page
import ListMode from "../components/tasksPageComponents/ListMode";
import BoardMode from "../components/tasksPageComponents/BoardMode";
import TaskDetailModal from "../components/tasksPageComponents/TaskDetailModal";

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

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [columns, setColumns] = useState({
    todo: { id: "todo", title: "To Do", taskIds: [] },
    "in progress": { id: "in progress", title: "In Progress", taskIds: [] },
    "to review": { id: "to review", title: "Review", taskIds: [] },
    done: { id: "done", title: "Done", taskIds: [] },
  });
  const [projects, setProjects] = useState([]);
  const [membersMap, setMembersMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState({
    value: "all",
    label: "All Status",
  });
  const [filterPriority, setFilterPriority] = useState({
    value: "all",
    label: "All Priority",
  });
  const [filterProject, setFilterProject] = useState({
    value: "all",
    label: "All Projects",
  });
  const [searchQuery, setSearchQuery] = useState("");

  // ✅ Load persisted modes from localStorage
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem("tasksViewMode") || "assigned";
  });

  const [displayMode, setDisplayMode] = useState(() => {
    return localStorage.getItem("tasksDisplayMode") || "list";
  });

  const navigate = useNavigate();
  const isFetchingRef = useRef(false);

  const currentUser = JSON.parse(localStorage.getItem("user"));
  const currentUserId = currentUser?.id;

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "todo", label: "To Do" },
    { value: "in progress", label: "In Progress" },
    { value: "to review", label: "To Review" },
    { value: "done", label: "Done" },
  ];

  const priorityOptions = [
    { value: "all", label: "All Priority" },
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
  ];

  // ✅ Persist viewMode to localStorage
  useEffect(() => {
    localStorage.setItem("tasksViewMode", viewMode);
  }, [viewMode]);

  // ✅ Persist displayMode to localStorage
  useEffect(() => {
    localStorage.setItem("tasksDisplayMode", displayMode);
  }, [displayMode]);

  // ✅ Clear all filters function
  const clearAllFilters = () => {
    setFilterStatus({ value: "all", label: "All Status" });
    setFilterPriority({ value: "all", label: "All Priority" });
    setFilterProject({ value: "all", label: "All Projects" });
    setSearchQuery("");
  };

  // ✅ Check if any filters are active
  const hasActiveFilters =
    filterStatus.value !== "all" ||
    filterPriority.value !== "all" ||
    filterProject.value !== "all" ||
    searchQuery !== "";

  const updateTaskLocally = useCallback(
    (taskId, updates) => {
      setTasks((prevTasks) =>
        prevTasks.map((t) => (t._id === taskId ? { ...t, ...updates } : t))
      );

      // Also update columns if in board mode
      if (displayMode === "board" && updates.status) {
        setColumns((prevColumns) => {
          const newColumns = { ...prevColumns };

          // Remove task from all columns
          Object.keys(newColumns).forEach((colId) => {
            newColumns[colId] = {
              ...newColumns[colId],
              taskIds: newColumns[colId].taskIds.filter((id) => id !== taskId),
            };
          });

          // Add task to new status column
          if (newColumns[updates.status]) {
            newColumns[updates.status] = {
              ...newColumns[updates.status],
              taskIds: [...newColumns[updates.status].taskIds, taskId],
            };
          }

          return newColumns;
        });
      }

      // Update selected task if it's the one being modified
      if (selectedTask && selectedTask._id === taskId) {
        setSelectedTask((prev) => ({ ...prev, ...updates }));
      }
    },
    [displayMode, selectedTask]
  );

  // Add this function to add comment locally
  const addCommentLocally = useCallback(
    (taskId, newComment) => {
      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          t._id === taskId
            ? { ...t, comments: [...(t.comments || []), newComment] }
            : t
        )
      );

      // Update selected task if it's the one being modified
      if (selectedTask && selectedTask._id === taskId) {
        setSelectedTask((prev) => ({
          ...prev,
          comments: [...(prev.comments || []), newComment],
        }));
      }
    },
    [selectedTask]
  );

  // Add this function to delete comment locally
  const deleteCommentLocally = useCallback(
    (taskId, commentId) => {
      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          t._id === taskId
            ? {
                ...t,
                comments: (t.comments || []).filter((c) => c._id !== commentId),
              }
            : t
        )
      );

      // Update selected task if it's the one being modified
      if (selectedTask && selectedTask._id === taskId) {
        setSelectedTask((prev) => ({
          ...prev,
          comments: (prev.comments || []).filter((c) => c._id !== commentId),
        }));
      }
    },
    [selectedTask]
  );

  const fetchAllData = useCallback(async () => {
    if (isFetchingRef.current) {
      console.log("🔄 Already fetching data, skipping...");
      return;
    }

    isFetchingRef.current = true;
    setLoading(true);

    try {
      const projectsResponse = await projectService.getAllProjects();

      const projectsList = projectsResponse.data.projects || [];
      setProjects(projectsList);

      if (projectsList.length === 0) {
        setTasks([]);
        setLoading(false);
        isFetchingRef.current = false;
        return;
      }


      // Fetch tasks with project metadata attached per project
      const tasksData = await Promise.all(
        projectsList.map((project) =>
          taskService
        .getTasksByProject(project._id)
        .then((res) => ({
          projectId: project._id,
          projectName: project.name,
          projectDisplayName: project.displayName,
          isOwner: project.ownedBy === currentUserId,
          isAdmin: project.members?.some(
            (m) => m.id === currentUserId && m.role === "admin"
          ),
          tasks: res.data.tasks || [],
        }))
        .catch((err) => {
          console.error(
            `Error fetching tasks for project ${project._id}:`,
            err
          );
          return {
            projectId: project._id,
            projectName: project.name,
            projectDisplayName: project.displayName,
            isOwner: project.ownedBy === currentUserId,
            isAdmin: false,
            tasks: [],
          };
        })
        )
      );

      

      const allTasks = tasksData.flatMap((data) =>
        (data.tasks || []).map((task) => ({
          ...task,
          projectId: data.projectId,
          projectName: data.projectDisplayName || data.projectName,
          isProjectOwner: data.isOwner,
          isProjectAdmin: data.isAdmin,
        }))
      );

      setTasks(allTasks);
      

      // Build columns for board mode
      const newCols = {
        todo: { ...statusColumns.todo, taskIds: [] },
        "in progress": { ...statusColumns["in progress"], taskIds: [] },
        "to review": { ...statusColumns["to review"], taskIds: [] },
        done: { ...statusColumns.done, taskIds: [] },
      };

      allTasks.forEach((t) => {
        const s = t.status || "todo";
        if (newCols[s]) {
          newCols[s].taskIds.push(t._id);
        }
      });
      setColumns(newCols);

      // Collect all user IDs: project members, owners, and task assignees
      const userIdsSet = new Set();
      
      projectsList.forEach((project) => {
        // Add project owner
        if (project.ownedBy) {
          userIdsSet.add(project.ownedBy);
        }
        // Add project members
        if (project.members) {
          project.members.forEach((m) => {
            if (m.id) userIdsSet.add(m.id);
          });
        }
      });
      
      // Add task assignees
      allTasks.forEach((task) => {
        if (task.assignedTo) {
          userIdsSet.add(task.assignedTo);
        }
      });

      const userIds = Array.from(userIdsSet);

      if (userIds.length > 0) {
        const usersMap = await fetchUsersMap(userIds);
        setMembersMap(usersMap);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load tasks");
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, currentUserId]);

  useEffect(() => {
    fetchAllData();
    
  }, [fetchAllData]);

  const getTaskUserName = useCallback((userId) => {
    return getUserName(userId, membersMap);
  }, [membersMap]);

  const canManageTask = (task) => {
    return task.isProjectOwner || task.isProjectAdmin;
  };

  const canUpdateTaskStatus = (task) => {
    return (
      task.assignedTo === currentUserId ||
      task.isProjectOwner ||
      task.isProjectAdmin
    );
  };

  const canMoveForTask = (task) => {
    if (!task) return false;
    if (task.isProjectOwner || task.isProjectAdmin) return true;
    return task.assignedTo && String(task.assignedTo) === String(currentUserId);
  };

  const getFilteredTasks = () => {
    let filtered = tasks;

    if (viewMode === "assigned") {
      filtered = filtered.filter((task) => task.assignedTo === currentUserId);
    } else if (viewMode === "owned") {
      // ✅ FIX: Include tasks where user is project owner OR admin OR assigned
      filtered = filtered.filter(
        (task) =>
          task.isProjectOwner ||
          task.isProjectAdmin ||
          task.assignedTo === currentUserId
      );
    }

    if (filterStatus.value !== "all") {
      filtered = filtered.filter((task) => task.status === filterStatus.value);
    }

    if (filterPriority.value !== "all") {
      filtered = filtered.filter(
        (task) => task.priority === filterPriority.value
      );
    }

    if (filterProject.value !== "all") {
      filtered = filtered.filter(
        (task) => task.projectId === filterProject.value
      );
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredTasks = getFilteredTasks();

  // Build filtered columns for board mode
  const getFilteredColumns = () => {
    const newCols = {
      todo: { ...statusColumns.todo, taskIds: [] },
      "in progress": { ...statusColumns["in progress"], taskIds: [] },
      "to review": { ...statusColumns["to review"], taskIds: [] },
      done: { ...statusColumns.done, taskIds: [] },
    };

    filteredTasks.forEach((t) => {
      const s = t.status || "todo";
      if (newCols[s]) {
        newCols[s].taskIds.push(t._id);
      }
    });

    return newCols;
  };

  const filteredColumns =
    displayMode === "board" ? getFilteredColumns() : columns;

  const projectOptions = [
    { value: "all", label: "All Projects" },
    ...projects.map((p) => ({
      value: p._id,
      label: p.displayName || p.name,
    })),
  ];

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowDetailModal(true);
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    const task = tasks.find((t) => t._id === draggableId);
    if (!task) return;

    if (!canMoveForTask(task)) {
      return;
    }

    const sourceCol = filteredColumns[source.droppableId];
    const destCol = filteredColumns[destination.droppableId];
    const newSourceIds = Array.from(sourceCol.taskIds);
    newSourceIds.splice(source.index, 1);
    const newDestIds = Array.from(destCol.taskIds);
    newDestIds.splice(destination.index, 0, draggableId);

    const newCols = {
      ...filteredColumns,
      [sourceCol.id]: { ...sourceCol, taskIds: newSourceIds },
      [destCol.id]: { ...destCol, taskIds: newDestIds },
    };

    setColumns(newCols);

    if (source.droppableId !== destination.droppableId) {
      setTasks((prev) =>
        prev.map((t) =>
          t._id === task._id ? { ...t, status: destination.droppableId } : t
        )
      );

      try {
        await taskService.updateTaskStatus(
          task.projectId,
          task._id,
          destination.droppableId
        );
      } catch (err) {
        console.error("Error updating task status:", err);
        setColumns(filteredColumns);
        setTasks((prev) =>
          prev.map((t) =>
            t._id === task._id ? { ...t, status: source.droppableId } : t
          )
        );
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#E31B54] mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your Tasks...</p>
          <p className="text-gray-400 text-sm mt-2">Please wait while we fetch your data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Compact Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-[#E31B54] to-[#E91E63] rounded-2xl flex items-center justify-center shadow-lg">
            <ClipboardList className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
            <p className="text-sm text-gray-600 mt-0.5">
              {filteredTasks.length} tasks • {projects.length} projects
            </p>
          </div>
        </div>

        <button
          onClick={fetchAllData}
          className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all flex items-center justify-center"
          title="Refresh"
        >
          <RefreshCw className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Control Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* View Mode */}
          <div className="flex gap-2 bg-gray-50 rounded-lg p-1">
            <button
              onClick={() => setViewMode("assigned")}
              className={`px-3 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                viewMode === "assigned"
                  ? "bg-white text-[#E31B54] shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <User className="w-4 h-4" />
              Assigned to Me
            </button>
            <button
              onClick={() => setViewMode("owned")}
              className={`px-3 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                viewMode === "owned"
                  ? "bg-white text-[#E31B54] shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <FolderKanban className="w-4 h-4" />
              My Projects
            </button>
          </div>

          {/* Display Mode */}
          <div className="flex gap-2 bg-gray-50 rounded-lg p-1">
            <button
              onClick={() => setDisplayMode("list")}
              className={`px-3 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                displayMode === "list"
                  ? "bg-white text-[#E31B54] shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <List className="w-4 h-4" />
              List
            </button>
            <button
              onClick={() => setDisplayMode("board")}
              className={`px-3 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                displayMode === "board"
                  ? "bg-white text-[#E31B54] shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Board
            </button>
          </div>

          {/* Search */}
          <div className="flex-1 relative">
            <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-4 border border-gray-200 rounded-lg focus:border-[#E31B54] focus:outline-none transition-colors text-sm"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <div className="w-40">
              <Select
                value={filterStatus}
                onChange={setFilterStatus}
                options={statusOptions}
                styles={selectStyles}
                isSearchable={false}
              />
            </div>
            <div className="w-40">
              <Select
                value={filterPriority}
                onChange={setFilterPriority}
                options={priorityOptions}
                styles={selectStyles}
                isSearchable={false}
              />
            </div>
            <div className="w-44">
              <Select
                value={filterProject}
                onChange={setFilterProject}
                options={projectOptions}
                styles={selectStyles}
                isSearchable={false}
              />
            </div>

            {/* ✅ Clear Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium text-sm transition-all flex items-center gap-2 whitespace-nowrap"
                title="Clear all filters"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      {/* Content - List or Board Mode */}
      {displayMode === "list" ? (
        <ListMode
          filteredTasks={filteredTasks}
          onTaskClick={handleTaskClick}
          getUserName={getTaskUserName}
          canManageTask={canManageTask}
          canUpdateTaskStatus={canUpdateTaskStatus}
          onRefresh={fetchAllData}
          searchQuery={searchQuery}
          filterStatus={filterStatus}
          filterPriority={filterPriority}
          viewMode={viewMode}
          currentUserId={currentUserId}
        />
      ) : (
        <BoardMode
          filteredColumns={filteredColumns}
          tasks={filteredTasks}
          onDragEnd={onDragEnd}
          getUserName={getTaskUserName}
          canMoveForTask={canMoveForTask}
          onTaskClick={handleTaskClick}
          currentUserId={currentUserId}
        />
      )}

      {/* Task Detail Modal */}
      {showDetailModal && selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedTask(null);
          }}
          onRefresh={fetchAllData}
          onUpdateTask={updateTaskLocally}
          onAddComment={addCommentLocally}
          onDeleteComment={deleteCommentLocally}
          canManageTask={canManageTask(selectedTask)}
          canUpdateTaskStatus={canUpdateTaskStatus(selectedTask)}
          currentUserId={currentUserId}
        />
      )}
    </div>
  );
};

export default TasksPage;
