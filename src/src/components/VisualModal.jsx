import React from 'react';
import { X } from 'lucide-react';
import TrigClock from './TrigClock';

const VisualModal = ({ visual, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl p-6 w-[800px] max-w-[95vw] max-h-[95vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">
            {visual === 'clock' && '🕒 Interactive Trigonometry Clock'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="mt-4">
          {visual === 'clock' && <TrigClock />}
        </div>
      </div>
    </div>
  );
};

export default VisualModal;