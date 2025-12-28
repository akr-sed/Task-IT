# 🪝 Custom Hooks Reference

Documentation for TaskIT's custom React hooks.

---

## Overview

TaskIT uses custom hooks to encapsulate complex logic and promote reusability. All hooks follow React conventions and are located in `frontend/src/hooks/`.

---

## useDashboardData

Main hook for fetching and managing dashboard data.

### Location
`hooks/useDashboardData.js`

### Purpose
Fetches all data needed for the dashboard in an optimized way using parallel requests.

### Usage

```jsx
import { useDashboardData } from '../hooks/useDashboardData';

const Dashboard = () => {
  const {
    projects,
    tasks,
    invitations,
    teamMembers,
    loading,
    invitesLoading,
    fetchDashboardData
  } = useDashboardData();
  
  if (loading) return <LoadingSpinner />;
  
  return (
    <div>
      <ProjectsSection projects={projects} />
      <TasksSection tasks={tasks} />
    </div>
  );
};
```

### Return Value

| Property | Type | Description |
|----------|------|-------------|
| projects | array | User's projects (owned + member) |
| tasks | array | All tasks across projects |
| invitations | array | Pending project invitations |
| teamMembers | array | Unique team members (max 4) |
| loading | boolean | Initial data loading |
| invitesLoading | boolean | Invitations loading |
| fetchDashboardData | function | Manual refetch |

### Implementation Details

```javascript
export const useDashboardData = () => {
  const [projects, setProjects] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const fetchDashboardData = useCallback(async () => {
    // Prevent duplicate calls
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    
    setLoading(true);

    // Parallel fetch for projects and invites
    const [projectsResponse, invitesResponse] = await Promise.allSettled([
      projectService.getAllProjects(),
      projectService.getMyInvitations(),
    ]);
    
    // Process projects...
    // Fetch tasks for all projects in parallel...
    // Batch fetch team members...
    
    setLoading(false);
    isFetchingRef.current = false;
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return { projects, tasks, invitations, teamMembers, loading, fetchDashboardData };
};
```

### Features

- **Parallel Fetching:** Uses `Promise.allSettled` for concurrent API calls
- **Duplicate Prevention:** Tracks in-flight requests with `useRef`
- **Error Handling:** Handles partial failures gracefully
- **Batch Optimization:** Fetches team members in batches

---

## useOptimizedDashboardData

Enhanced version with caching and reduced API calls.

### Location
`hooks/useOptimizedDashboardData.js`

### Purpose
Optimizes dashboard data fetching with request deduplication and caching.

### Usage

```jsx
import { useOptimizedDashboardData } from '../hooks/useOptimizedDashboardData';

const Dashboard = () => {
  const { data, loading, error, refresh } = useOptimizedDashboardData();
  
  if (error) return <ErrorMessage error={error} onRetry={refresh} />;
  if (loading) return <LoadingSpinner />;
  
  return <DashboardContent data={data} />;
};
```

### Return Value

| Property | Type | Description |
|----------|------|-------------|
| data | object | Complete dashboard data |
| loading | boolean | Loading state |
| error | string/null | Error message if failed |
| refresh | function | Force refresh data |

### Features

- **Request Deduplication:** Same requests are combined
- **Smart Caching:** Configurable cache TTL
- **Stale-While-Revalidate:** Shows cached data while refreshing
- **Auto-Refresh:** Optionally refresh on focus

---

## useCalendar

Hook for calendar functionality.

### Location
`hooks/useCalendar.js`

### Purpose
Manages calendar state and task filtering by date.

### Usage

```jsx
import { useCalendar } from '../hooks/useCalendar';

const CalendarPage = () => {
  const {
    currentDate,
    selectedDate,
    daysInMonth,
    tasksForDate,
    goToNextMonth,
    goToPrevMonth,
    selectDate,
    getTasksForDate
  } = useCalendar(allTasks);
  
  return (
    <div>
      <CalendarHeader
        date={currentDate}
        onNext={goToNextMonth}
        onPrev={goToPrevMonth}
      />
      <CalendarGrid
        days={daysInMonth}
        selectedDate={selectedDate}
        onDateSelect={selectDate}
        getTasksForDate={getTasksForDate}
      />
      <TaskList tasks={tasksForDate} />
    </div>
  );
};
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| tasks | array | All tasks with dueDate |

### Return Value

| Property | Type | Description |
|----------|------|-------------|
| currentDate | Date | Currently displayed month |
| selectedDate | Date/null | Selected calendar date |
| daysInMonth | array | Days array for rendering |
| tasksForDate | array | Tasks due on selected date |
| goToNextMonth | function | Navigate to next month |
| goToPrevMonth | function | Navigate to previous month |
| goToToday | function | Jump to current month |
| selectDate | function | Set selected date |
| getTasksForDate | function | Get tasks for specific date |

### Implementation Details

```javascript
export const useCalendar = (tasks = []) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  
  // Get all days in the current month
  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days = [];
    // Add padding for first week
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push({ date: null, isCurrentMonth: false });
    }
    // Add all days of month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push({
        date: new Date(year, month, d),
        isCurrentMonth: true,
        isToday: isSameDay(new Date(year, month, d), new Date())
      });
    }
    return days;
  }, [currentDate]);
  
  // Filter tasks for a specific date
  const getTasksForDate = useCallback((date) => {
    if (!date) return [];
    return tasks.filter(task => 
      task.dueDate && isSameDay(new Date(task.dueDate), date)
    );
  }, [tasks]);
  
  // Tasks for currently selected date
  const tasksForDate = useMemo(() => 
    getTasksForDate(selectedDate), 
    [selectedDate, getTasksForDate]
  );
  
  const goToNextMonth = useCallback(() => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1));
  }, []);
  
  const goToPrevMonth = useCallback(() => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1));
  }, []);
  
  return {
    currentDate,
    selectedDate,
    daysInMonth,
    tasksForDate,
    goToNextMonth,
    goToPrevMonth,
    goToToday: () => setCurrentDate(new Date()),
    selectDate: setSelectedDate,
    getTasksForDate
  };
};
```

---

## Hook Patterns

### Creating Custom Hooks

**Basic Structure:**
```javascript
import { useState, useEffect, useCallback, useMemo } from 'react';

export const useMyHook = (initialValue, options = {}) => {
  // State
  const [data, setData] = useState(initialValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Memoized values
  const computedValue = useMemo(() => {
    return expensiveComputation(data);
  }, [data]);
  
  // Callbacks
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await api.getData();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [/* dependencies */]);
  
  // Effects
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  // Return API
  return {
    data,
    loading,
    error,
    computedValue,
    refresh: fetchData
  };
};
```

### Hook Best Practices

1. **Naming:** Always prefix with `use`
2. **Dependencies:** Include all dependencies in arrays
3. **Memoization:** Use `useMemo` and `useCallback` appropriately
4. **Cleanup:** Return cleanup functions from effects
5. **Composition:** Combine smaller hooks into larger ones

### Avoiding Common Pitfalls

```javascript
// ❌ Bad: Missing dependencies
const fetchData = useCallback(async () => {
  const data = await api.get(projectId);
  setData(data);
}, []); // Missing projectId!

// ✅ Good: All dependencies included
const fetchData = useCallback(async () => {
  const data = await api.get(projectId);
  setData(data);
}, [projectId]);

// ❌ Bad: Creating new object in render
const options = { type: 'default' };
useEffect(() => {
  doSomething(options);
}, [options]); // Runs every render!

// ✅ Good: Memoize object
const options = useMemo(() => ({ type: 'default' }), []);
useEffect(() => {
  doSomething(options);
}, [options]);
```

---

## Utility Hooks (Future)

### Planned Hooks

| Hook | Purpose |
|------|---------|
| `useNotifications` | Manage notification state |
| `useProject` | Single project data & operations |
| `useTask` | Single task data & operations |
| `useAuth` | Authentication state |
| `useSocket` | Socket.IO connection management |
| `useDebounce` | Debounced value |
| `useLocalStorage` | localStorage sync |

---

*Last Updated: December 2025*
