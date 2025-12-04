import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

const FloatingActionButton = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/projects/new")}
      className="fixed bottom-6 right-6 w-12 h-12 bg-gradient-to-r from-[#E31B54] to-[#E91E63] text-white rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center z-50"
    >
      <Plus className="w-5 h-5" />
    </button>
  );
};

export default FloatingActionButton;