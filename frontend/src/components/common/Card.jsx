import React from 'react';

const Card = ({ children, className = '' }) => {
  return (
    <div className={`bg-white rounded-2xl p-5 shadow-md border border-gray-100 h-full flex flex-col ${className}`}>
      {children}
    </div>
  );
};

export default Card;