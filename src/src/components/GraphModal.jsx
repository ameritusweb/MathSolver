import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import * as math from 'mathjs';
import { X } from 'lucide-react';

const GraphModal = ({ expression, onClose }) => {
  // Generate points for the graph
  const generatePoints = () => {
    try {
      // Parse the expression to isolate y
      let funcExpression = expression;
      if (expression.includes('=')) {
        const [left, right] = expression.split('=').map(side => side.trim());
        // If left side is just 'y', use the right side
        if (left.trim() === 'y') {
          funcExpression = right;
        }
        // If right side is just 'y', use the left side
        else if (right.trim() === 'y') {
          funcExpression = left;
        }
        // Otherwise try to solve for y
        else {
          throw new Error('Expression must be in the form y = f(x)');
        }
      }

      // Create a compiled function
      const compiled = math.parse(funcExpression).compile();
      
      // Generate points from -10 to 10
      const points = [];
      for (let x = -10; x <= 10; x += 0.5) {
        try {
          const y = compiled.evaluate({ x });
          points.push({ x, y });
        } catch (err) {
          console.error('Error evaluating point:', err);
        }
      }
      return points;
    } catch (err) {
      console.error('Error generating points:', err);
      return [];
    }
  };

  const points = generatePoints();

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-[700px] max-w-[90vw]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">Graph of Function</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <p className="font-medium text-gray-700">{expression}</p>
        </div>
        
        <div className="h-[400px] w-full bg-white rounded-lg overflow-hidden border">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={points} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="x"
                type="number"
                domain={[-10, 10]}
                tickCount={11}
                stroke="#6B7280"
              />
              <YAxis 
                type="number"
                domain={[-10, 10]}
                tickCount={11}
                stroke="#6B7280"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '0.5rem',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="y" 
                stroke="#3B82F6"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default GraphModal;