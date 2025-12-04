import React from "react";
import Card from "../../common/Card";
import Avatar from "../../common/Avatar";
import EmptyState from "../../common/EmptyState";
import { Users, UserPlus } from 'lucide-react';

const TeamMembersCard = ({ teamMembers }) => {
  return (
    <Card>
      <div className="flex flex-col h-full">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-700" />
            <span className="font-semibold text-gray-800">Team Members</span>
            <span className="text-xs text-gray-500">({teamMembers.length})</span>
          </div>
        </div>

        {/* Scrollable Content */}
        {teamMembers.length === 0 ? (
          <EmptyState message="No team members yet" />
        ) : (
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {teamMembers.map((member, index) => (
              <div
                key={member.id || index}
                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 transition-all flex-shrink-0"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Avatar
                    name={member.name}
                    id={member.id || `member-${index}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm truncate">
                      {member.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      @{member.email.split("@")[0]}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  <p className="text-xs text-gray-600 truncate max-w-[80px]">
                    {member.projects?.[0] || "Project"}
                  </p>
                  <button className="text-gray-400 hover:text-[#E31B54]">
                    <UserPlus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default TeamMembersCard;
