import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { projectService } from '../../../api';
import { getInitials, getRandomColor } from "../../../utils/avatarUtils";
import { Mail, ChevronDown, Inbox, Check, X, Loader2 } from 'lucide-react';

const InvitationsCard = ({ invitations, invitesLoading }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [declining, setDeclining] = useState({});
  const [localInvitations, setLocalInvitations] = useState(invitations);

  const handleAcceptInvite = (projectId, inviteId, inviteCode) => {
    navigate(`/projects/${projectId}/invite/${inviteId}/${inviteCode}`);
  };

  const handleDeclineInvite = async (projectId, inviteId, inviteCode, e) => {
    e.stopPropagation();
    setDeclining((prev) => ({ ...prev, [inviteId]: true }));

    try {
      await projectService.declineInvitation(projectId, inviteId, inviteCode);

      setLocalInvitations((prev) => prev.filter((inv) => inv._id !== inviteId));
    } catch (err) {
      console.error("Error declining invite:", err);
      setDeclining((prev) => ({ ...prev, [inviteId]: false }));
    }
  };

  if (invitesLoading || localInvitations.length === 0) return null;

  return (
    <div className="relative">
      {/* Notification Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-green-400 rounded-2xl p-4 transition-all duration-300 hover:shadow-md w-full"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Icon with Badge */}
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                <Mail className="w-6 h-6 text-white" />
              </div>
              {/* Notification Badge */}
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md">
                {localInvitations.length}
              </div>
            </div>

            <div className="text-left">
              <h3 className="text-lg font-bold text-gray-900">
                Project Invitations
              </h3>
              <p className="text-sm text-gray-600">
                {localInvitations.length} pending{" "}
                {localInvitations.length === 1 ? "invitation" : "invitations"}
              </p>
            </div>
          </div>

          {/* Chevron Icon */}
          <ChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* Dropdown Panel */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isOpen ? "max-h-[2000px] opacity-100 mt-4" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg overflow-hidden">
          {/* Panel Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-3">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Inbox className="w-5 h-5" />
                <span className="font-bold">Your Invitations</span>
              </div>
              <span className="px-2.5 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold">
                {localInvitations.length}
              </span>
            </div>
          </div>

          {/* Invitations Grid */}
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {localInvitations.map((invite) => (
                <div
                  key={invite._id}
                  className="bg-white rounded-xl border-2 border-gray-200 hover:border-green-400 transition-all duration-200 overflow-hidden hover:shadow-md"
                >
                  <div className="p-4">
                    {/* Project Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getRandomColor(
                          invite.projectId?._id
                        )} flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0`}
                      >
                        {getInitials(invite.projectId?.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 text-sm truncate">
                          {invite.projectId?.name}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 mb-3 text-xs">
                      <div
                        className={`w-5 h-5 rounded-full bg-gradient-to-br ${getRandomColor(
                          invite.invitedBy?.email
                        )} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
                      >
                        {getInitials(invite.invitedBy?.name).charAt(0)}
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="truncate text-gray-900 font-medium">
                          {invite.invitedBy?.name}
                        </span>
                        <span className="truncate text-gray-600">
                          {invite.invitedBy?.email}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <button
                        onClick={() =>
                          handleAcceptInvite(
                            invite.projectId._id,
                            invite._id,
                            invite.inviteCode
                          )
                        }
                        disabled={declining[invite._id]}
                        className="w-full py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        <Check className="w-4 h-4" />
                        Accept
                      </button>

                      <button
                        onClick={(e) =>
                          handleDeclineInvite(
                            invite.projectId._id,
                            invite._id,
                            invite.inviteCode,
                            e
                          )
                        }
                        disabled={declining[invite._id]}
                        className="w-full py-2 border border-gray-300 text-gray-600 hover:border-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                      >
                        {declining[invite._id] ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <X className="w-4 h-4" />
                            Decline
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvitationsCard;
