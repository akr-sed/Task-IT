import React, { useState } from "react";
import Select from "react-select";
import { getInitials, getRandomColor } from "../../utils/avatarUtils";
import { getUserName, getUserEmail } from "../../utils/userUtils";
import { Star } from 'lucide-react';

// Custom styles for react-select
const selectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: "35px",
    borderRadius: "8px",
    borderWidth: "2px",
    borderColor: state.isFocused ? "#E31B54" : "#E5E7EB",
    boxShadow: "none",
    cursor: "pointer",
    "&:hover": {
      borderColor: "#E31B54",
    },
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
    padding: "10px 10px",
    fontWeight: state.isSelected ? "600" : "500",
    "&:active": {
      backgroundColor: "#E31B54",
    },
  }),
  singleValue: (base) => ({
    ...base,
    color: "#374151",
    fontWeight: "600",
    fontSize: "14px",
  }),
  menu: (base) => ({
    ...base,
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    border: "2px solid #E5E7EB",
    marginTop: "4px",
  }),
  menuList: (base) => ({
    ...base,
    padding: "4px",
  }),
  dropdownIndicator: (base, state) => ({
    ...base,
    color: state.isFocused ? "#E31B54" : "#9CA3AF",
    "&:hover": {
      color: "#E31B54",
    },
  }),
  indicatorSeparator: () => ({
    display: "none",
  }),
};

// Role options with icons
const roleOptions = [
  {
    value: "member",
    label: "👤 Member",
  },
  {
    value: "admin",
    label: "🛡️ Admin",
  },
];

// Custom option component with description
const CustomOption = (props) => {
  const { data, innerRef, innerProps } = props;
  return (
    <div
      ref={innerRef}
      {...innerProps}
      className={`px-3 py-2 cursor-pointer rounded-lg transition-colors ${
        props.isSelected
          ? "bg-[#E31B54] text-white"
          : props.isFocused
          ? "bg-pink-50"
          : "hover:bg-gray-50"
      }`}
    >
      <div className="font-semibold text-sm">{data.label}</div>
      <div
        className={`text-xs mt-0.5 ${
          props.isSelected ? "text-white/80" : "text-gray-500"
        }`}
      >
        {data.description}
      </div>
    </div>
  );
};

const ProjectTeam = ({
  project,
  members,
  ownerData,
  isOwner,
  onInvite,
  onTransfer,
  onRemoveMember,
  onRoleChange,
}) => {
  const [changingRole, setChangingRole] = useState({});
  const [roleChangeSuccess, setRoleChangeSuccess] = useState({});
  const [roleChangeError, setRoleChangeError] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  const currentUserId = JSON.parse(localStorage.getItem("user"))?.id;

  const handleRoleChange = async (memberId, newRole) => {
    setChangingRole((prev) => ({ ...prev, [memberId]: true }));
    setRoleChangeSuccess((prev) => ({ ...prev, [memberId]: "" }));
    setRoleChangeError((prev) => ({ ...prev, [memberId]: "" }));

    try {
      await onRoleChange(memberId, newRole);
      setRoleChangeSuccess((prev) => ({
        ...prev,
        [memberId]: `Role changed to ${newRole}`,
      }));

      setTimeout(() => {
        setRoleChangeSuccess((prev) => ({ ...prev, [memberId]: "" }));
      }, 3000);
    } catch (err) {
      console.error("Error changing role:", err);
      setRoleChangeError((prev) => ({
        ...prev,
        [memberId]: err.response?.data?.message || err.message || "Failed to change role",
      }));
    } finally {
      setChangingRole((prev) => ({ ...prev, [memberId]: false }));
    }
  };

  const getMemberName = (memberId) => {
    return getUserName(memberId, members);
  };

  const getMemberEmail = (memberId) => {
    return getUserEmail(memberId, members);
  };

  // ✅ Sort members: Current user first, then others
  const sortedMembers = project.members ? [...project.members].sort((a, b) => {
    // Current user comes first
    if (a.id === currentUserId) return -1;
    if (b.id === currentUserId) return 1;
    // Keep original order for others
    return 0;
  }) : [];

  // Filter members by search (using sorted list)
  const filteredMembers = sortedMembers.filter((member) => {
    const name = getMemberName(member.id).toLowerCase();
    const email = getMemberEmail(member.id).toLowerCase();
    const query = searchQuery.toLowerCase();
    return name.includes(query) || email.includes(query);
  });

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <svg
              className="w-6 h-6 text-[#E31B54]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            Team Members
            <span className="text-sm font-normal text-gray-500">
              ({(project.members?.length || 0) + 1} total)
            </span>
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage your project team and permissions
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isOwner() && project.members && project.members.length > 0 && (
            <button
              onClick={onTransfer}
              className="px-4 py-2 bg-yellow-50 text-yellow-700 rounded-xl font-medium hover:bg-yellow-100 transition-all text-sm flex items-center gap-2 border border-yellow-200"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                />
              </svg>
              Transfer
            </button>
          )}
          {isOwner() && (
            <button
              onClick={onInvite}
              className="px-4 py-2 bg-gradient-to-r from-[#E31B54] to-[#E91E63] text-white rounded-xl font-medium hover:shadow-lg transition-all text-sm flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Invite Member
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      {project.members && project.members.length > 3 && (
        <div className="relative">
          <svg
            className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search members by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-4 border-2 border-gray-200 rounded-xl focus:border-[#E31B54] focus:outline-none transition-colors text-sm bg-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Owner Section */}
      <div className="bg-gradient-to-br from-purple-50 via-white to-purple-50 rounded-2xl border-2 border-purple-200 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-3">
          <div className="flex items-center gap-2 text-white">
            <Star className="w-5 h-5" fill="currentColor" />
            <span className="font-bold text-sm">Project Owner</span>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-4">
            <div
              className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getRandomColor(
                project.ownedBy
              )} flex items-center justify-center text-white font-bold text-xl shadow-lg`}
            >
              {getInitials(ownerData?.name || "Owner")}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-bold text-gray-900">
                  {ownerData?.name || "Owner"}
                </h3>
                {isOwner() && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
                    You
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600">{ownerData?.email || ""}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Members Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-lg font-bold text-gray-900">Team Members</h3>
          <span className="text-sm text-gray-500">
            ({project.members?.length || 0})
          </span>
        </div>

        {project.members && project.members.length > 0 ? (
          <div className="space-y-3">
            {(searchQuery ? filteredMembers : sortedMembers).map((member) => {
              const isCurrentUser = member.id === currentUserId;

              return (
                <div
                  key={member.id}
                  className="bg-white rounded-2xl p-5 border-2 border-gray-200 hover:border-[#E31B54] transition-all group"
                >
                  {/* Top Row: Avatar, Info, and Actions */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    {/* Left: Avatar + Info */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      {/* Avatar */}
                      <div
                        className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getRandomColor(
                          member.id
                        )} flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:scale-110 transition-transform flex-shrink-0`}
                      >
                        {getInitials(getMemberName(member.id))}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h4 className="font-bold text-gray-900 text-lg">
                            {getMemberName(member.id)}
                          </h4>
                          {isCurrentUser && (
                            <span className="px-2 py-0.5 bg-[#E31B54]/10 text-[#E31B54] text-xs font-bold rounded-full">
                              You
                            </span>
                          )}
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              member.role === "admin"
                                ? "bg-green-100 text-green-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {member.role === "admin" ? "Admin" : "Member"}
                          </span>
                        </div>

                        <p className="text-sm text-gray-600">
                          {getMemberEmail(member.id)}
                        </p>
                      </div>
                    </div>

                    {/* Right: Remove Button - Only for owner */}
                    {isOwner() && member.id !== project.ownedBy && (
                      <div className="flex gap-3 items-center justify-center">
                        <div className="pl-[40px] pt-2 border-t border-gray-100">
                          <div className="flex items-center gap-2">
                            <div className="w-48">
                              <Select
                                value={roleOptions.find(
                                  (opt) => opt.value === member.role
                                )}
                                onChange={(selected) =>
                                  handleRoleChange(member.id, selected.value)
                                }
                                options={roleOptions}
                                styles={selectStyles}
                                isDisabled={changingRole[member.id]}
                                isSearchable={false}
                                components={{ Option: CustomOption }}
                                placeholder="Select role..."
                              />
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => onRemoveMember(member)}
                          className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium flex items-center gap-1.5 border-2 border-red-100 hover:border-red-200 flex-shrink-0"
                          title="Remove member"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          Remove
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Success/Error Messages */}
                  {roleChangeSuccess[member.id] && (
                    <div className="mb-2 p-2 bg-green-50 text-green-700 rounded-lg text-xs font-medium ml-[72px]">
                      {roleChangeSuccess[member.id]}
                    </div>
                  )}
                  {roleChangeError[member.id] && (
                    <div className="mb-2 p-2 bg-red-50 text-red-700 rounded-lg text-xs font-medium ml-[72px]">
                      {roleChangeError[member.id]}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
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
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              No team members yet
            </h3>
            <p className="text-gray-600 mb-4">
              Invite colleagues to collaborate on this project
            </p>
            {isOwner() && (
              <button
                onClick={onInvite}
                className="px-6 py-2.5 bg-gradient-to-r from-[#E31B54] to-[#E91E63] text-white rounded-xl font-semibold hover:shadow-lg transition-all inline-flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Invite Your First Member
              </button>
            )}
          </div>
        )}

        {searchQuery && filteredMembers?.length === 0 && (
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              No members found
            </h3>
            <p className="text-gray-600">Try a different search term</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectTeam;