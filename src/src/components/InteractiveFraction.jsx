import React, { useState } from 'react';
import { Group, Rect, Line, Text } from 'react-konva';
import NumberShapes from './NumberShapes';

const InteractiveFraction = ({ 
  x, 
  y, 
  onNumeratorClick, 
  onDenominatorClick,
  numerator,
  denominator,
  selected,
  onClick
}) => {
  const width = 60;
  const height = 80;
  const lineY = y + height/2;
  
  const renderNumber = (value, isShape, shape, color) => {
    if (isShape && shape) {
      return (
        <NumberShapes
          value={value}
          shapeType={shape}
          color={color}
          width={width - 10}
        />
      );
    } else {
      return (
        <Text
          text={value.toString()}
          fontSize={24}
          width={width}
          align="center"
          verticalAlign="middle"
        />
      );
    }
  };

  return (
    <Group
      x={x}
      y={y}
      onClick={onClick}
    >
      {/* Background */}
      <Rect
        width={width}
        height={height}
        fill="white"
        stroke={selected ? "#f1c40f" : "#3498db"}
        strokeWidth={selected ? 2 : 1}
        cornerRadius={5}
      />
      
      {/* Fraction line */}
      <Line
        points={[5, height/2, width-5, height/2]}
        stroke="#000"
        strokeWidth={2}
      />
      
      {/* Numerator clickable area */}
      <Group
        onClick={(e) => {
          e.cancelBubble = true;
          onNumeratorClick();
        }}
      >
        {renderNumber(
          numerator.value,
          numerator.isShape,
          numerator.shape,
          numerator.color
        )}
      </Group>
      
      {/* Denominator clickable area */}
      <Group
        y={height/2}
        onClick={(e) => {
          e.cancelBubble = true;
          onDenominatorClick();
        }}
      >
        {renderNumber(
          denominator.value,
          denominator.isShape,
          denominator.shape,
          denominator.color
        )}
      </Group>
    </Group>
  );
};

export default InteractiveFraction;