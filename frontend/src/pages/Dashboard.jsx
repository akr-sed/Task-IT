import React from "react";
import { useDashboardData } from "../hooks/useDashboardData";

// Card Components
import InvitationsCard from "../components/dashboard/cards/InvitationsCard";
import ProjectsCard from "../components/dashboard/cards/ProjectsCard";
import TeamMembersCard from "../components/dashboard/cards/TeamMembersCard";
import ActivityCard from "../components/dashboard/cards/ActivityCard";
import TasksCard from "../components/dashboard/cards/TasksCard";
import CalendarCard from "../components/dashboard/cards/CalendarCard";
import ProgressCard from "../components/dashboard/cards/ProgressCard";
import FloatingActionButton from "../components/dashboard/shared/FloatingActionButton";

const Dashboard = () => {
  const {
    projects,
    invitations,
    tasks,
    teamMembers,
    loading,
    invitesLoading,
  } = useDashboardData();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#E31B54] mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
          <p className="text-gray-400 text-sm mt-2">Please wait while we fetch your data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-4 sm:space-y-6 px-2 sm:px-4 lg:px-0">
      {/* Welcome Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">
          Welcome back! 👋
        </h1>
        <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
          Here's what's happening with your projects today
        </p>
      </div>

      {/* Invitations Section - Only show if there are invitations */}
      {invitations && invitations.length > 0 && (
        <div className="mb-4 sm:mb-6">
          <InvitationsCard 
            invitations={invitations} 
            invitesLoading={invitesLoading} 
          />
        </div>
      )}

      {/* All Cards Grid - Responsive: 1 col on mobile, 2 cols on md, 3 cols on lg */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="h-[400px] sm:h-[420px] lg:h-[450px]">
          <ProjectsCard projects={projects} />
        </div>
        <div className="h-[400px] sm:h-[420px] lg:h-[450px]">
          <ProgressCard projects={projects} />
        </div>
        <div className="h-[400px] sm:h-[420px] lg:h-[450px]">
          <ActivityCard />
        </div>
        <div className="h-[400px] sm:h-[420px] lg:h-[450px]">
          <TasksCard tasks={tasks} />
        </div>
        <div className="h-[400px] sm:h-[420px] lg:h-[450px]">
          <TeamMembersCard teamMembers={teamMembers} />
        </div>
        <div className="h-[400px] sm:h-[420px] lg:h-[450px]">
          <CalendarCard tasks={tasks} />
        </div>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton />
    </div>
  );
};

export default Dashboard;