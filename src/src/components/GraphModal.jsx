import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import * as math from 'mathjs';

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[600px] max-w-[90vw]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Graph of: {expression}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>
        
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={points}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="x"
                type="number"
                domain={[-10, 10]}
                tickCount={11}
              />
              <YAxis 
                type="number"
                domain={[-10, 10]}
                tickCount={11}
              />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="y" 
                stroke="#8884d8" 
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