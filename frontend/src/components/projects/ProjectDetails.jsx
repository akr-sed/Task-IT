import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { projectService } from '../../api';
import TaskList from "../tasks/TaskList";
import TaskAssignment from "../tasks/TaskAssignment";
import ProjectOverview from "./ProjectOverview";
import ProjectTeam from "./ProjectTeam";
import { getInitials, getRandomColor } from "../../utils/avatarUtils";
import { fetchProjectMembers, getUserName, getUserEmail } from "../../utils/userUtils";

const ProjectDetails = () => {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [members, setMembers] = useState({});
  const [ownerData, setOwnerData] = useState(null);
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isFetchingRef = useRef(false); // ✅ Prevent duplicate calls

  // Delete project states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteEmail, setDeleteEmail] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);

  // ✅ REMOVED: Role management states (now handled in ProjectTeam component)

  // Transfer ownership states
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferPassword, setTransferPassword] = useState("");
  const [transferEmail, setTransferEmail] = useState("");
  const [selectedNewOwner, setSelectedNewOwner] = useState("");
  const [transferError, setTransferError] = useState("");
  const [transferring, setTransferring] = useState(false);

  // Remove member states
  const [showRemoveMemberModal, setShowRemoveMemberModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [removingMember, setRemovingMember] = useState(false);
  const [removeMemberError, setRemoveMemberError] = useState("");

  // Invite modal state
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Get active tab from URL or default to "overview"
  const activeTab = searchParams.get("tab") || "overview";

  // Function to change tab and update URL
  const setActiveTab = (tab) => {
    setSearchParams({ tab });
  };

  // ✅ REMOVED: Duplicate role change states (now handled in ProjectTeam component)
  // - changingRole
  // - roleChangeSuccess  
  // - roleChangeError

  const fetchMembersData = useCallback(async (projectData) => {
    try {
      if (!projectData) return;

      const { usersMap, ownerData } = await fetchProjectMembers(projectData);
      
      setMembers(usersMap);
      setOwnerData(ownerData);
    } catch (err) {
      console.error("Error fetching member data:", err);
    }
  }, []);

  const fetchProject = useCallback(async () => {
    // ✅ Prevent duplicate calls
    if (isFetchingRef.current) {
      console.log("🔄 Already fetching project, skipping...");
      return;
    }

    isFetchingRef.current = true;
    setLoading(true);

    try {
      const response = await projectService.getProjectById(projectId);

      setProject(response.data.project);
      await fetchMembersData(response.data.project);
    } catch (err) {
      console.error("Error fetching project:", err);
      setError(err.response?.data?.message || "Failed to load project");
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, navigate, fetchMembersData]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const isOwner = () => {
    if (!project || !project.ownedBy) return false;
    const userId = JSON.parse(localStorage.getItem("user"))?.id;
    return project.ownedBy === userId;
  };

  const isAdmin = () => {
    if (!project) return false;
    const userId = JSON.parse(localStorage.getItem("user"))?.id;
    return project.members.some(
      (member) => member.id === userId && member.role === "admin"
    );
  };

  const getMemberName = (memberId) => {
    return getUserName(memberId, members);
  };

  const getMemberEmail = (memberId) => {
    return getUserEmail(memberId, members);
  };

  // ✅ SIMPLIFIED: Only handle API call and project state update
  // UI states (loading, success, error) are now managed in ProjectTeam component
  const handleRoleChange = async (memberId, newRole) => {
    await projectService.updateMemberRole(projectId, memberId, newRole);

    // Update local project state
    setProject((prevProject) => {
      const updatedMembers = prevProject.members.map((member) => {
        if (member.id === memberId) {
          return { ...member, role: newRole };
        }
        return member;
      });

      return { ...prevProject, members: updatedMembers };
    });
  };

  const openRemoveMemberModal = (member) => {
    setMemberToRemove(member);
    setShowRemoveMemberModal(true);
    setRemoveMemberError("");
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;

    setRemovingMember(true);
    setRemoveMemberError("");

    try {
      

      await projectService.removeMember(projectId, memberToRemove.id);

      setProject((prevProject) => ({
        ...prevProject,
        members: prevProject.members.filter(
          (member) => member.id !== memberToRemove.id
        ),
      }));

      setShowRemoveMemberModal(false);
      setMemberToRemove(null);
    } catch (err) {
      console.error("Error removing member:", err);
      setRemoveMemberError(
        err.response?.data?.message || "Failed to remove member"
      );
    } finally {
      setRemovingMember(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();

    if (!inviteEmail) {
      setInviteError("Please enter an email address");
      return;
    }

    setInviting(true);
    setInviteSuccess("");
    setInviteError("");

    try {
      await projectService.inviteUser(projectId, inviteEmail);

      setInviteSuccess(`Invitation sent to ${inviteEmail}`);
      setInviteEmail("");

      setTimeout(() => {
        setShowInviteModal(false);
        setInviteSuccess("");
      }, 2000);
    } catch (err) {
      console.error("Error sending invitation:", err);
      setInviteError(
        err.response?.data?.message || "Failed to send invitation"
      );
    } finally {
      setInviting(false);
    }
  };

  const handleTransferOwnership = async (e) => {
    e.preventDefault();

    if (!selectedNewOwner) {
      setTransferError("Please select a member to transfer ownership to");
      return;
    }

    if (!transferPassword || !transferEmail) {
      setTransferError("Please enter your email and password for confirmation");
      return;
    }

    const currentUserEmail = JSON.parse(localStorage.getItem("user"))?.email;
    if (transferEmail !== currentUserEmail) {
      setTransferError(
        "The email you entered doesn't match your account email"
      );
      return;
    }

    setTransferring(true);
    setTransferError("");

    try {
      await projectService.transferOwnership(projectId, selectedNewOwner, transferPassword);

      setProject((prevProject) => ({
        ...prevProject,
        ownedBy: selectedNewOwner,
      }));

      if (members[selectedNewOwner]) {
        setOwnerData(members[selectedNewOwner]);
      }

      setShowTransferModal(false);

      navigate(`/projects/${projectId}?tab=${activeTab}`, {
        state: {
          successMessage: "Project ownership transferred successfully",
        },
      });
    } catch (err) {
      console.error("Error transferring ownership:", err);
      setTransferError(
        err.response?.data?.message || "Failed to transfer ownership"
      );
      setTransferring(false);
    }
  };

  const handleDeleteProject = async (e) => {
    e.preventDefault();

    if (!deleteEmail || !deletePassword) {
      setDeleteError("Please enter both email and password");
      return;
    }

    const currentUserEmail = JSON.parse(localStorage.getItem("user"))?.email;
    if (deleteEmail !== currentUserEmail) {
      setDeleteError("The email you entered doesn't match your account email");
      return;
    }

    setDeleting(true);
    setDeleteError("");

    try {
      await projectService.deleteProject(projectId, deletePassword);

      navigate("/projects", {
        state: {
          successMessage: `Project "${project.name}" has been deleted successfully`,
        },
      });
    } catch (err) {
      console.error("Error deleting project:", err);
      setDeleteError(err.response?.data?.message || "Failed to delete project");
      setDeleting(false);
    }
  };

  const openDeleteModal = () => {
    setShowDeleteModal(true);
    setDeleteEmail(JSON.parse(localStorage.getItem("user"))?.email || "");
    setDeletePassword("");
    setDeleteError("");
  };

  const openTransferModal = () => {
    setShowTransferModal(true);
    setSelectedNewOwner("");
    setTransferEmail(JSON.parse(localStorage.getItem("user"))?.email || "");
    setTransferPassword("");
    setTransferError("");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#E31B54] mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border-2 border-red-200">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/projects")}
            className="px-6 py-3 bg-gradient-to-r from-[#E31B54] to-[#E91E63] text-white rounded-full font-semibold hover:shadow-xl transition-all"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Compact Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate("/projects")}
            className="flex items-center gap-2 text-gray-600 hover:text-[#E31B54] transition-colors group"
          >
            <svg
              className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span className="font-semibold">Back to Projects</span>
          </button>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {(isAdmin() || isOwner()) && (
              <button
                onClick={() => navigate(`/projects/${projectId}/edit`)}
                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-medium hover:bg-blue-100 transition-all flex items-center gap-2 text-sm"
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
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit Project
              </button>
            )}

            {isOwner() && (
              <>
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-[#E31B54] to-[#E91E63] text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2 text-sm"
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
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                  Invite Member
                </button>

                <button
                  onClick={openDeleteModal}
                  className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all"
                  title="Delete Project"
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Project Info Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-start gap-4">
            <div
              className={`w-16 h-16 bg-gradient-to-br ${getRandomColor(
                project._id
              )} rounded-2xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-lg`}
            >
              {getInitials(project.name)}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                {project.displayName || project.name}
              </h1>
              {project.description && (
                <p className="text-gray-600 mb-3">{project.description}</p>
              )}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-500">
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span className="font-medium">
                    {ownerData?.name || "Unknown"}
                  </span>
                </div>
                <span className="text-gray-300">•</span>
                <div className="flex items-center gap-2 text-gray-500">
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
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  <span>{(project.members?.length || 0) + 1} members</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mt-6 border-t border-gray-200 pt-4">
            {[
              {
                id: "overview", // ✅ Changed from "details"
                label: "Overview", // ✅ Changed from "Details"
                icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z", // ✅ Changed icon
              },
              {
                id: "tasks",
                label: "Tasks",
                icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
              },
              {
                id: "assignment",
                label: "Assignments",
                icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
              },
              {
                id: "members",
                label: "Members",
                icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
              },
            ].map((tab) => (
              <button
                key={tab.id}
                className={`flex-1 px-4 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-[#E31B54] to-[#E91E63] text-white shadow-lg"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
                onClick={() => setActiveTab(tab.id)}
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
                    d={tab.icon}
                  />
                </svg>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "overview" && ( // ✅ Changed from "details"
          <ProjectOverview
            project={project}
            members={members}
            ownerData={ownerData}
          />
        )}

        {activeTab === "tasks" && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <TaskList />
          </div>
        )}

        {activeTab === "assignment" && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <TaskAssignment />
          </div>
        )}

        {activeTab === "members" && (
          <ProjectTeam
            project={project}
            members={members}
            ownerData={ownerData}
            isOwner={isOwner}
            onInvite={() => setShowInviteModal(true)}
            onTransfer={openTransferModal}
            onRemoveMember={openRemoveMemberModal}
            onRoleChange={handleRoleChange}
          />
        )}
      </div>

      {/* Modals - Keep all your existing modals exactly as they are */}
      {/* Invite Modal */}
      {showInviteModal && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowInviteModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-[#E31B54] to-[#E91E63] p-6 rounded-t-2xl">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Invite Team Member
              </h3>
            </div>

            <form onSubmit={handleInvite} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-[#E31B54] focus:outline-none"
                  placeholder="colleague@example.com"
                  required
                />
              </div>

              {inviteSuccess && (
                <div className="p-3 bg-green-50 text-green-700 rounded-xl text-sm">
                  {inviteSuccess}
                </div>
              )}

              {inviteError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm">
                  {inviteError}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 h-12 border-2 border-gray-300 text-gray-700 rounded-full font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviting}
                  className="flex-1 h-12 bg-gradient-to-r from-[#E31B54] to-[#E91E63] text-white rounded-full font-semibold hover:shadow-lg disabled:opacity-50 transition-all"
                >
                  {inviting ? "Sending..." : "Send Invite"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-red-600 p-6 rounded-t-2xl">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                Delete Project
              </h3>
              <p className="text-red-100 text-sm mt-2">
                This action cannot be undone!
              </p>
            </div>

            <form onSubmit={handleDeleteProject} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Email
                </label>
                <input
                  type="email"
                  value={deleteEmail}
                  onChange={(e) => setDeleteEmail(e.target.value)}
                  className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Password
                </label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none"
                  required
                />
              </div>

              {deleteError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm">
                  {deleteError}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 h-12 border-2 border-gray-300 text-gray-700 rounded-full font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleting}
                  className="flex-1 h-12 bg-red-600 text-white rounded-full font-semibold hover:bg-red-700 disabled:opacity-50 transition-all"
                >
                  {deleting ? "Deleting..." : "Delete Forever"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showTransferModal && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowTransferModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-yellow-500 p-6 rounded-t-2xl">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <svg
                  className="w-6 h-6"
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
                Transfer Ownership
              </h3>
            </div>

            <form onSubmit={handleTransferOwnership} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  New Owner
                </label>
                <select
                  value={selectedNewOwner}
                  onChange={(e) => setSelectedNewOwner(e.target.value)}
                  className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:outline-none"
                  required
                >
                  <option value="">Select a member</option>
                  {project.members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {getMemberName(member.id)} ({getMemberEmail(member.id)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Email
                </label>
                <input
                  type="email"
                  value={transferEmail}
                  onChange={(e) => setTransferEmail(e.target.value)}
                  className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Password
                </label>
                <input
                  type="password"
                  value={transferPassword}
                  onChange={(e) => setTransferPassword(e.target.value)}
                  className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:outline-none"
                  required
                />
              </div>

              {transferError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm">
                  {transferError}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="flex-1 h-12 border-2 border-gray-300 text-gray-700 rounded-full font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={transferring}
                  className="flex-1 h-12 bg-yellow-500 text-white rounded-full font-semibold hover:bg-yellow-600 disabled:opacity-50 transition-all"
                >
                  {transferring ? "Transferring..." : "Transfer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Remove Member Modal */}
      {showRemoveMemberModal && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowRemoveMemberModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-red-600 p-6 rounded-t-2xl">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6"
                  />
                </svg>
                Remove Member
              </h3>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-gray-700">
                Are you sure you want to remove{" "}
                <span className="font-semibold">
                  {getMemberName(memberToRemove?.id)}
                </span>
                ? They will lose access to this project.
              </p>

              {removeMemberError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm">
                  {removeMemberError}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowRemoveMemberModal(false)}
                  className="flex-1 h-12 border-2 border-gray-300 text-gray-700 rounded-full font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRemoveMember}
                  disabled={removingMember}
                  className="flex-1 h-12 bg-red-600 text-white rounded-full font-semibold hover:bg-red-700 disabled:opacity-50 transition-all"
                >
                  {removingMember ? "Removing..." : "Remove"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
