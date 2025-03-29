import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Circle, Line, Text, Arc, Group, Rect } from 'react-konva';

const TrigClock = () => {
  const [angle, setAngle] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showSine, setShowSine] = useState(true);
  const [showCosine, setShowCosine] = useState(true);
  const [showTangent, setShowTangent] = useState(false);
  const [showWaves, setShowWaves] = useState(true);
  const [wavePoints, setWavePoints] = useState({ sine: [], cosine: [] });
  const [labelStyle, setLabelStyle] = useState('both'); // 'radians', 'degrees', or 'both'
  const [playing, setPlaying] = useState(false);

  // Animation effect
  useEffect(() => {
    let animation;
    if (playing) {
      animation = setInterval(() => {
        setAngle(prev => (prev + 0.02) % (2 * Math.PI));
      }, 16); // ~60fps
    }
    return () => clearInterval(animation);
  }, [playing]);

  // Clock dimensions
  const radius = 100;
  const centerX = 150;
  const centerY = 150;
  
  // Wave dimensions
  const waveWidth = 200;
  const waveHeight = radius;
  const waveX = centerX + radius + 50;
  const waveY = centerY;

  // Calculate point position
  const x = centerX + radius * Math.cos(angle);
  const y = centerY - radius * Math.sin(angle);
  const sine = -Math.sin(angle);
  const cosine = Math.cos(angle);
  const tangent = Math.tan(angle);

  // Key angles for landmarks
  const keyAngles = [
    { angle: 0, label: '0', rLabel: '0' },
    { angle: Math.PI/6, label: '30°', rLabel: 'π/6' },
    { angle: Math.PI/4, label: '45°', rLabel: 'π/4' },
    { angle: Math.PI/3, label: '60°', rLabel: 'π/3' },
    { angle: Math.PI/2, label: '90°', rLabel: 'π/2' },
    { angle: 2*Math.PI/3, label: '120°', rLabel: '2π/3' },
    { angle: 3*Math.PI/4, label: '135°', rLabel: '3π/4' },
    { angle: 5*Math.PI/6, label: '150°', rLabel: '5π/6' },
    { angle: Math.PI, label: '180°', rLabel: 'π' },
    { angle: 7*Math.PI/6, label: '210°', rLabel: '7π/6' },
    { angle: 5*Math.PI/4, label: '225°', rLabel: '5π/4' },
    { angle: 4*Math.PI/3, label: '240°', rLabel: '4π/3' },
    { angle: 3*Math.PI/2, label: '270°', rLabel: '3π/2' },
    { angle: 5*Math.PI/3, label: '300°', rLabel: '5π/3' },
    { angle: 7*Math.PI/4, label: '315°', rLabel: '7π/4' },
    { angle: 11*Math.PI/6, label: '330°', rLabel: '11π/6' },
  ];

  // Update wave points when angle changes
  useEffect(() => {
    setWavePoints(prev => {
      const newSine = [...prev.sine, { x: angle * 30, y: sine * radius }];
      const newCosine = [...prev.cosine, { x: angle * 30, y: cosine * radius }];
      
      // Keep only last 50 points
      if (newSine.length > 50) newSine.shift();
      if (newCosine.length > 50) newCosine.shift();
      
      return {
        sine: newSine,
        cosine: newCosine
      };
    });
  }, [angle]);

  const handleDrag = (e) => {
    if (!isDragging) return;
    
    const stage = e.target.getStage();
    const mousePos = stage.getPointerPosition();
    
    const dx = mousePos.x - centerX;
    const dy = mousePos.y - centerY;
    let newAngle = Math.atan2(-dy, dx);
    
    if (newAngle < 0) newAngle += 2 * Math.PI;
    setAngle(newAngle);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex gap-4 mb-4 flex-wrap items-center">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showSine}
            onChange={(e) => setShowSine(e.target.checked)}
          />
          Show Sine
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showCosine}
            onChange={(e) => setShowCosine(e.target.checked)}
          />
          Show Cosine
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showTangent}
            onChange={(e) => setShowTangent(e.target.checked)}
          />
          Show Tangent
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showWaves}
            onChange={(e) => setShowWaves(e.target.checked)}
          />
          Show Waves
        </label>
        <select 
          value={labelStyle} 
          onChange={(e) => setLabelStyle(e.target.value)}
          className="border rounded px-2 py-1 bg-white"
        >
          <option value="both">Show Both Labels</option>
          <option value="degrees">Degrees Only</option>
          <option value="radians">Radians Only</option>
        </select>

        <button
          onClick={() => setPlaying(!playing)}
          className={`px-4 py-1 rounded font-medium ${
            playing 
              ? 'bg-red-100 text-red-700 hover:bg-red-200' 
              : 'bg-green-100 text-green-700 hover:bg-green-200'
          }`}
        >
          {playing ? '⏸ Pause' : '▶️ Play'}
        </button>

        <button
          onClick={() => {
            setAngle(0);
            setWavePoints({ sine: [], cosine: [] });
            setPlaying(false);
          }}
          className="px-4 py-1 bg-blue-100 text-blue-700 rounded font-medium hover:bg-blue-200"
        >
          🔄 Reset
        </button>
      </div>
      
      <div 
        className="border rounded-lg bg-white"
        onMouseMove={handleDrag}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
      >
        <Stage width={600} height={400}>
          <Layer>
            {/* Unit circle label */}
            <Text
              x={centerX - 30}
              y={centerY - radius - 25}
              text="Unit Circle (radius = 1)"
              fontSize={12}
              fill="#666"
            />

            {/* Clock circle */}
            <Circle
              x={centerX}
              y={centerY}
              radius={radius}
              stroke="#666"
              strokeWidth={1}
            />
            
            {/* Key angle landmarks */}
            {keyAngles.map((keyAngle) => {
              const kx = centerX + (radius + 20) * Math.cos(keyAngle.angle);
              const ky = centerY - (radius + 20) * Math.sin(keyAngle.angle);
              const innerKx = centerX + (radius - 5) * Math.cos(keyAngle.angle);
              const innerKy = centerY - (radius - 5) * Math.sin(keyAngle.angle);
              
              return (
                <Group key={keyAngle.angle}>
                  <Line
                    points={[
                      centerX + radius * Math.cos(keyAngle.angle),
                      centerY - radius * Math.sin(keyAngle.angle),
                      innerKx,
                      innerKy
                    ]}
                    stroke="#999"
                    strokeWidth={1}
                  />
                  {(labelStyle === 'degrees' || labelStyle === 'both') && (
                    <Text
                      x={kx + 5}
                      y={ky - 10}
                      text={keyAngle.label}
                      fontSize={10}
                      fill="#666"
                    />
                  )}
                  {(labelStyle === 'radians' || labelStyle === 'both') && (
                    <Text
                      x={kx + 5}
                      y={ky + 5}
                      text={keyAngle.rLabel}
                      fontSize={10}
                      fill="#444"
                    />
                  )}
                </Group>
              );
            })}

            {/* Angle arc */}
            <Arc
              x={centerX}
              y={centerY}
              angle={angle * 180 / Math.PI}
              rotation={0}
              innerRadius={20}
              outerRadius={30}
              fill="#e3f2fd"
              stroke="#2196f3"
              strokeWidth={1}
            />
            
            {/* Current angle text */}
            <Text
              x={centerX - 60}
              y={centerY - 40}
              text={`${(angle * 180 / Math.PI).toFixed(0)}° (${(angle).toFixed(2)} rad)`}
              fontSize={14}
            />

            {/* Main radius line */}
            <Line
              points={[centerX, centerY, x, y]}
              stroke="#2196f3"
              strokeWidth={2}
            />
            
            {/* Draggable point */}
            <Circle
              x={x}
              y={y}
              radius={6}
              fill="#2196f3"
              onMouseDown={() => setIsDragging(true)}
              onTouchStart={() => setIsDragging(true)}
            />

            {/* Sine visualization */}
            {showSine && (
              <>
                <Line
                  points={[x, y, x, centerY]}
                  stroke="#4caf50"
                  strokeWidth={2}
                  dash={[4, 4]}
                />
                <Text
                  x={x + 10}
                  y={centerY + (y - centerY)/2}
                  text={`sin = ${sine.toFixed(2)}`}
                  fill="#4caf50"
                  fontSize={14}
                />
              </>
            )}

            {/* Cosine visualization */}
            {showCosine && (
              <>
                <Line
                  points={[centerX, y, x, y]}
                  stroke="#f44336"
                  strokeWidth={2}
                  dash={[4, 4]}
                />
                <Text
                  x={centerX + (x - centerX)/2}
                  y={y + 10}
                  text={`cos = ${cosine.toFixed(2)}`}
                  fill="#f44336"
                  fontSize={14}
                />
              </>
            )}

            {/* Wave visualization */}
            {showWaves && (
              <>
                {/* Wave background */}
                <Rect
                  x={waveX}
                  y={centerY - radius}
                  width={waveWidth}
                  height={2 * radius}
                  fill="#f5f5f5"
                  stroke="#ddd"
                />
                
                {/* Sine wave */}
                {showSine && wavePoints.sine.length > 1 && (
                  <Line
                    points={wavePoints.sine.flatMap((p, i) => [
                      waveX + (i * waveWidth / 50),
                      waveY + p.y
                    ])}
                    stroke="#4caf50"
                    strokeWidth={2}
                  />
                )}
                
                {/* Cosine wave */}
                {showCosine && wavePoints.cosine.length > 1 && (
                  <Line
                    points={wavePoints.cosine.flatMap((p, i) => [
                      waveX + (i * waveWidth / 50),
                      waveY + p.y
                    ])}
                    stroke="#f44336"
                    strokeWidth={2}
                  />
                )}
              </>
            )}
          </Layer>
        </Stage>
      </div>

      <div className="mt-4 text-sm text-gray-600 max-w-xl">
        <h3 className="font-bold mb-2">Enhanced Features:</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Watch sine and cosine waves form as you move the point</li>
          <li>See key angles marked in both degrees and radians</li>
          <li>Notice how the unit circle (radius = 1) relates to the values</li>
          <li>Toggle between different angle label styles</li>
          <li>Observe how the waves repeat every full rotation (2π)</li>
        </ul>
      </div>
    </div>
  );
};

export default TrigClock;