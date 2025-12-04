import TaskListCard from "./TaskListCard";


const ListMode = ({
  filteredTasks,
  onTaskClick,
  getUserName,
  canManageTask,
  canUpdateTaskStatus,
  onRefresh,
  searchQuery,
  filterStatus,
  filterPriority,
  viewMode,
  currentUserId,
}) => {
  // Helper to check if task is visible due to admin role
  const isVisibleAsAdmin = (task) => {
    return (
      task.isProjectAdmin && 
      task.assignedTo !== currentUserId && 
      !task.isProjectOwner
    );
  };
  
  if (filteredTasks.length === 0) {
    return (
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
        <h3 className="text-lg font-bold text-gray-900 mb-2">No tasks found</h3>
        <p className="text-gray-600">
          {searchQuery ||
          filterStatus.value !== "all" ||
          filterPriority.value !== "all"
            ? "Try adjusting your filters"
            : viewMode === "assigned"
            ? "No tasks are assigned to you yet"
            : "No tasks in your projects yet"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {filteredTasks.map((task) => (
        <TaskListCard
          key={task._id}
          task={task}
          onClick={() => onTaskClick(task)}
          getUserName={getUserName}
          canManageTask={canManageTask(task)}
          canUpdateTaskStatus={canUpdateTaskStatus(task)}
          onRefresh={onRefresh}
          isVisibleAsAdmin={isVisibleAsAdmin(task)}
        />
      ))}
    </div>
  );
};


export default ListMode;