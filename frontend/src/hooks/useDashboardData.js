import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { projectService, taskService, authService } from '../api';

export const useDashboardData = () => {
  const [projects, setProjects] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [invitesLoading, setInvitesLoading] = useState(true);

  const navigate = useNavigate();
  const isFetchingRef = useRef(false); // Prevent duplicate calls

  const fetchDashboardData = useCallback(async () => {
    // Prevent duplicate calls
    if (isFetchingRef.current) {
      console.log('🔄 Already fetching dashboard data, skipping...');
      return;
    }

    isFetchingRef.current = true;
    setLoading(true);
    setInvitesLoading(true);

    try {
      // ✅ PARALLEL FETCH - All independent requests at once
      const [projectsResponse, invitesResponse] = await Promise.allSettled([
        projectService.getAllProjects(),
        projectService.getMyInvitations(),
      ]);

      // Handle Projects Response
      let projectsData = [];
      if (projectsResponse.status === "fulfilled") {
        projectsData = projectsResponse.value.data.projects || [];
        setProjects(projectsData);
      } else {
        console.error("Error fetching projects:", projectsResponse.reason);
      }

      // Handle Invitations Response
      if (invitesResponse.status === "fulfilled") {
        const formattedInvites = invitesResponse.value.data.invitations.map(
          (invite) => ({
            _id: invite._id,
            inviteCode: invite.inviteCode,
            projectId: {
              _id: invite.projectId,
              name:
                invitesResponse.value.data.projectNames[invite.projectId] ||
                "Unknown Project",
            },
            invitedBy: {
              name:
                invitesResponse.value.data.invitorNames[invite._id] ||
                "Unknown",
              email:
                invitesResponse.value.data.invitorEmails[invite._id] ||
                "No email",
            },
            invitedEmail: invite.invitedEmail,
          })
        );
        setInvitations(formattedInvites);
      } else {
        console.error("Error fetching invitations:", invitesResponse.reason);
        setInvitations([]);
      }
      setInvitesLoading(false);

      // ✅ BATCH FETCH TASKS - Get all tasks from relevant projects for the dashboard metrics & calendar
      if (projectsData.length > 0) {
        // We used to fetch only 'my tasks'. To support the "All Tasks" view in CalendarCard,
        // we need to fetch tasks for all projects w.r.t permissions.
        
        // Parallel fetch for all projects
        const tasksPromises = projectsData.map(p => taskService.getTasksByProject(p._id));
        const tasksResponses = await Promise.all(tasksPromises);
        
        const allTasks = tasksResponses.flatMap((r, i) => {
            const tasks = r.data.tasks || [];
            // Attach project reference to each task for filtering later
            return tasks.map(t => ({ ...t, project: projectsData[i] }));
        });

        setTasks(allTasks);

        // ✅ BATCH FETCH MEMBERS - Collect unique IDs first, then fetch once
        const uniqueMemberIds = new Set();
        projectsData.forEach((project) => {
          if (project.members && Array.isArray(project.members)) {
            project.members.forEach((member) => {
              if (member.id) uniqueMemberIds.add(member.id);
            });
          }
        });

        if (uniqueMemberIds.size > 0) {
          // Use batch API if available, otherwise fetch individually
          const memberIds = Array.from(uniqueMemberIds);
          
          // Check if batch endpoint exists
          try {
            const batchResponse = await authService.getUsersByIds(memberIds);

            const membersData = batchResponse.data.users || [];
            const membersMap = new Map();

            // Build members map with project associations
            projectsData.forEach((project) => {
              if (project.members && Array.isArray(project.members)) {
                project.members.forEach((member) => {
                  const memberData = membersData.find((m) => m._id === member.id);
                  if (memberData) {
                    if (!membersMap.has(member.id)) {
                      membersMap.set(member.id, {
                        id: member.id,
                        name: memberData.name,
                        email: memberData.email,
                        projects: [project.name],
                        projectIds: [project._id],
                      });
                    } else {
                      const existing = membersMap.get(member.id);
                      if (!existing.projects.includes(project.name)) {
                        existing.projects.push(project.name);
                        existing.projectIds.push(project._id);
                      }
                    }
                  }
                });
              }
            });

            setTeamMembers(Array.from(membersMap.values()).slice(0, 4));
          } catch (batchErr) {
            console.error("Batch API not available, falling back to individual requests" , batchErr);
            
            // Fallback: fetch individually but in parallel
            const memberPromises = memberIds.map((memberId) =>
              authService.getUserById(memberId)
            );

            const memberResults = await Promise.all(memberPromises);
            const membersMap = new Map();

            projectsData.forEach((project) => {
              if (project.members && Array.isArray(project.members)) {
                project.members.forEach((member) => {
                  const memberResult = memberResults.find(
                    (m) => m?.id === member.id
                  );
                  if (memberResult?.data) {
                    if (!membersMap.has(member.id)) {
                      membersMap.set(member.id, {
                        id: member.id,
                        name: memberResult.data.name,
                        email: memberResult.data.email,
                        projects: [project.name],
                        projectIds: [project._id],
                      });
                    } else {
                      const existing = membersMap.get(member.id);
                      if (!existing.projects.includes(project.name)) {
                        existing.projects.push(project.name);
                        existing.projectIds.push(project._id);
                      }
                    }
                  }
                });
              }
            });

            setTeamMembers(Array.from(membersMap.values()).slice(0, 4));
          }
        }
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
      setLoading(false);
      setInvitesLoading(false);
    } finally {
      isFetchingRef.current = false;
    }
  }, [navigate]); // Only depend on navigate

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]); // Depend on the memoized function

  return {
    projects,
    invitations,
    tasks,
    teamMembers,
    loading,
    invitesLoading,
    refetch: fetchDashboardData,
  };
};