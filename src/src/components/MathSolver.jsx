import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Text, Group, Rect, Line } from 'react-konva';
import inferEquation from '../math/inferEquation';
import GraphModal from './GraphModal';

const MathSolver = () => {

  const commonEquations = [
    {
      id: 'natural_exp',
      name: 'Natural Exponential (y = e^x)',
      symbols: [
        { id: 'y', type: 'variable', text: 'y' },
        { id: 'equals', type: 'operator', text: '=' },
        { id: 'e', type: 'number', text: 'e' },
        { id: 'power', type: 'operator', text: '^' },
        { id: 'x', type: 'variable', text: 'x' }
      ]
    },
    {
      id: 'exp_decay',
      name: 'Exponential Decay (y = e^-x)',
      symbols: [
        { id: 'y', type: 'variable', text: 'y' },
        { id: 'equals', type: 'operator', text: '=' },
        { id: 'e', type: 'number', text: 'e' },
        { id: 'power', type: 'operator', text: '^' },
        { id: 'open_paren', type: 'grouping', text: '(' },
        { id: 'minus', type: 'operator', text: '-' },
        { id: 'x', type: 'variable', text: 'x' },
        { id: 'close_paren', type: 'grouping', text: ')' }
      ]
    },
    {
      id: 'tan',
      name: 'Tangent (y = tan(x))',
      symbols: [
        { id: 'y', type: 'variable', text: 'y' },
        { id: 'equals', type: 'operator', text: '=' },
        { id: 'tan', type: 'function', text: 'tan' },
        { id: 'open_paren', type: 'grouping', text: '(' },
        { id: 'x', type: 'variable', text: 'x' },
        { id: 'close_paren', type: 'grouping', text: ')' }
      ]
    },
    {
      id: 'ln',
      name: 'Natural Log (y = ln(x))',
      symbols: [
        { id: 'y', type: 'variable', text: 'y' },
        { id: 'equals', type: 'operator', text: '=' },
        { id: 'ln', type: 'function', text: 'ln' },
        { id: 'open_paren', type: 'grouping', text: '(' },
        { id: 'x', type: 'variable', text: 'x' },
        { id: 'close_paren', type: 'grouping', text: ')' }
      ]
    },
    {
      id: 'abs',
      name: 'Absolute Value (y = |x|)',
      symbols: [
        { id: 'y', type: 'variable', text: 'y' },
        { id: 'equals', type: 'operator', text: '=' },
        { id: 'abs', type: 'function', text: 'abs' },
        { id: 'open_paren', type: 'grouping', text: '(' },
        { id: 'x', type: 'variable', text: 'x' },
        { id: 'close_paren', type: 'grouping', text: ')' }
      ]
    },
    {
      id: 'linear',
      name: 'Linear (y = x)',
      symbols: [
        { id: 'y', type: 'variable', text: 'y' },
        { id: 'equals', type: 'operator', text: '=' },
        { id: 'x', type: 'variable', text: 'x' }
      ]
    },
    {
      id: 'quadratic',
      name: 'Quadratic (y = x²)',
      symbols: [
        { id: 'y', type: 'variable', text: 'y' },
        { id: 'equals', type: 'operator', text: '=' },
        { id: 'x', type: 'variable', text: 'x' },
        { id: 'power', type: 'operator', text: '^' },
        { id: '2', type: 'number', text: '2' }
      ]
    },
    {
      id: 'cubic',
      name: 'Cubic (y = x³)',
      symbols: [
        { id: 'y', type: 'variable', text: 'y' },
        { id: 'equals', type: 'operator', text: '=' },
        { id: 'x', type: 'variable', text: 'x' },
        { id: 'power', type: 'operator', text: '^' },
        { id: '3', type: 'number', text: '3' }
      ]
    },
    {
      id: 'sine',
      name: 'Sine (y = sin(x))',
      symbols: [
        { id: 'y', type: 'variable', text: 'y' },
        { id: 'equals', type: 'operator', text: '=' },
        { id: 'sin', type: 'function', text: 'sin' },
        { id: 'open_paren', type: 'grouping', text: '(' },
        { id: 'x', type: 'variable', text: 'x' },
        { id: 'close_paren', type: 'grouping', text: ')' }
      ]
    },
    {
      id: 'cosine',
      name: 'Cosine (y = cos(x))',
      symbols: [
        { id: 'y', type: 'variable', text: 'y' },
        { id: 'equals', type: 'operator', text: '=' },
        { id: 'cos', type: 'function', text: 'cos' },
        { id: 'open_paren', type: 'grouping', text: '(' },
        { id: 'x', type: 'variable', text: 'x' },
        { id: 'close_paren', type: 'grouping', text: ')' }
      ]
    },
    {
      id: 'exponential',
      name: 'Exponential (y = 2^x)',
      symbols: [
        { id: 'y', type: 'variable', text: 'y' },
        { id: 'equals', type: 'operator', text: '=' },
        { id: '2', type: 'number', text: '2' },
        { id: 'power', type: 'operator', text: '^' },
        { id: 'x', type: 'variable', text: 'x' }
      ]
    },
    {
      id: 'root',
      name: 'Square Root (y = √x)',
      symbols: [
        { id: 'y', type: 'variable', text: 'y' },
        { id: 'equals', type: 'operator', text: '=' },
        { id: 'sqrt', type: 'function', text: '√' },
        { id: 'x', type: 'variable', text: 'x' }
      ]
    },
    {
      id: 'inverse',
      name: 'Inverse (y = 1/x)',
      symbols: [
        { id: 'y', type: 'variable', text: 'y' },
        { id: 'equals', type: 'operator', text: '=' },
        { id: '1', type: 'number', text: '1' },
        { id: 'divide', type: 'operator', text: '÷' },
        { id: 'x', type: 'variable', text: 'x' }
      ]
    }
  ];

  // Available mathematical symbols
  const mathSymbols = [
    { id: 'x', type: 'variable', text: 'x' },
    { id: 'y', type: 'variable', text: 'y' },
    { id: 'plus', type: 'operator', text: '+' },
    { id: 'minus', type: 'operator', text: '-' },
    { id: 'multiply', type: 'operator', text: '×' },
    { id: 'divide', type: 'operator', text: '÷' },
    { id: 'power', type: 'operator', text: '^' },
    { id: 'equals', type: 'operator', text: '=' },
    { id: 'of', type: 'operator', text: 'of' }, // Added the "of" operator
    { id: 'percent', type: 'operator', text: '%' }, // Added the "%" operator
    { id: 'pi', type: 'constant', text: 'π' },  // Added pi constant
    { id: 'e', type: 'constant', text: 'e' },   // Added e constant
    { id: '1', type: 'number', text: '1' },
    { id: '2', type: 'number', text: '2' },
    { id: '3', type: 'number', text: '3' },
    { id: '4', type: 'number', text: '4' },
    { id: '5', type: 'number', text: '5' },
    { id: '6', type: 'number', text: '6' },
    { id: '7', type: 'number', text: '7' },
    { id: '8', type: 'number', text: '8' },
    { id: '9', type: 'number', text: '9' },
    { id: '0', type: 'number', text: '0' },
    { id: 'sqrt', type: 'function', text: '√' },
    { id: 'sin', type: 'function', text: 'sin' },
    { id: 'cos', type: 'function', text: 'cos' },
    { id: 'tan', type: 'function', text: 'tan' },
    { id: 'open_paren', type: 'grouping', text: '(' },
    { id: 'close_paren', type: 'grouping', text: ')' },
    { id: 'dot', type: 'number', text: '.' },
  ];
  
  // Available unit conversion symbols
  const unitSymbols = [
    // Length
    { id: 'meter', type: 'unit', text: 'm', category: 'length', conversionBase: 1 },
    { id: 'kilometer', type: 'unit', text: 'km', category: 'length', conversionBase: 1000 },
    { id: 'centimeter', type: 'unit', text: 'cm', category: 'length', conversionBase: 0.01 },
    { id: 'millimeter', type: 'unit', text: 'mm', category: 'length', conversionBase: 0.001 },
    { id: 'foot', type: 'unit', text: 'ft', category: 'length', conversionBase: 0.3048 },
    { id: 'inch', type: 'unit', text: 'in', category: 'length', conversionBase: 0.0254 },
    { id: 'yard', type: 'unit', text: 'yd', category: 'length', conversionBase: 0.9144 },
    { id: 'mile', type: 'unit', text: 'mi', category: 'length', conversionBase: 1609.34 },
    
    // Weight/Mass
    { id: 'gram', type: 'unit', text: 'g', category: 'mass', conversionBase: 1 },
    { id: 'kilogram', type: 'unit', text: 'kg', category: 'mass', conversionBase: 1000 },
    { id: 'milligram', type: 'unit', text: 'mg', category: 'mass', conversionBase: 0.001 },
    { id: 'pound', type: 'unit', text: 'lb', category: 'mass', conversionBase: 453.592 },
    { id: 'ounce', type: 'unit', text: 'oz', category: 'mass', conversionBase: 28.3495 },
    { id: 'ton', type: 'unit', text: 'ton', category: 'mass', conversionBase: 907185 },
    
    // Volume
    { id: 'liter', type: 'unit', text: 'L', category: 'volume', conversionBase: 1 },
    { id: 'milliliter', type: 'unit', text: 'mL', category: 'volume', conversionBase: 0.001 },
    { id: 'gallon', type: 'unit', text: 'gal', category: 'volume', conversionBase: 3.78541 },
    { id: 'quart', type: 'unit', text: 'qt', category: 'volume', conversionBase: 0.946353 },
    { id: 'pint', type: 'unit', text: 'pt', category: 'volume', conversionBase: 0.473176 },
    { id: 'cup', type: 'unit', text: 'cup', category: 'volume', conversionBase: 0.24 },
    { id: 'fluidounce', type: 'unit', text: 'fl oz', category: 'volume', conversionBase: 0.0295735 },
    
    // Temperature (special case, needs offset)
    { id: 'celsius', type: 'unit', text: '°C', category: 'temperature', conversionBase: 1, offset: 0 },
    { id: 'fahrenheit', type: 'unit', text: '°F', category: 'temperature', conversionBase: 5/9, offset: -32 },
    { id: 'kelvin', type: 'unit', text: 'K', category: 'temperature', conversionBase: 1, offset: -273.15 },
    
    // Time
    { id: 'second', type: 'unit', text: 's', category: 'time', conversionBase: 1 },
    { id: 'minute', type: 'unit', text: 'min', category: 'time', conversionBase: 60 },
    { id: 'hour', type: 'unit', text: 'hr', category: 'time', conversionBase: 3600 },
    { id: 'day', type: 'unit', text: 'day', category: 'time', conversionBase: 86400 },
    { id: 'week', type: 'unit', text: 'wk', category: 'time', conversionBase: 604800 },
  ];

  // Pre-defined conversion factors as blocks
  const conversionFactors = [
    { id: 'mi-ft', type: 'conversion', text: '5280 ft / 1 mi', fromUnit: 'mi', toUnit: 'ft', factor: 5280 },
    { id: 'ft-in', type: 'conversion', text: '12 in / 1 ft', fromUnit: 'ft', toUnit: 'in', factor: 12 },
    { id: 'yd-ft', type: 'conversion', text: '3 ft / 1 yd', fromUnit: 'yd', toUnit: 'ft', factor: 3 },
    { id: 'mi-km', type: 'conversion', text: '1.60934 km / 1 mi', fromUnit: 'mi', toUnit: 'km', factor: 1.60934 },
    { id: 'm-cm', type: 'conversion', text: '100 cm / 1 m', fromUnit: 'm', toUnit: 'cm', factor: 100 },
    { id: 'kg-lb', type: 'conversion', text: '2.20462 lb / 1 kg', fromUnit: 'kg', toUnit: 'lb', factor: 2.20462 },
    { id: 'lb-oz', type: 'conversion', text: '16 oz / 1 lb', fromUnit: 'lb', toUnit: 'oz', factor: 16 },
    { id: 'gal-L', type: 'conversion', text: '3.78541 L / 1 gal', fromUnit: 'gal', toUnit: 'L', factor: 3.78541 },
    { id: 'L-mL', type: 'conversion', text: '1000 mL / 1 L', fromUnit: 'L', toUnit: 'mL', factor: 1000 },
    { id: 'hr-min', type: 'conversion', text: '60 min / 1 hr', fromUnit: 'hr', toUnit: 'min', factor: 60 },
    { id: 'min-s', type: 'conversion', text: '60 s / 1 min', fromUnit: 'min', toUnit: 's', factor: 60 },
  ];
  
  // Combined symbols for toolbar
  const allSymbols = [...mathSymbols, ...unitSymbols];
  
  // State for elements placed on canvas
  const [placedSymbols, setPlacedSymbols] = useState([]);
  // State for containers/rectangles
  const [containers, setContainers] = useState([
    { id: 'container_1', x: 50, y: 40, width: 400, height: 160, color: '#e8f4f8' },
    { id: 'container_2', x: 50, y: 220, width: 400, height: 160, color: '#f0f8e8' },
  ]);
  // State for equation and result
  const [equation, setEquation] = useState('');
  const [result, setResult] = useState(null);
  // State for error messages
  const [error, setError] = useState('');
  // State for selected container (for creating new containers)
  const [selectedContainer, setSelectedContainer] = useState(null);
  // State for active symbol category
  const [activeCategory, setActiveCategory] = useState('math'); // 'math', 'length', 'mass', 'volume', 'temperature', 'time'
  
  const [graphContainer, setGraphContainer] = useState(null);

  const clearContainer = (containerId) => {
    setPlacedSymbols(placedSymbols.filter(sym => sym.containerId !== containerId));
  };

  const getContainerExpression = (containerId) => {
    const symbolsByContainer = {};
      
      // Initialize with all containers
      containers.forEach(cont => {
        symbolsByContainer[cont.id] = [];
      });
      
      // Add symbols to their containers
      placedSymbols.forEach(sym => {
        if (sym.containerId) {
          symbolsByContainer[sym.containerId].push(sym);
        }
      });
      
      // Sort symbols within each container from left to right
      Object.keys(symbolsByContainer).forEach(containerId => {
        symbolsByContainer[containerId].sort((a, b) => a.x - b.x);
      });
      
    const symbols = symbolsByContainer[containerId] || [];
    return symbols
      .sort((a, b) => a.x - b.x)
      .map(sym => sym.text)
      .join(' ')
      .trim();
  };

  const handleEquationClick = (equation) => {
    // Find the first empty or nearly empty container
    const targetContainer = containers.find(container => {
      const symbolsInContainer = placedSymbols.filter(sym => sym.containerId === container.id);
      return symbolsInContainer.length < 3; // Consider container empty if it has less than 3 symbols
    });

    if (!targetContainer) {
      setError('Please add a new container first');
      return;
    }

    // Calculate starting position in container
    const startX = targetContainer.x + 50;
    const startY = targetContainer.y + targetContainer.height / 2;
    
    // Add each symbol from the equation
    const newSymbols = equation.symbols.map((symbol, index) => ({
      ...symbol,
      instanceId: `${symbol.id}_${Date.now()}_${index}`,
      x: startX + (index * 50), // Space symbols horizontally
      y: startY,
      containerId: targetContainer.id
    }));

    setPlacedSymbols([...placedSymbols, ...newSymbols]);
  };

  const stageRef = useRef(null);
  const layerRef = useRef(null);
  
  // Handle dropping a symbol onto the canvas
  const handleSymbolDrop = (symbol) => {
    // Get stage center position for initial placement
    const stage = stageRef.current;
    const centerX = stage.width() / 2;
    const centerY = stage.height() / 2;
    
    // Create a new placed symbol with a unique instance ID
    const newSymbol = {
      ...symbol,
      instanceId: `${symbol.id}_${Date.now()}`,
      x: centerX,
      y: centerY,
      containerId: null, // Not in any container yet
    };
    
    setPlacedSymbols([...placedSymbols, newSymbol]);
  };
  
  // Handle dragging symbols on the canvas
  const handleSymbolDragMove = (e, instanceId) => {
    const newX = e.target.x();
    const newY = e.target.y();
    
    // Update the position of the dragged symbol
    setPlacedSymbols(
      placedSymbols.map((sym) => 
        sym.instanceId === instanceId ? { ...sym, x: newX, y: newY } : sym
      )
    );
  };
  
  // Handle end of symbol drag - check if inside container
  const handleSymbolDragEnd = (e, instanceId) => {
    const symbolX = e.target.x();
    const symbolY = e.target.y();
    
    // Find if the symbol is inside any container
    let containerId = null;
    for (const container of containers) {
      if (
        symbolX >= container.x && 
        symbolX <= container.x + container.width &&
        symbolY >= container.y && 
        symbolY <= container.y + container.height
      ) {
        containerId = container.id;
        break;
      }
    }
    
    // Update the symbol's container
    setPlacedSymbols(
      placedSymbols.map((sym) => 
        sym.instanceId === instanceId ? { ...sym, containerId } : sym
      )
    );
  };
  
  // Handle dragging containers
  const handleContainerDragMove = (e, containerId) => {
    const newX = e.target.x();
    const newY = e.target.y();
    
    // Update container position
    setContainers(
      containers.map((cont) => 
        cont.id === containerId ? { ...cont, x: newX, y: newY } : cont
      )
    );
    
    // Update positions of all symbols inside this container
    const container = containers.find(c => c.id === containerId);
    if (container) {
      const deltaX = newX - container.x;
      const deltaY = newY - container.y;
      
      setPlacedSymbols(
        placedSymbols.map((sym) => 
          sym.containerId === containerId 
            ? { ...sym, x: sym.x + deltaX, y: sym.y + deltaY } 
            : sym
        )
      );
    }
  };
  
  // Create a new container
  const createContainer = () => {
    const newContainer = {
      id: `container_${Date.now()}`,
      x: 50,
      y: 350,
      width: 400,
      height: 160,
      color: `hsl(${Math.random() * 360}, 70%, 90%)`,
    };
    
    setContainers([...containers, newContainer]);
  };
  
  // Remove a container
  const removeContainer = (containerId) => {
    // Only allow removing if there are more than 1 containers
    if (containers.length <= 1) {
      setError('Cannot remove the last container');
      return;
    }
    
    // Remove the container
    setContainers(containers.filter(cont => cont.id !== containerId));
    
    // Move any symbols in this container to no container
    setPlacedSymbols(
      placedSymbols.map((sym) => 
        sym.containerId === containerId 
          ? { ...sym, containerId: null } 
          : sym
      )
    );
  };
  
  // Remove a symbol from the canvas
  const removeSymbol = (instanceId) => {
    setPlacedSymbols(placedSymbols.filter(sym => sym.instanceId !== instanceId));
  };
  
  // Get filtered symbols for the current category
  const getFilteredSymbols = () => {
    if (activeCategory === 'math') {
      return mathSymbols;
    } else if (activeCategory === 'conversions') {
      return conversionFactors;
    } else {
      return unitSymbols.filter(sym => sym.category === activeCategory);
    }
  };
  
  // Render symbols toolbar
  const renderSymbolsToolbar = () => {
    return (
      <div className="mb-4">
        <div className="flex mb-2 space-x-2">
          <button
            className={`px-3 py-1 ${activeCategory === 'math' ? 'text-gray-800' : 'text-gray-400'} text-lg appearance-none font-bold bg-white border rounded hover:bg-blue-50`}
            onClick={() => setActiveCategory('math')}
          >
            Math
          </button>
          <button
            className={`px-3 py-1 ${activeCategory === 'length' ? 'text-gray-800' : 'text-gray-400'} text-lg appearance-none font-bold bg-white border rounded hover:bg-blue-50`}
            onClick={() => setActiveCategory('length')}
          >
            Length
          </button>
          <button
            className={`px-3 py-1 ${activeCategory === 'mass' ? 'text-gray-800' : 'text-gray-400'} text-lg appearance-none font-bold bg-white border rounded hover:bg-blue-50`}
            onClick={() => setActiveCategory('mass')}
          >
            Weight
          </button>
          <button
            className={`px-3 py-1 ${activeCategory === 'volume' ? 'text-gray-800' : 'text-gray-400'} text-lg appearance-none font-bold bg-white border rounded hover:bg-blue-50`}
            onClick={() => setActiveCategory('volume')}
          >
            Volume
          </button>
          <button
            className={`px-3 py-1 ${activeCategory === 'temperature' ? 'text-gray-800' : 'text-gray-400'} text-lg appearance-none font-bold bg-white border rounded hover:bg-blue-50`}
            onClick={() => setActiveCategory('temperature')}
          >
            Temp
          </button>
          <button
            className={`px-3 py-1 ${activeCategory === 'time' ? 'text-gray-800' : 'text-gray-400'} text-lg appearance-none font-bold bg-white border rounded hover:bg-blue-50`}
            onClick={() => setActiveCategory('time')}
          >
            Time
          </button>
          <button
            className={`px-3 py-1 ${activeCategory === 'conversions' ? 'text-gray-800' : 'text-gray-400'} text-lg appearance-none font-bold bg-white border rounded hover:bg-blue-50`}
            onClick={() => setActiveCategory('conversions')}
          >
            Conversions
          </button>
          <button
            className={`px-3 py-1 ${activeCategory === 'equations' ? 'text-gray-800' : 'text-gray-400'} text-lg appearance-none font-bold bg-white border rounded hover:bg-blue-50`}
            onClick={() => setActiveCategory('equations')}
          >
            Equations
          </button>
        </div>
        <div className="flex flex-wrap gap-2 p-4 border rounded bg-gray-50">
          {activeCategory === 'equations' ? (
            commonEquations.map((equation) => (
              <button
                key={equation.id}
                className="px-4 py-2 text-sm text-gray-700 appearance-none bg-white border rounded hover:bg-blue-50 flex items-center justify-center"
                onClick={() => handleEquationClick(equation)}
              >
                {equation.name}
              </button>
            ))
          ) : (
            getFilteredSymbols().map((symbol) => (
              <button
                key={symbol.id}
                className="min-w-10 h-10 px-2 flex items-center justify-center text-lg text-gray-700 appearance-none font-bold bg-white border rounded hover:bg-blue-50"
                onClick={() => handleSymbolDrop(symbol)}
              >
                {symbol.text}
              </button>
            ))
          )}
        </div>
      </div>
    );
  };
  
  // Render containers
  const renderContainers = () => {
    return containers.map((container) => (
      <Group
        key={container.id}
        x={container.x}
        y={container.y}
        draggable
        onDragMove={(e) => handleContainerDragMove(e, container.id)}
        onClick={() => setSelectedContainer(container.id === selectedContainer ? null : container.id)}
      >
        <Rect
          width={container.width}
          height={container.height}
          fill={container.color}
          stroke={selectedContainer === container.id ? "#3498db" : "#95a5a6"}
          strokeWidth={2}
          cornerRadius={5}
        />
        
        {/* Container label */}
        <Text
          text={`Expression ${containers.findIndex(c => c.id === container.id) + 1}`}
          fontSize={12}
          fontFamily="Arial"
          fill="#7f8c8d"
          x={5}
          y={5}
        />

        {/* Clear button */}
        <Group x={container.width - 70} y={5}>
          <Rect
            width={15}
            height={15}
            fill="#FFA726"
            cornerRadius={2}
            onClick={(e) => {
              e.cancelBubble = true;
              clearContainer(container.id);
            }}
            onTouchStart={(e) => {
              e.evt.preventDefault();
              e.cancelBubble = true;
              clearContainer(container.id);
            }}
          />
          <Text
            text="🗑️"
            fontSize={10}
            fontFamily="Arial"
            fill="white"
            width={15}
            height={15}
            align="center"
            verticalAlign="middle"
            onClick={(e) => {
              e.cancelBubble = true;
              clearContainer(container.id);
            }}
            onTouchStart={(e) => {
              e.evt.preventDefault();
              e.cancelBubble = true;
              clearContainer(container.id);
            }}
          />
        </Group>
        
        {/* Remove button */}
        <Group x={container.width - 45} y={5}>
          <Rect
            width={15}
            height={15}
            fill="red"
            cornerRadius={2}
            onClick={(e) => {
              e.cancelBubble = true;
              removeContainer(container.id);
            }}
            onTouchStart={(e) => {
              e.evt.preventDefault();
              e.cancelBubble = true;
              removeContainer(container.id);
            }}
          />
          <Text
            text="×"
            fontSize={12}
            fontFamily="Arial"
            fill="white"
            width={15}
            height={15}
            align="center"
            verticalAlign="middle"
            onClick={(e) => {
              e.cancelBubble = true;
              removeContainer(container.id);
            }}
            onTouchStart={(e) => {
              e.evt.preventDefault();
              e.cancelBubble = true;
              removeContainer(container.id);
            }}
          />
        </Group>

        {/* Graph button */}
        <Group x={container.width - 20} y={5}>
          <Rect
            width={15}
            height={15}
            fill="#4CAF50"
            cornerRadius={2}
            onClick={(e) => {
              e.cancelBubble = true;
              setGraphContainer(container.id);
            }}
            onTouchStart={(e) => {
              e.evt.preventDefault();
              e.cancelBubble = true;
              setGraphContainer(container.id);
            }}
          />
          <Text
            text="📈"
            fontSize={10}
            fontFamily="Arial"
            fill="white"
            width={15}
            height={15}
            align="center"
            verticalAlign="middle"
            onClick={(e) => {
              e.cancelBubble = true;
              setGraphContainer(container.id);
            }}
            onTouchStart={(e) => {
              e.evt.preventDefault();
              e.cancelBubble = true;
              setGraphContainer(container.id);
            }}
          />
        </Group>
      </Group>
    ));
  };
  
  // Render placed symbols on canvas
  const renderPlacedSymbols = () => {
    return placedSymbols.map((symbol) => (
      <Group
        key={symbol.instanceId}
        x={symbol.x}
        y={symbol.y}
        draggable
        onDragMove={(e) => handleSymbolDragMove(e, symbol.instanceId)}
        onDragEnd={(e) => handleSymbolDragEnd(e, symbol.instanceId)}
      >
        {/* Background rect */}
        <Rect
          width={symbol.text.length > 2 ? 50 : 40}
          height={40}
          offsetX={symbol.text.length > 2 ? 25 : 20}
          offsetY={20}
          fill="white"
          stroke={symbol.type === 'unit' ? "#e67e22" : "#3498db"}
          strokeWidth={1}
          cornerRadius={5}
        />
        
        {/* Symbol text */}
        <Text
          text={symbol.text}
          fontSize={symbol.text.length > 2 ? 14 : (symbol.text.length > 1 ? 16 : 24)}
          fontFamily="Arial"
          fill="black"
          width={symbol.text.length > 2 ? 50 : 40}
          height={40}
          align="center"
          verticalAlign="middle"
          offsetX={symbol.text.length > 2 ? 25 : 20}
          offsetY={20}
        />
        
        {/* Remove button */}
        <Group x={15} y={-25}>
          <Rect
            width={15}
            height={15}
            fill="red"
            cornerRadius={2}
            onClick={(e) => {
              e.cancelBubble = true;
              removeSymbol(symbol.instanceId);
            }}
            onTouchStart={(e) => {
              e.evt.preventDefault();
              e.cancelBubble = true;
              removeSymbol(symbol.instanceId);
            }}
          />
          <Text
            text="×"
            fontSize={12}
            fontFamily="Arial"
            fill="white"
            width={15}
            height={15}
            align="center"
            verticalAlign="middle"
            onClick={(e) => {
              e.cancelBubble = true;
              removeSymbol(symbol.instanceId);
            }}
            onTouchStart={(e) => {
              e.evt.preventDefault();
              e.cancelBubble = true;
              removeSymbol(symbol.instanceId);
            }}
          />
        </Group>
      </Group>
    ));
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h2 className="text-2xl text-gray-900 font-bold mb-4">Interactive Math & Unit Conversion Solver</h2>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          Click on symbols to add them to the canvas. Drag symbols into containers to organize your expressions.
          Switch between categories using the tabs above the symbols.
        </p>
        {renderSymbolsToolbar()}
      </div>
      
      <div className="mb-4 flex space-x-4">
      <button 
          className="px-4 py-2 text-lg text-gray-700 appearance-none font-bold bg-white border rounded hover:bg-blue-50"
          onClick={inferEquation.bind(this, containers, placedSymbols, unitSymbols, setEquation, setResult, setError)}
          style={{WebkitAppearance: 'none'}}
        >
          Solve Equation
        </button>
        
        <button 
          className="px-4 py-2 text-lg text-gray-700 appearance-none font-bold bg-white border rounded hover:bg-blue-50"
          onClick={createContainer}
          style={{WebkitAppearance: 'none'}}
        >
          Add Container
        </button>
      </div>
      
      {equation && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-gray-900 rounded">
          <p className="font-medium">Inferred Equation: {equation}</p>
          {result && <p className="mt-2">Result: {result}</p>}
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}
      
      <div className="border rounded overflow-hidden bg-gray-50" style={{ height: "500px" }}>
        <Stage width={window.innerWidth * 0.8} height={500} ref={stageRef}>
          <Layer ref={layerRef}>
            {renderContainers()}
            {renderPlacedSymbols()}
          </Layer>
        </Stage>
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <h3 className="font-bold mb-1">Instructions:</h3>
        <ol className="list-decimal ml-5 space-y-1">
          <li>Switch between math and unit categories using the tabs above</li>
          <li>Click symbols to add them to the canvas</li>
          <li>Drag symbols into the colored containers</li>
          <li>Symbols are read from left to right within each container</li>
          <li>The container with an equals sign (=) will be used as the main equation</li>
          <li>For unit conversions, add a number, then a unit, equals sign, and another unit</li>
          <li>Click "Solve Equation" to evaluate the expression or perform the conversion</li>
        </ol>
        <p className="mt-2">
          <strong>Example unit conversion:</strong> Place "5", "km", "=", "mi" in order within a container.
        </p>
        <p>
          <strong>Example equation:</strong> Place "x", "+", "5", "=", "10" in order within a container.
        </p>
      </div>

      {graphContainer && (
        <GraphModal
          expression={getContainerExpression(graphContainer)}
          onClose={() => setGraphContainer(null)}
        />
      )}
    </div>
  );
};

export default MathSolver;