export const priorityColors = {
  low: "bg-blue-100 text-blue-700 border-blue-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  high: "bg-red-100 text-red-700 border-red-200",
};

// ✅ Unified Select Styles
export const selectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: "40px",
    borderRadius: "10px",
    borderWidth: "2px",
    borderColor: state.isFocused ? "#E31B54" : "#E5E7EB",
    boxShadow: state.isFocused ? "0 0 0 3px rgba(227, 27, 84, 0.1)" : "none",
    "&:hover": { borderColor: "#E31B54" },
    transition: "all 0.2s ease",
    cursor: "pointer",
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
    padding: "10px 12px",
    transition: "all 0.15s ease",
    fontWeight: state.isSelected ? "600" : "500",
    "&:active": {
      backgroundColor: "#E31B54",
    },
  }),
  singleValue: (base) => ({
    ...base,
    color: "#374151",
    fontWeight: "500",
    fontSize: "14px",
  }),
  placeholder: (base) => ({
    ...base,
    color: "#9CA3AF",
    fontSize: "14px",
  }),
  menu: (base) => ({
    ...base,
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow:
      "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    zIndex: 9999, // ✅ Very high z-index to appear above everything
    border: "1px solid #E5E7EB",
    marginTop: "4px",
  }),
  menuList: (base) => ({
    ...base,
    padding: "4px",
    maxHeight: "200px", // ✅ Limit height to prevent huge dropdowns
  }),
  menuPortal: (base) => ({
    ...base,
    zIndex: 9999, // ✅ Ensure portal also has high z-index
  }),
  dropdownIndicator: (base, state) => ({
    ...base,
    color: state.isFocused ? "#E31B54" : "#9CA3AF",
    transition: "all 0.2s ease",
    "&:hover": {
      color: "#E31B54",
    },
  }),
  indicatorSeparator: (base) => ({
    ...base,
    backgroundColor: "#E5E7EB",
  }),
  input: (base) => ({
    ...base,
    color: "#374151",
  }),
};

export const statusColors = {
  todo: "bg-gray-100 text-gray-700 border-gray-200",
  "in progress": "bg-indigo-100 text-indigo-700 border-indigo-200",
  "to review": "bg-purple-100 text-purple-700 border-purple-200",
  done: "bg-green-100 text-green-700 border-green-200",
};

export const statusLabels = {
  todo: "To Do",
  "in progress": "In Progress",
  "to review": "To Review",
  done: "Done",
};

export const statusColumns = {
  todo: {
    id: "todo",
    title: "To Do",
    color: "from-gray-400 to-gray-500",
    icon: "M12 4v16m8-8H4",
  },
  "in progress": {
    id: "in progress",
    title: "In Progress",
    color: "from-indigo-400 to-indigo-600",
    icon: "M13 10V3L4 14h7v7l9-11h-7z",
  },
  "to review": {
    id: "to review",
    title: "Review",
    color: "from-purple-400 to-purple-600",
    icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z",
  },
  done: {
    id: "done",
    title: "Done",
    color: "from-green-400 to-green-600",
    icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  },
};

export const activityIcons = {
  BACKEND:
    "M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  FRONTEND: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
  DESIGN:
    "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01",
  TESTING: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  DEVOPS:
    "M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01",
  OTHER:
    "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4",
};

export const activityOptions = [
  { value: "BACKEND", label: "🔧 Backend" },
  { value: "FRONTEND", label: "🎨 Frontend" },
  { value: "DESIGN", label: "✨ Design" },
  { value: "TESTING", label: "🧪 Testing" },
  { value: "DEVOPS", label: "⚙️ DevOps" },
  { value: "OTHER", label: "📌 Other" },
];

export const priorityOptions = [
  { value: "low", label: "🟦 Low" },
  { value: "medium", label: "🟨 Medium" },
  { value: "high", label: "🟥 High" },
];

export const statusOptions = [
  { value: "todo", label: "To Do" },
  { value: "in progress", label: "In Progress" },
  { value: "to review", label: "To Review" },
  { value: "done", label: "Done" },
];
