import React from 'react';
import Card from '../../common/Card';
import { monthNames } from '../../../utils/dateUtils';
import { useCalendar } from '../../../hooks/useCalendar';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CalendarCard = ({ tasks }) => {
  const {
    selectedDate,
    daysInMonth,
    startingDayOfWeek,
    goToPreviousMonth,
    goToNextMonth,
    isToday,
  } = useCalendar();

  const [viewMode, setViewMode] = React.useState("my"); // 'my' or 'all'
  const currentUserId = JSON.parse(localStorage.getItem("user"))?.id;

  const getTasksForDate = (day) => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    
    // Create date using local time to avoid timezone shifts
    const d = new Date(year, month, day);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      
    return tasks.filter((task) => {
      // 1. Check Due Date
      if (!task.dueDate || !task.dueDate.startsWith(dateStr)) return false;

      // 2. Apply View Filter
      if (viewMode === 'my') {
        return task.assignedTo === currentUserId;
      } else {
        // 'all' mode logic
        if (!task.project) return false;
        
        const isOwner = task.project.ownedBy === currentUserId;
        const isAdmin = task.project.members?.some(
            m => m.id === currentUserId && m.role === 'admin'
        );
        
        return isOwner || isAdmin || task.assignedTo === currentUserId;
      }
    });
  };

  return (
    <Card>
      <div className="flex flex-col h-full">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between mb-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-[#E31B54] text-xs sm:text-sm">
                {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
            </h3>
            {/* Minimal Toggle */}
            <button
                onClick={() => setViewMode(v => v === 'my' ? 'all' : 'my')}
                className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors border border-gray-200"
                title={viewMode === 'my' ? "Switch to All Tasks" : "Switch to My Tasks"}
            >
                {viewMode === 'my' ? 'My Tasks' : 'All Tasks'}
            </button>
          </div>

          <div className="flex gap-1">
            <button 
              onClick={goToPreviousMonth}
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            <button 
              onClick={goToNextMonth}
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Calendar Grid - Flexible */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1 text-center text-[9px] sm:text-[10px] mb-1 sm:mb-2 flex-shrink-0">
            {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day) => (
              <div key={day} className="font-semibold text-gray-600 py-0.5 sm:py-1">{day}</div>
            ))}
          </div>
          
          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1 flex-1 auto-rows-fr">
            {Array.from({ length: startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1 }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const tasksForDay = getTasksForDate(day);
              const todayCheck = isToday(day);
              
              return (
                <button
                  key={day}
                  className={`flex items-center justify-center rounded-md sm:rounded-lg text-[10px] sm:text-xs transition-all hover:bg-gray-100 min-h-[28px] sm:min-h-[32px] ${
                    todayCheck ? 'bg-[#E31B54] text-white font-bold shadow-md' : 'text-gray-700'
                  } ${tasksForDay.length > 0 && !todayCheck ? 'font-semibold bg-purple-50 border border-purple-200' : ''}`}
                  title={tasksForDay.length > 0 ? `${tasksForDay.length} tasks` : ''}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CalendarCard;