import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Text, Group, Rect, Line } from 'react-konva';
import inferEquation from '../math/inferEquation';
import GraphModal from './GraphModal';
import { MinusCircle } from 'lucide-react';

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
        { id: 'open_paren', type: 'grouping', text: '(' },
        { id: 'x', type: 'variable', text: 'x' },
        { id: 'close_paren', type: 'grouping', text: ')' }
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
    { id: 'container_1', x: 50, y: 40, width: 400, height: 160, color: '#e8f4f8', type: 'equation' },
    { id: 'container_2', x: 50, y: 220, width: 400, height: 160, color: '#f0f8e8', type: 'equation' },
  ]);
  const [isSignFlipped, setIsSignFlipped] = useState(false);
  // State for equation and result
  const [equation, setEquation] = useState('');
  const [result, setResult] = useState(null);
  const [simplifyMessage, setSimplifyMessage] = useState(''); // State for simplification messages
  // State for error messages
  const [error, setError] = useState('');
  // State for selected container (for creating new containers)
  const [selectedContainer, setSelectedContainer] = useState(null);

  const [highlightedContainer, setHighlightedContainer] = useState(null);

  const toggleHighlightedContainer = (containerId) => {
    if (highlightedContainer === containerId) { 
      setHighlightedContainer(null); // Remove highlight if already highlighted
    } else {
      setHighlightedContainer(containerId); // Highlight the selected container
    }
  }

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
    let modifiedSymbol = { ...symbol };
    if (isSignFlipped && symbol.type === 'number' && !isNaN(parseFloat(symbol.text))) {
      modifiedSymbol.text = (-parseFloat(symbol.text)).toString();
    }

    if (highlightedContainer) {
      // Find the highlighted container
      const container = containers.find(c => c.id === highlightedContainer);
      if (container) {
        // Calculate center position of the container
        const centerX = container.x + container.width / 2;
        const centerY = container.y + container.height / 2;
        
        // Create a new placed symbol at the container's center
        const newSymbol = {
          ...modifiedSymbol,
          instanceId: `${modifiedSymbol.id}_${Date.now()}`,
          x: centerX,
          y: centerY,
          containerId: container.id
        };
        
        setPlacedSymbols([...placedSymbols, newSymbol]);
        return;
      }
    }

    // Get stage center position for initial placement
    const stage = stageRef.current;
    const centerX = stage.width() / 2;
    const centerY = stage.height() / 2;
    
    // Create a new placed symbol with a unique instance ID
    const newSymbol = {
      ...modifiedSymbol,
      instanceId: `${modifiedSymbol.id}_${Date.now()}`,
      x: centerX,
      y: centerY,
      containerId: null,
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
  const createContainer = (type = 'equation') => {
    const newContainer = {
      id: `container_${Date.now()}`,
      x: 50,
      y: 350,
      width: 400,
      height: 160,
      color: type === 'eqop' ? '#FFE4E1' : `hsl(${Math.random() * 360}, 70%, 90%)`,
      type: type
    };
    
    setContainers([...containers, newContainer]);
  };

  const createEqOpContainer = () => {
    createContainer('eqop');
  };

  // Apply EqOp container operation to nearest equation container
  const applyEqOp = (eqOpContainerId) => {
    try {
      // Get the operation from the EqOp container
      const eqOpSymbols = placedSymbols
        .filter(sym => sym.containerId === eqOpContainerId)
        .sort((a, b) => a.x - b.x);

      if (eqOpSymbols.length < 2) {
        setError('EqOp container must have an operation and a number');
        return;
      }

      // Find the operator and number
      const operator = eqOpSymbols[0].text;
      const number = eqOpSymbols[1].text;

      // Find the nearest equation container
      const eqOpContainer = containers.find(c => c.id === eqOpContainerId);
      let nearestContainer = null;
      let shortestDistance = Infinity;

      containers.forEach(container => {
        if (container.type === 'equation') {
          const distance = Math.sqrt(
            Math.pow(container.x - eqOpContainer.x, 2) + 
            Math.pow(container.y - eqOpContainer.y, 2)
          );
          if (distance < shortestDistance) {
            shortestDistance = distance;
            nearestContainer = container;
          }
        }
      });

      if (!nearestContainer) {
        setError('No equation container found');
        return;
      }

      // Get the equation symbols
      const equationSymbols = placedSymbols
        .filter(sym => sym.containerId === nearestContainer.id)
        .sort((a, b) => a.x - b.x);

      // Find the equals sign position
      const equalsIndex = equationSymbols.findIndex(sym => sym.text === '=');
      if (equalsIndex === -1) {
        setError('No equals sign found in equation');
        return;
      }

      // Split into left and right sides
      const leftSide = equationSymbols.slice(0, equalsIndex);
      const rightSide = equationSymbols.slice(equalsIndex + 1);

      // Create new symbols for the operation
      const createOpSymbol = (text, type) => ({
        id: `${text}_${Date.now()}`,
        instanceId: `${text}_${Date.now()}_${Math.random()}`,
        text,
        type,
        containerId: nearestContainer.id
      });

      // Add operation symbols to both sides
      let newSymbols;
      if (operator === '+' || operator === '-') {
        newSymbols = [
          ...leftSide,
          createOpSymbol(operator, 'operator'),
          createOpSymbol(number, 'number'),
          createOpSymbol('=', 'operator'),
          ...rightSide,
          createOpSymbol(operator, 'operator'),
          createOpSymbol(number, 'number')
        ];
      } else if (operator === '×' || operator === '÷') {
        newSymbols = [
          createOpSymbol('(', 'grouping'),
          ...leftSide,
          createOpSymbol(')', 'grouping'),
          createOpSymbol(operator === '×' ? '*' : '÷', 'operator'),
          createOpSymbol(number, 'number'),
          createOpSymbol('=', 'operator'),
          createOpSymbol('(', 'grouping'),
          ...rightSide,
          createOpSymbol(')', 'grouping'),
          createOpSymbol(operator === '×' ? '*' : '÷', 'operator'),
          createOpSymbol(number, 'number')
        ];
      }

      // Position the new symbols
      const spacing = 40;
      newSymbols.forEach((sym, index) => {
        sym.x = nearestContainer.x + 50 + (index * spacing);
        sym.y = nearestContainer.y + nearestContainer.height / 2;
      });

      // Update placed symbols
      setPlacedSymbols(prevSymbols => [
        ...prevSymbols.filter(sym => sym.containerId !== nearestContainer.id),
        ...newSymbols
      ]);

    } catch (error) {
      setError('Error applying operation: ' + error.message);
    }
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

  const simplifyContainer = (containerId) => {
    try {
      // Get symbols in container
      const symbols = placedSymbols
        .filter(sym => sym.containerId === containerId)
        .sort((a, b) => a.x - b.x);
  
      // Find the first pair of symbols we can simplify
      for (let i = 0; i < symbols.length - 1; i++) {
        const current = symbols[i];
        const next = symbols[i + 1];
        const afterNext = symbols[i + 2];
        const afterAfterNext = symbols[i + 3];
  
        // First check if we're in the middle of a variable expression
        if (i > 0 && symbols[i-1].type === 'variable') {
          // Skip this position as it's part of a variable expression
          continue;
        }

        // Case 1: Variable followed by +0 or 0+
        if (current.type === 'variable' && next?.text === '+' && afterNext?.text === '0') {
          // Remove the + and 0, keep the variable
          setPlacedSymbols(prev => prev.filter(s => 
            s.instanceId !== next.instanceId && 
            s.instanceId !== afterNext.instanceId
          ));
          setSimplifyMessage(`Simplified ${current.text} + 0 to ${current.text}`);
          return;
        }

        // Case 2: Stand-alone +0 or 0+ pattern (when not following a variable)
        if ((current.text === '+' && next?.text === '0') || 
            (current.text === '0' && next?.text === '+')) {
          // Remove both tokens
          setPlacedSymbols(prev => prev.filter(s => 
            s.instanceId !== current.instanceId && 
            s.instanceId !== next.instanceId
          ));
          setSimplifyMessage(`Removed redundant "+0"`);
          return;
        }
  
        // Case 3: Cancelling multiply/divide operations (×2 ÷2 or ÷2 ×2)
        if ((next?.type === 'number' && afterNext?.type === 'operator' && afterAfterNext?.type === 'number') &&
            ((current.text === '×' && afterNext.text === '÷') || (current.text === '÷' && afterNext.text === '×')) &&
            (next.text === afterAfterNext.text)) {
          // Remove all four tokens
          setPlacedSymbols(prev => prev.filter(s => 
            s.instanceId !== current.instanceId && 
            s.instanceId !== next.instanceId &&
            s.instanceId !== afterNext.instanceId &&
            s.instanceId !== afterAfterNext.instanceId
          ));
          setSimplifyMessage(`Cancelled ${current.text}${next.text} ${afterNext.text}${afterAfterNext.text}`);
          return;
        }
  
        // Case 4: Number +/- Number with no variable before it
        if (current.type === 'number' && afterNext?.type === 'number' && 
            (next.text === '+' || next.text === '-')) {
          // Check we're not part of a variable expression
          if (i === 0 || (i > 0 && symbols[i-1].type !== 'variable' && symbols[i-1].text !== '-')) {
            const num1 = parseInt(current.text);
            const num2 = parseInt(afterNext.text);
            const result = next.text === '+' ? num1 + num2 : num1 - num2;
            
            // Create new combined symbol
            const newSymbol = {
              id: `number_${Date.now()}`,
              instanceId: `number_${Date.now()}_${Math.random()}`,
              type: 'number',
              text: result.toString(),
              x: current.x,
              y: current.y,
              containerId
            };
  
            // Update placed symbols
            setPlacedSymbols(prev => [
              ...prev.filter(s => 
                s.instanceId !== current.instanceId && 
                s.instanceId !== next.instanceId && 
                s.instanceId !== afterNext.instanceId
              ),
              newSymbol
            ]);
  
            setSimplifyMessage(`Combined ${num1} ${next.text} ${num2} = ${result}`);
            return;
          }
        }
  
        // Case 5: Same variable being added/subtracted (x - x or x + -x)
        if (current.type === 'variable' && afterNext?.type === 'variable' &&
            current.text === afterNext.text && 
            (next.text === '+' || next.text === '-')) {
          if (next.text === '-') {
            // Create new zero symbol
            const newSymbol = {
              id: `number_${Date.now()}`,
              instanceId: `number_${Date.now()}_${Math.random()}`,
              type: 'number',
              text: '0',
              x: current.x,
              y: current.y,
              containerId
            };
  
            setPlacedSymbols(prev => [
              ...prev.filter(s => 
                s.instanceId !== current.instanceId && 
                s.instanceId !== next.instanceId && 
                s.instanceId !== afterNext.instanceId
              ),
              newSymbol
            ]);
  
            setSimplifyMessage(`Cancelled ${current.text} - ${current.text} = 0`);
            return;
          }
        }
  
        // Case 6: Cancelling terms after a variable (y -2 +2 → y)
        if (current.type === 'variable' && 
            next?.text === '-' && 
            afterNext?.type === 'number' &&
            afterAfterNext?.text === '+' &&
            symbols[i + 4]?.type === 'number' &&
            afterNext.text === symbols[i + 4].text) {
          
          // Remove everything except the variable
          setPlacedSymbols(prev => prev.filter(s => 
            s.instanceId === current.instanceId ||
            (s.containerId === containerId && 
             s.x < current.x || s.x > symbols[i + 4].x)
          ));
          
          setSimplifyMessage(`Cancelled -${afterNext.text} +${symbols[i + 4].text} after ${current.text}`);
          return;
        }
      }
  
      setSimplifyMessage('No more simplifications found');
    } catch (error) {
      console.error('Simplification error:', error);
      setError('Error during simplification: ' + error.message);
    }
  };
  
  // Render symbols toolbar
  const renderSymbolsToolbar = () => {
    return (
      <div className="mb-4">
        <div className="flex mb-2 space-x-2">
        <div className="flex items-center">
            <button
              className={`px-3 py-1 ${activeCategory === 'math' ? 'text-gray-800' : 'text-gray-400'} text-lg appearance-none font-bold bg-white border rounded-l hover:bg-blue-50`}
              onClick={() => setActiveCategory('math')}
            >
              Math
            </button>
            <button
              className={`px-2 py-1 ${activeCategory === 'math' ? 'text-gray-800' : 'text-gray-400'} text-lg appearance-none font-bold bg-white border-t border-b border-r rounded-r hover:bg-blue-50 flex items-center ${isSignFlipped ? 'bg-blue-100' : ''}`}
              onClick={() => setIsSignFlipped(!isSignFlipped)}
              title={isSignFlipped ? "Signs are flipped (numbers will be negative)" : "Signs are normal (numbers will be positive)"}
            >
              <MinusCircle className="w-6 h-6" />
            </button>
          </div>
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
                {symbol.type === 'number' && isSignFlipped && !isNaN(parseFloat(symbol.text)) 
                  ? (-parseFloat(symbol.text)).toString() 
                  : symbol.text}
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
        onClick={(e) => {
          e.cancelBubble = true;
          toggleHighlightedContainer(container.id === highlightedContainer ? null : container.id);
          setSelectedContainer(container.id === selectedContainer ? null : container.id);
        }}
        onTouchStart={(e) => {
          e.evt.preventDefault();
          e.cancelBubble = true;
          toggleHighlightedContainer(container.id === highlightedContainer ? null : container.id);
          setSelectedContainer(container.id === selectedContainer ? null : container.id);
        }}
      >
        <Rect
          width={container.width}
          height={container.height}
          fill={container.color}
          stroke={highlightedContainer === container.id ? "#f1c40f" : (selectedContainer === container.id ? "#3498db" : "#95a5a6")}
          strokeWidth={highlightedContainer === container.id ? 3 : 2}
          cornerRadius={5}
        />
        
        {/* Container label */}
        <Text
          text={container.type === 'eqop' ? 'EqOp' : `Expression ${containers.findIndex(c => c.id === container.id) + 1}`}
          fontSize={12}
          fontFamily="Arial"
          fill="#7f8c8d"
          x={5}
          y={5}
        />

        {container.type !== 'eqop' && (
          <Group x={container.width - 125} y={5}>
            <Rect
              width={40}
              height={15}
              fill="#4CAF50"
              cornerRadius={2}
              onClick={(e) => {
                e.cancelBubble = true;
                simplifyContainer(container.id);
              }}
              onTouchStart={(e) => {
                e.evt.preventDefault();
                e.cancelBubble = true;
                simplifyContainer(container.id);
              }}
            />
            <Text
              text="Simplify"
              fontSize={10}
              fontFamily="Arial"
              fill="white"
              width={40}
              height={15}
              align="center"
              verticalAlign="middle"
              onClick={(e) => {
                e.cancelBubble = true;
                simplifyContainer(container.id);
              }}
              onTouchStart={(e) => {
                e.evt.preventDefault();
                e.cancelBubble = true;
                simplifyContainer(container.id);
              }}
            />
          </Group>
        )}

        {/* Apply button for EqOp containers */}
        {container.type === 'eqop' && (
          <Group x={container.width - 115} y={5}>
            <Rect
              width={40}
              height={15}
              fill="#4CAF50"
              cornerRadius={2}
              onClick={(e) => {
                e.cancelBubble = true;
                applyEqOp(container.id);
              }}
              onTouchStart={(e) => {
                e.evt.preventDefault();
                e.cancelBubble = true;
                applyEqOp(container.id);
              }}
            />
            <Text
              text="Apply"
              fontSize={10}
              fontFamily="Arial"
              fill="white"
              width={40}
              height={15}
              align="center"
              verticalAlign="middle"
              onClick={(e) => {
                e.cancelBubble = true;
                applyEqOp(container.id);
              }}
              onTouchStart={(e) => {
                e.evt.preventDefault();
                e.cancelBubble = true;
                applyEqOp(container.id);
              }}
            />
          </Group>
        )}

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
          Switch between categories using the tabs above the symbols. Use the +/- toggle next to Math to flip number signs.
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

        <button 
          className="px-4 py-2 text-lg text-gray-700 appearance-none font-bold bg-white border rounded hover:bg-blue-50"
          onClick={createEqOpContainer}
          style={{WebkitAppearance: 'none'}}
        >
          Add EqOp Container
        </button>
      </div>
      
      {equation && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-gray-900 rounded">
          <p className="font-medium">Inferred Equation: {equation}</p>
          {result && <p className="mt-2">Result: {result}</p>}
        </div>
      )}

    {simplifyMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-gray-900 rounded">
          <p className="font-medium">{simplifyMessage}</p>
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
          <li>Use EqOp containers to apply operations to both sides of an equation:</li>
          <ul className="list-disc ml-8 mt-1">
            <li>Click "Add EqOp Container" to create an operation container</li>
            <li>Add an operator (+, -, ×, ÷) followed by a number</li>
            <li>Click "Apply" to perform the operation on both sides of the nearest equation</li>
          </ul>
        </ol>
        <p className="mt-2">
          <strong>Example unit conversion:</strong> Place "5", "km", "=", "mi" in order within a container.
        </p>
        <p>
          <strong>Example equation:</strong> Place "x", "+", "5", "=", "10" in order within a container.
        </p>
        <p>
          <strong>Example EqOp:</strong> Place "+", "3" in an EqOp container and click Apply to add 3 to both sides of the nearest equation.
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