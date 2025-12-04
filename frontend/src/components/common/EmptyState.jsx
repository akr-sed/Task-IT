import React from 'react';

const EmptyState = ({ icon, message, actionLabel, onAction }) => {
  return (
    <div className="text-center py-8">
      {icon && <div className="mb-3">{icon}</div>}
      <p className="text-gray-500 text-sm mb-3">{message}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-gradient-to-r from-[#E31B54] to-[#E91E63] text-white rounded-full text-xs font-medium hover:shadow-lg transition-all"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;