import React from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

const MessageAlert = ({ message, onClose }) => {
  if (!message.text) return null;

  return (
    <div className={`p-4 rounded-xl border-l-4 animate-slide-down ${
      message.type === 'success' 
        ? 'bg-green-50 border-green-500 text-green-700' 
        : 'bg-red-50 border-red-500 text-red-700'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
          ) : (
            <XCircle className="h-5 w-5 flex-shrink-0" />
          )}
          <p className="text-sm font-medium">{message.text}</p>
        </div>
        <button onClick={onClose} className="text-current opacity-70 hover:opacity-100">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default MessageAlert;
