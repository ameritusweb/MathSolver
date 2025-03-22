import * as math from 'mathjs';
 
 // Build the equation from the placed symbols and their containers
const inferEquation = (containers, placedSymbols, setEquation, setResult, setError) => {
    try {
      // Group symbols by container
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
      
      // Build expressions for each container
      const containerExpressions = {};
      const containerUnits = {};
      
      Object.keys(symbolsByContainer).forEach(containerId => {
        const symbols = symbolsByContainer[containerId];
        
        if (symbols.length === 0) {
          return;
        }
        
        // Simple left-to-right parsing to create expression
        let expression = '';
        let units = [];
        let currentNumber = '';
        
        symbols.forEach((sym, index) => {
          // Handle units specially
          if (sym.type === 'unit') {
            units.push({
              unit: sym.text,
              category: sym.category,
              conversionBase: sym.conversionBase,
              offset: sym.offset || 0,
              position: expression.length
            });
            expression += sym.text;
          }
          // Handle special cases
          else if (sym.type === 'operator') {
            if (sym.text === '×') {
              expression += '*';
            } else if (sym.text === '÷') {
              expression += '/';
            } else {
              expression += sym.text;
            }
            currentNumber = '';
          } else if (sym.type === 'function') {
            if (sym.text === '√') {
              // Special case for square root
              expression += 'sqrt';
            } else {
              expression += sym.text;
            }
            currentNumber = '';
          } else if (sym.type === 'number' || sym.type === 'variable') {
            if (sym.type === 'number') {
              currentNumber += sym.text;
            }
            expression += sym.text;
          } else {
            expression += sym.text;
            currentNumber = '';
          }
          
          // Add spacing for readability
          if (index < symbols.length - 1) {
            expression += ' ';
          }
        });
        
        containerExpressions[containerId] = expression.trim();
        containerUnits[containerId] = units;
      });
      
      // Find container with equals sign to be the main equation
      let mainEquation = '';
      let mainContainerId = '';
      for (const containerId in containerExpressions) {
        const expr = containerExpressions[containerId];
        if (expr.includes('=')) {
          mainEquation = expr;
          mainContainerId = containerId;
          break;
        }
      }
      
      if (!mainEquation) {
        setError('No equation found. Add an equals sign (=) to a container.');
        setEquation('');
        setResult(null);
        return;
      }
      
      // Process the equation to make it solvable
      // Replace function followed by parentheses
      let processedEquation = mainEquation.replace(/(\w+)\s+\(/g, '$1(');
      
      // Check for unit conversion
      const unitsInEquation = containerUnits[mainContainerId];
      
      if (unitsInEquation && unitsInEquation.length >= 2) {
        // Check if we have units of the same category for conversion
        const categories = unitsInEquation.map(u => u.category);
        const uniqueCategories = [...new Set(categories)];
        
        if (uniqueCategories.length === 1 && uniqueCategories[0] !== undefined) {
          // This is a unit conversion equation
          try {
            const [leftSide, rightSide] = processedEquation.split('=').map(side => side.trim());
            
            // Extract numbers and units
            const extractNumberAndUnit = (side) => {
              // Simple extraction - find numbers and units
              const numberMatch = side.match(/[\d.]+/);
              const unitMatch = side.match(/[a-zA-Z°]+/);
              
              if (numberMatch && unitMatch) {
                return { 
                  number: parseFloat(numberMatch[0]),
                  unit: unitMatch[0]
                };
              }
              return null;
            };
            
            const leftPart = extractNumberAndUnit(leftSide);
            const rightPart = extractNumberAndUnit(rightSide);
            
            if (leftPart && rightPart) {
              // Find the units from our unit symbols
              const leftUnitInfo = unitSymbols.find(u => u.text === leftPart.unit);
              const rightUnitInfo = unitSymbols.find(u => u.text === rightPart.unit);
              
              if (leftUnitInfo && rightUnitInfo && leftUnitInfo.category === rightUnitInfo.category) {
                let result;
                
                // Handle temperature specially
                if (leftUnitInfo.category === 'temperature') {
                  // Convert left to base (Celsius), then to target
                  const leftInCelsius = (leftPart.number + leftUnitInfo.offset) * leftUnitInfo.conversionBase;
                  const rightValue = (leftInCelsius / rightUnitInfo.conversionBase) - rightUnitInfo.offset;
                  result = rightValue.toFixed(4);
                } else {
                  // General conversion for other units
                  // Convert to base unit first, then to target unit
                  const valueInBaseUnit = leftPart.number * leftUnitInfo.conversionBase;
                  const convertedValue = valueInBaseUnit / rightUnitInfo.conversionBase;
                  result = convertedValue.toFixed(4);
                }
                
                setEquation(processedEquation);
                setResult(`${leftPart.number} ${leftPart.unit} = ${result} ${rightPart.unit}`);
                setError('');
                return;
              }
            }
          } catch (convErr) {
            console.error('Conversion error:', convErr);
            setError(`Error in unit conversion: ${convErr.message}`);
            return;
          }
        }
      }
      
      // Try to solve it as a regular equation
      try {
        setEquation(processedEquation);
        
        // Split on equals sign
        const sides = processedEquation.split('=').map(side => side.trim());
        
        // Handle case where right side is empty (e.g. "7 + 9 =")
        if (sides.length === 2 && sides[1] === "") {
          try {
            // Just evaluate the left side expression
            const value = math.evaluate(sides[0]);
            setResult(`${value}`);
            setError('');
            return;
          } catch (calcErr) {
            console.error('Calculation error:', calcErr);
            setError(`Error calculating result: ${calcErr.message}`);
            return;
          }
        }
        
        if (sides.length !== 2) {
          throw new Error('Invalid equation format');
        }
        
        const [leftSide, rightSide] = sides;
        const exprToSolve = `${leftSide} - (${rightSide})`;
        
        // Check if this is solvable
        if (exprToSolve.includes('x') && !exprToSolve.includes('y')) {
          // Try to solve for x numerically
          const compiled = math.parse(exprToSolve).compile();
          
          // Try to find where the expression equals zero
          let solution = null;
          for (let x = -100; x <= 100; x += 0.01) {
            const value = compiled.evaluate({ x });
            if (Math.abs(value) < 0.001) {
              solution = x;
              break;
            }
          }
          
          if (solution !== null) {
            setResult(`x = ${parseFloat(solution.toFixed(4))}`);
          } else {
            setResult('No solution found in range [-100, 100]');
          }
        } else if (!exprToSolve.includes('x') && !exprToSolve.includes('y')) {
          // If expression has no variables, just evaluate it
          const value = math.evaluate(exprToSolve);
          setResult(Math.abs(value) < 0.001 ? 'Equation is valid' : 'Equation is invalid');
        } else {
          setResult('Cannot solve equations with multiple variables');
        }
        
        setError('');
      } catch (evalErr) {
        console.error('Evaluation error:', evalErr);
        setError(`Error evaluating equation: ${evalErr.message}`);
        setResult(null);
      }
    } catch (err) {
      console.error('Inference error:', err);
      setError(`Error inferring equation: ${err.message}`);
      setEquation('');
      setResult(null);
    }
  };


  export default inferEquation;