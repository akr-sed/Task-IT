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

  const getTasksForDate = (day) => {
    const dateStr = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      day
    )
      .toISOString()
      .split("T")[0];
    return tasks.filter(
      (task) => task.dueDate && task.dueDate.startsWith(dateStr)
    );
  };

  return (
    <Card>
      <div className="flex flex-col h-full">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between mb-3 flex-shrink-0">
          <h3 className="font-bold text-[#E31B54] text-xs sm:text-sm">
            {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
          </h3>
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