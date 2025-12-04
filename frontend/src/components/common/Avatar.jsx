import React from 'react';
import { getInitials, getRandomColor } from '../../utils/avatarUtils';

const Avatar = ({ name, id, size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-xs',
    lg: 'w-10 h-10 text-sm',
    xl: 'w-12 h-12 text-base',
  };

  return (
    <div
      className={`${sizes[size]} rounded-full bg-gradient-to-br ${getRandomColor(
        id
      )} flex items-center justify-center text-white font-bold ${className}`}
    >
      {getInitials(name)}
    </div>
  );
};

export default Avatar;