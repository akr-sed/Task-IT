import React from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../common/Card";
import Avatar from "../../common/Avatar";
import EmptyState from "../../common/EmptyState";
import { formatDate } from "../../../utils/dateUtils";
import { FolderKanban, ChevronRight } from 'lucide-react';

const ProjectsCard = ({ projects }) => {
  const navigate = useNavigate();

  return (
    <Card>
      <div className="flex flex-col h-full">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-gray-700" />
            <span className="font-semibold text-gray-800">Projects</span>
            <span className="text-xs text-gray-500">({projects.length})</span>
          </div>
          <button
            onClick={() => navigate("/projects")}
            className="text-sm text-gray-600 hover:text-[#E31B54] flex items-center gap-1"
          >
            View all
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Scrollable Content */}
        {projects.length === 0 ? (
          <EmptyState
            message="No projects yet"
            actionLabel="Create Project"
            onAction={() => navigate("/projects/new")}
          />
        ) : (
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {projects.map((project) => (
              <div
                key={project._id}
                onClick={() => navigate(`/projects/${project._id}`)}
                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 cursor-pointer transition-all flex-shrink-0"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Avatar name={project.name} id={project._id} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm truncate">
                      {project.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {project.description
                        ? project.description.length > 40
                          ? `${project.description.substring(0, 40)}...`
                          : project.description
                        : "No description"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  <p className="text-xs text-gray-600">
                    {formatDate(project.createdAt)}
                  </p>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default ProjectsCard;
