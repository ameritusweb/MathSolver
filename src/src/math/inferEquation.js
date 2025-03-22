import * as math from 'mathjs';

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
      const equations = [];
      const variables = new Set();
      
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
          // Track variables
          if (sym.type === 'variable') {
            variables.add(sym.text);
          }

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
          
          if (index < symbols.length - 1) {
            expression += ' ';
          }
        });
        
        expression = expression.trim();
        containerExpressions[containerId] = expression;
        containerUnits[containerId] = units;
        
        if (expression.includes('=')) {
          equations.push(expression);
        }
      });
      
      // If no equations found, show error
      if (equations.length === 0) {
        setError('No equation found. Add an equals sign (=) to a container.');
        setEquation('');
        setResult(null);
        return;
      }

      // First check if we have a system of equations
      // Inside your inferEquation function, replace the system solving section with this:

if (equations.length > 1 && variables.size > 0) {
  setEquation(equations.join(' and '));
  
  try {
    // Create a scope object to store variable values
    const scope = {};
    
    // First pass: find direct assignments (e.g., x = 2)
    equations.forEach(eq => {
      const [left, right] = eq.split('=').map(side => side.trim());
      // Check if right side is a number
      if (/^\d+$/.test(right)) {
        scope[left.trim()] = parseFloat(right);
      }
      // Check if left side is a number
      if (/^\d+$/.test(left)) {
        scope[right.trim()] = parseFloat(left);
      }
    });
    
    // Second pass: handle variable assignments (e.g., y = x)
    let changed = true;
    while (changed) {
      changed = false;
      equations.forEach(eq => {
        const [left, right] = eq.split('=').map(side => side.trim());
        
        // If right side is a known variable, assign its value to left side
        if (scope[right] !== undefined && scope[left] === undefined) {
          scope[left] = scope[right];
          changed = true;
        }
        // If left side is a known variable, assign its value to right side
        if (scope[left] !== undefined && scope[right] === undefined) {
          scope[right] = scope[left];
          changed = true;
        }
        
        // Try to evaluate more complex expressions
        try {
          if (scope[left] === undefined) {
            const rightValue = math.evaluate(right, scope);
            if (typeof rightValue === 'number') {
              scope[left] = rightValue;
              changed = true;
            }
          }
          if (scope[right] === undefined) {
            const leftValue = math.evaluate(left, scope);
            if (typeof leftValue === 'number') {
              scope[right] = leftValue;
              changed = true;
            }
          }
        } catch (e) {
          // Skip if we can't evaluate yet
        }
      });
    }
    
    // Format results
    const results = Array.from(variables).sort().map(variable => {
      if (scope[variable] !== undefined) {
        return `${variable} = ${scope[variable]}`;
      }
      return `${variable} = unknown`;
    });
    
    if (results.length > 0) {
      setResult(results.join(', '));
      setError('');
      return;
    }
  } catch (sysErr) {
    console.error('System solving error:', sysErr);
  }
}

      // If not a system or system solving failed, proceed with original logic
      let mainEquation = equations[0];
      let mainContainerId = Object.keys(containerExpressions).find(id => 
        containerExpressions[id] === mainEquation
      );
      
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

      try {
        setEquation(processedEquation);
        const sides = processedEquation.split('=').map(side => side.trim());
        
        // Handle case where right side is empty (e.g. "7 + 9 =")
        if (sides.length === 2 && sides[1] === "") {
          try {
            // Replace unit symbols with their values for calculation
            let calcExpression = sides[0];
            
            // Remove unit symbols for calculation while preserving numbers and operators
            calcExpression = calcExpression.replace(/([0-9.]+)\s*[a-zA-Z°]+/g, '$1');
            
            // Evaluate the expression
            const value = math.evaluate(calcExpression);
            
            // Determine the resulting unit
            const unitMatch = sides[0].match(/ft|mi|km|m|in|yd/g);
            let resultUnit = '';
            
            if (unitMatch) {
              // Simple unit cancellation - last unit wins if no cancellation
              const units = unitMatch.reduce((acc, unit) => {
                acc[unit] = (acc[unit] || 0) + 1;
                return acc;
              }, {});
              
              // Find remaining unit after cancellation
              for (const [unit, count] of Object.entries(units)) {
                if (count % 2 !== 0) {
                  resultUnit = unit;
                  break;
                }
              }
            }
            
            setResult(`${value} ${resultUnit}`);
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