/**
 * Optimized Dashboard Data Hook
 * 
 * Features:
 * - Smart caching (5 minute TTL)
 * - Request deduplication
 * - Parallel requests
 * - Fast initial load
 * - Stale cache fallback
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { projectService, taskService, authService } from '../api';
import { cacheManager } from '../utils/cacheManager';
import { requestDeduplicator } from '../utils/requestDeduplicator';

export const useOptimizedDashboardData = () => {
  const [projects, setProjects] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [invitesLoading, setInvitesLoading] = useState(true);

  const navigate = useNavigate();
  const isFetchingRef = useRef(false);
  const lastFetchRef = useRef(0);

  const fetchDashboardData = useCallback(async (skipCache = false) => {
    if (isFetchingRef.current) {
      console.log('🔄 Already fetching dashboard data, skipping...');
      return;
    }

    isFetchingRef.current = true;

    try {
      setLoading(true);
      setInvitesLoading(true);

      // Check cache first
      const cacheKey = 'dashboard:all-data';
      if (!skipCache) {
        const cachedData = cacheManager.get(cacheKey);
        if (cachedData) {
          console.log('📦 Loading dashboard from cache');
          setProjects(cachedData.projects || []);
          setInvitations(cachedData.invitations || []);
          setTasks(cachedData.tasks || []);
          setTeamMembers(cachedData.teamMembers || []);
          setLoading(false);
          setInvitesLoading(false);
          isFetchingRef.current = false;
          return;
        }
      }

      // Use deduplication for parallel requests
      const [projectsResponse, invitesResponse] = await Promise.all([
        requestDeduplicator.deduplicate('projects:all', () => 
          projectService.getAllProjects()
        ),
        requestDeduplicator.deduplicate('invitations:all', () => 
          projectService.getMyInvitations()
        ),
      ]);

      let projectsData = [];
      if (projectsResponse?.status === 200) {
        projectsData = projectsResponse.data.projects || [];
        setProjects(projectsData);
      }

      if (invitesResponse?.status === 200) {
        const formattedInvites = invitesResponse.data.invitations.map((invite) => ({
          _id: invite._id,
          inviteCode: invite.inviteCode,
          projectId: {
            _id: invite.projectId,
            name: invitesResponse.data.projectNames[invite.projectId] || "Unknown Project",
          },
          invitedBy: {
            name: invitesResponse.data.invitorNames[invite._id] || "Unknown",
            email: invitesResponse.data.invitorEmails[invite._id] || "No email",
          },
          invitedEmail: invite.invitedEmail,
        }));
        setInvitations(formattedInvites);
      }
      setInvitesLoading(false);

      // Fetch tasks in parallel
      if (projectsData.length > 0) {
        const tasksPromises = projectsData.map(p =>
          requestDeduplicator.deduplicate(`tasks:${p._id}`, () =>
            taskService.getTasksByProject(p._id)
          )
        );

        const tasksResponses = await Promise.all(tasksPromises);
        const allTasks = tasksResponses.flatMap((r, i) => {
          const tasks = r?.data?.tasks || [];
          return tasks.map(t => ({ ...t, project: projectsData[i] }));
        });
        setTasks(allTasks);

        // Fetch team members
        const uniqueMemberIds = new Set();
        projectsData.forEach((project) => {
          if (project.members && Array.isArray(project.members)) {
            project.members.forEach((member) => {
              if (member.id) uniqueMemberIds.add(member.id);
            });
          }
        });

        if (uniqueMemberIds.size > 0) {
          const memberIds = Array.from(uniqueMemberIds);
          try {
            const batchResponse = await requestDeduplicator.deduplicate(
              `members:batch:${memberIds.join(',')}`,
              () => authService.getUsersByIds(memberIds)
            );

            const membersData = batchResponse?.data?.users || [];
            const membersMap = new Map();

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
          } catch (err) {
            console.error("Error fetching members:", err);
          }
        }
      }

      // Cache the entire dashboard data
      const dashboardData = {
        projects: projectsData,
        invitations: invitations.length > 0 ? invitations : [],
        tasks: tasks.length > 0 ? tasks : [],
        teamMembers: teamMembers.length > 0 ? teamMembers : [],
      };
      cacheManager.set(cacheKey, dashboardData, 5 * 60 * 1000);

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
      lastFetchRef.current = Date.now();
    }
  }, [navigate, invitations, tasks, teamMembers]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    projects,
    invitations,
    tasks,
    teamMembers,
    loading,
    invitesLoading,
    refetch: (skipCache) => fetchDashboardData(skipCache),
  };
};

export default useOptimizedDashboardData;
