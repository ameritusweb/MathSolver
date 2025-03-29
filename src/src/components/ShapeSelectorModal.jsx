import React, { useState } from 'react';
import { X } from 'lucide-react';

const shapes = [
  {
    id: 'circle',
    name: 'Circle',
    colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5']
  },
  {
    id: 'square',
    name: 'Square',
    colors: ['#FF9F1C', '#2EC4B6', '#E71D36', '#011627', '#41EAD4', '#CEE8C1']
  },
  {
    id: 'triangle',
    name: 'Triangle',
    colors: ['#9B5DE5', '#F15BB5', '#FEE440', '#00BBF9', '#00F5D4', '#CEE5D0']
  },
  {
    id: 'star',
    name: 'Star',
    colors: ['#FFD93D', '#FF8E9E', '#9EA1D4', '#A8D1D1', '#FFC54D', '#D4E2D4']
  },
  {
    id: 'heart',
    name: 'Heart',
    colors: ['#FF69B4', '#FF1493', '#DB7093', '#FFB6C1', '#FFC0CB', '#FFE4E1']
  }
];

const ShapeDisplay = ({ shape, color, size = 20 }) => {
  switch (shape) {
    case 'circle':
      return (
        <div 
          className="rounded-full" 
          style={{ 
            width: size, 
            height: size, 
            backgroundColor: color 
          }}
        />
      );
    case 'square':
      return (
        <div 
          className="rounded-sm" 
          style={{ 
            width: size, 
            height: size, 
            backgroundColor: color 
          }}
        />
      );
    case 'triangle':
      return (
        <div 
          style={{ 
            width: 0,
            height: 0,
            borderLeft: `${size/2}px solid transparent`,
            borderRight: `${size/2}px solid transparent`,
            borderBottom: `${size}px solid ${color}`
          }}
        />
      );
    case 'star':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      );
    case 'heart':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      );
    default:
      return null;
  }
};

const ShapeSelectorModal = ({ onSelect, onClose, value }) => {
    const [count, setCount] = useState(Math.abs(value || 1));
  
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-xl p-6 w-[500px] max-w-[90vw]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">Select Shape and Color</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
  
          {/* Add number input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of shapes
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={count}
              onChange={(e) => setCount(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
              className="w-24 px-3 py-2 text-gray-700 border rounded-md"
            />
          </div>
  
          {/* Update the shape buttons to use count */}
          <div className="grid gap-4">
            {shapes.map((shape) => (
              <div key={shape.id} className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-700 mb-2">{shape.name}</h4>
                <div className="grid grid-cols-6 gap-2">
                  {shape.colors.map((color) => (
                    <button
                      key={`${shape.id}-${color}`}
                      className="p-2 rounded hover:bg-gray-50 flex items-center justify-center"
                      onClick={() => onSelect({ 
                        shape: shape.id, 
                        color, 
                        value: value < 0 ? -count : count 
                      })}
                    >
                      <ShapeDisplay shape={shape.id} color={color} size={24} />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

export { ShapeSelectorModal, ShapeDisplay };