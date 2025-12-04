import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  statusColumns,
  activityIcons,
  priorityColors,
} from "../../utils/tasksDetailsStyles";
import { getInitials, getRandomColor } from "../../utils/avatarUtils";

const BoardMode = ({
  filteredColumns,
  tasks,
  onDragEnd,
  getUserName,
  canMoveForTask,
  onTaskClick,
  currentUserId,
}) => {
  const getMemberName = (id) => getUserName(id);
  
  // Helper to check if task is visible due to admin role
  const isVisibleAsAdmin = (task) => {
    return (
      task.isProjectAdmin && 
      task.assignedTo !== currentUserId && 
      !task.isProjectOwner
    );
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {Object.values(filteredColumns).map((col) => {
          const colConfig = statusColumns[col.id];
          const taskCount = col.taskIds.length;

          return (
            <div
              key={col.id}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col"
            >
              {/* Column Header */}
              <div className={`bg-gradient-to-r ${colConfig.color} p-4`}>
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
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
                          d={colConfig.icon}
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold">{col.title}</h3>
                  </div>
                  <span className="px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold">
                    {taskCount}
                  </span>
                </div>
              </div>

              {/* Droppable Area - Dynamic min-height based on task count */}
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{
                      minHeight:
                        taskCount === 0
                          ? "200px"
                          : `${Math.max(200, taskCount * 180)}px`,
                    }}
                    className={`p-3 transition-colors ${
                      snapshot.isDraggingOver
                        ? "bg-gradient-to-br from-[#FFF5F8] to-[#FFF0F5]"
                        : "bg-gray-50"
                    }`}
                  >
                    <div className="space-y-3">
                      {taskCount === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-3">
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
                                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                              />
                            </svg>
                          </div>
                          <p className="text-sm text-gray-500">No tasks</p>
                          <p className="text-xs text-gray-400 mt-1">
                            Drag tasks here
                          </p>
                        </div>
                      ) : (
                        col.taskIds.map((taskId, index) => {
                          const t = tasks.find((x) => x._id === taskId);
                          if (!t) return null;
                          const draggableDisabled = !canMoveForTask(t);

                          return (
                            <Draggable
                              key={t._id}
                              draggableId={t._id}
                              index={index}
                              isDragDisabled={draggableDisabled}
                            >
                              {(prov, snap) => (
                                <div
                                  ref={prov.innerRef}
                                  {...prov.draggableProps}
                                  {...prov.dragHandleProps}
                                  className={`bg-white rounded-xl p-4 border-2 transition-all cursor-pointer group ${
                                    snap.isDragging
                                      ? "shadow-2xl border-[#E31B54] rotate-2 scale-105"
                                      : "border-gray-200 hover:border-[#E31B54] hover:shadow-lg"
                                  } ${
                                    draggableDisabled
                                      ? "opacity-60 cursor-not-allowed"
                                      : ""
                                  }`}
                                  onClick={() => onTaskClick(t)}
                                >
                                  {/* Admin Badge - Show when task is visible due to admin role */}
                                  {isVisibleAsAdmin(t) && (
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

                                  {/* Project Name Badge */}
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
                                      <span className="truncate max-w-[120px]">
                                        {t.projectName}
                                      </span>
                                    </span>
                                  </div>

                                  {/* Task Header */}
                                  <div className="flex items-start justify-between gap-2 mb-3">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <svg
                                          className="w-4 h-4 text-gray-600"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d={
                                              activityIcons[t.activity] ||
                                              activityIcons.OTHER
                                            }
                                          />
                                        </svg>
                                      </div>
                                      <h4 className="font-bold text-gray-900 text-sm line-clamp-2 group-hover:text-[#E31B54] transition-colors">
                                        {t.title}
                                      </h4>
                                    </div>
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs font-semibold border flex-shrink-0 ${
                                        priorityColors[t.priority]
                                      }`}
                                    >
                                      {t.priority === "high"
                                        ? "🔴"
                                        : t.priority === "medium"
                                        ? "🟡"
                                        : "🔵"}
                                    </span>
                                  </div>

                                  {/* Description */}
                                  {t.description && (
                                    <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                                      {t.description}
                                    </p>
                                  )}

                                  {/* Task Footer */}
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
                                      {t.activity}
                                    </span>

                                    {/* Assigned User */}
                                    {t.assignedTo ? (
                                      <div className="flex items-center gap-1">
                                        <div
                                          className={`w-6 h-6 rounded-full bg-gradient-to-br ${getRandomColor(
                                            t.assignedTo
                                          )} flex items-center justify-center text-white text-xs font-bold`}
                                        >
                                          {getInitials(
                                            getMemberName(t.assignedTo)
                                          )}
                                        </div>
                                      </div>
                                    ) : (
                                      <span className="text-xs text-gray-400">
                                        Unassigned
                                      </span>
                                    )}
                                  </div>

                                  {/* Drag Indicator */}
                                  {!draggableDisabled && (
                                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                                      <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                                      <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                                      <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                                      <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                                      <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </Draggable>
                          );
                        })
                      )}
                    </div>
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
};

export default BoardMode;