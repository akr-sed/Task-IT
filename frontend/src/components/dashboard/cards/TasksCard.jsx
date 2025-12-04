import React from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../common/Card";
import Avatar from "../../common/Avatar";
import EmptyState from "../../common/EmptyState";
import { Clock, ChevronRight } from 'lucide-react';
const priorityColors = {
  low: "bg-blue-100 text-blue-700 border-blue-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  high: "bg-red-100 text-red-700 border-red-200",
};

const TasksCard = ({ tasks }) => {
  const navigate = useNavigate();

  const handleNavigateToTask = (task) => {
    navigate(`/projects/${task.projectId}/tasks/${task._id}`);
  };

  return (
    <Card>
      <div className="flex flex-col h-full">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-700" />
            <span className="font-semibold text-gray-800">Tasks</span>
            <span className="text-xs text-gray-500">({tasks.length})</span>
          </div>
          <button className="text-sm text-gray-600 hover:text-[#E31B54] flex items-center gap-1">
            View all
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Scrollable Grid */}
        {tasks.length === 0 ? (
          <EmptyState message="No tasks yet" />
        ) : (
          <div className="flex-1 overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-2">
              {tasks.map((task) => (
                <div
                  key={task._id}
                  onClick={() => handleNavigateToTask(task)}
                  className="p-2.5 rounded-lg hover:bg-gray-50 hover:cursor-pointer transition-all border border-gray-100 flex-shrink-0"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar name={task.title} id={task._id} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate text-xs">
                        {task.title}
                      </p>
                      <p className="text-[10px] text-gray-500 truncate">
                        {task.activity}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2 py-0.5 ${
                        priorityColors[task.priority]
                      } text-[10px] font-medium rounded-full`}
                    >
                      {task.priority || "medium"}
                    </span>
                    <ChevronRight className="w-3 h-3 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default TasksCard;
