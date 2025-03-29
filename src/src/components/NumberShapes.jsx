import React from 'react';
import { Group, Circle, Rect, Line, Star } from 'react-konva';

const KonvaShape = ({ shape, color, size = 20, x, y }) => {
  switch (shape) {
    case 'circle':
      return (
        <Circle
          x={x + size/2}
          y={y + size/2}
          radius={size/2}
          fill={color}
        />
      );
    case 'square':
      return (
        <Rect
          x={x}
          y={y}
          width={size}
          height={size}
          fill={color}
          cornerRadius={2}
        />
      );
    case 'triangle':
      return (
        <Line
          points={[
            x + size/2, y,
            x + size, y + size,
            x, y + size
          ]}
          closed
          fill={color}
        />
      );
    case 'star':
      return (
        <Star
          x={x + size/2}
          y={y + size/2}
          numPoints={5}
          innerRadius={size/3}
          outerRadius={size/2}
          fill={color}
        />
      );
    case 'heart':
      // Create heart shape using a custom path
      const heartPath = [
        x + size/2, y + size/4,
        x + size/4, y,
        x, y + size/4,
        x + size/2, y + size,
        x + size, y + size/4,
        x + 3*size/4, y,
        x + size/2, y + size/4
      ];
      return (
        <Line
          points={heartPath}
          closed
          fill={color}
          tension={0.3}
        />
      );
    default:
      return null;
  }
};

const NumberShapes = ({ value, shapeType, color, width = 100 }) => {
  // Convert value to absolute number for display
  const count = Math.abs(parseInt(value));
  
  // Create array of specified length
  const shapes = Array.from({ length: count }, (_, i) => i);

  // Calculate grid layout
  const size = 20; // size of each shape
  const padding = 4; // padding between shapes
  const cols = Math.min(5, count); // max 5 shapes per row
  const rows = Math.ceil(count / cols);
  
  // Calculate total dimensions
  const totalWidth = cols * (size + padding) - padding;
  const totalHeight = rows * (size + padding) - padding;

  return (
    <Group>
      {/* Background rectangle */}
      <Rect
        width={totalWidth + padding * 2}
        height={totalHeight + padding * 2}
        fill={value < 0 ? '#fee2e2' : 'white'}
        cornerRadius={4}
      />
      
      {/* Shapes */}
      {shapes.map((i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = col * (size + padding) + padding;
        const y = row * (size + padding) + padding;
        
        return (
          <KonvaShape
            key={i}
            shape={shapeType}
            color={color}
            size={size}
            x={x}
            y={y}
          />
        );
      })}
    </Group>
  );
};

export default NumberShapes;