import * as math from 'mathjs';

// Helper function to detect percentage expressions like "5 % of 20 ="
const detectPercentageExpression = (symbols) => {
  if (symbols.length < 4) return false;
  
  // Look for pattern: number, %, "of", number, optional "="
  const percentIndex = symbols.findIndex(sym => sym.text === '%');
  if (percentIndex <= 0 || percentIndex >= symbols.length - 2) return false;
  
  const beforePercent = symbols[percentIndex - 1];
  const afterPercent = symbols[percentIndex + 1];
  const afterOf = symbols[percentIndex + 2];
  
  return beforePercent.type === 'number' && 
         afterPercent.text === 'of' && 
         afterOf.type === 'number';
};

// Helper function to handle percentage expressions and return a formatted equation
const handlePercentageExpression = (symbols) => {
  try {
    // Look for the pattern: number, %, "of", number, optional "="
    const percentIndex = symbols.findIndex(sym => sym.text === '%');
    
    if (percentIndex > 0 && percentIndex < symbols.length - 2) {
      const percentValue = symbols[percentIndex - 1].text;
      const ofIndex = symbols.findIndex(sym => sym.text === 'of');
      
      if (ofIndex > percentIndex && ofIndex < symbols.length - 1) {
        const value = symbols[ofIndex + 1].text;
        
        // Create a percentage calculation equation
        const calculation = `(${percentValue} / 100) * ${value}`;
        
        // If there's an equals sign, add it to the equation
        const equalsIndex = symbols.findIndex(sym => sym.text === '=');
        if (equalsIndex !== -1) {
          return `${calculation} =`;
        }
        
        return calculation;
      }
    }
    
    return '';
  } catch (err) {
    console.error('Error in percentage expression handling:', err);
    return '';
  }
};

const inferEquation = (containers, placedSymbols, unitSymbols, setEquation, setResult, setError) => {
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
        
        // Check if this container has a percentage calculation pattern
        const isPercentageExpression = detectPercentageExpression(symbols);
        
        // If it's a percentage calculation, handle it specially
        if (isPercentageExpression) {
          const percentageEquation = handlePercentageExpression(symbols);
          expression = percentageEquation;
        } else {
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
            else if (sym.type === 'constant') {
              if (currentNumber) {
                expression += currentNumber;
                currentNumber = '';
              }
              
              if (sym.text === 'π') {
                expression += 'pi';
              } else {
                expression += sym.text;
              }
            }
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
        }
      });

      // If no equations found, show error
      if (equations.length === 0) {
        setError('No equation found. Add an equals sign (=) to a container.');
        setEquation('');
        setResult(null);
        return;
      }

      console.log('Found equations:', equations);
      console.log('Found variables:', Array.from(variables));

      // Handle system of equations
      if (equations.length > 1 && variables.size > 0) {
        setEquation(equations.join(' and '));
        
        try {
          const scope = {};
          
          // First pass: find direct assignments (e.g., x = 9)
          equations.forEach(eq => {
            console.log('\nProcessing equation for direct assignment:', eq);
            const [left, right] = eq.split('=').map(side => side.trim());
            console.log('Left:', left, 'Right:', right);
            
            if (/^\d+$/.test(right)) {
              scope[left.trim()] = parseFloat(right);
              console.log('Found direct assignment:', left.trim(), '=', parseFloat(right));
            }
            if (/^\d+$/.test(left)) {
              scope[right.trim()] = parseFloat(left);
              console.log('Found direct assignment:', right.trim(), '=', parseFloat(left));
            }
          });

          console.log('\nAfter first pass, known values:', scope);

          // Second pass: substitute and solve
          equations.forEach(eq => {
            console.log('\nProcessing equation:', eq);
            const [left, right] = eq.split('=').map(side => side.trim());
            
            // Skip equations that are just assignments we already handled
            if ((/^[a-zA-Z]$/.test(left) && /^\d+$/.test(right)) || 
                (/^[a-zA-Z]$/.test(right) && /^\d+$/.test(left))) {
              console.log('Skipping already handled assignment');
              return;
            }

            // Replace all known variables with their values
            let newLeft = left;
            let newRight = right;
            Object.entries(scope).forEach(([variable, value]) => {
              const regex = new RegExp(variable + '(?![a-zA-Z])', 'g');
              newLeft = newLeft.replace(regex, value.toString());
              newRight = newRight.replace(regex, value.toString());
            });
            console.log('After substitution:', newLeft, '=', newRight);

            // Split into parts by + and -
            const leftParts = newLeft.split(/([+\-])/);
            const rightParts = newRight.split(/([+\-])/);
            console.log('Parts:', { leftParts, rightParts });

            // Find variable term and sum constants
            let variableTerm = null;
            let constantTerms = 0;

            // Process left side
            for (let i = 0; i < leftParts.length; i++) {
              const part = leftParts[i].trim();
              if (!part || part === '+' || part === '-') continue;
              console.log('Processing left part:', part);
              
              if (part.match(/[a-zA-Z]/)) {
                variableTerm = { side: 'left', term: part };
                console.log('Found variable on left:', part);
              } else if (!isNaN(part)) {
                const value = parseInt(part);
                const isNegative = i > 0 && leftParts[i-1] === '-';
                constantTerms += isNegative ? -value : value;
                console.log('Added constant from left:', isNegative ? -value : value);
              }
            }

            // Process right side
            for (let i = 0; i < rightParts.length; i++) {
              const part = rightParts[i].trim();
              if (!part || part === '+' || part === '-') continue;
              console.log('Processing right part:', part);
              
              if (part.match(/[a-zA-Z]/)) {
                variableTerm = { side: 'right', term: part };
                console.log('Found variable on right:', part);
              } else if (!isNaN(part)) {
                const value = parseInt(part);
                const isNegative = i > 0 && rightParts[i-1] === '-';
                constantTerms -= isNegative ? -value : value;
                console.log('Subtracted constant from right:', isNegative ? -value : value);
              }
            }

            console.log('Analysis:', { variableTerm, constantTerms });

            // Solve for variable if found
            if (variableTerm) {
              const variable = variableTerm.term.match(/[a-zA-Z]+/)[0];
              const value = variableTerm.side === 'left' ? -constantTerms : constantTerms;
              scope[variable] = value;
              console.log('Solved:', variable, '=', value);
            }
          });

          console.log('\nFinal scope:', scope);

          // Format results
          const results = Array.from(variables).sort().map(variable => {
            if (scope[variable] !== undefined) {
              return `${variable} = ${scope[variable]}`;
            }
            return `${variable} = unknown`;
          });
          
          setResult(results.join(', '));
          setError('');
          return;
        } catch (err) {
          console.error('Error solving system:', err);
          setError('Error solving system of equations: ' + err.message);
          return;
        }
      }

      // If not a system or system solving failed, proceed with original logic
      let mainEquation = equations[0];
      let mainContainerId = Object.keys(containerExpressions).find(id => 
        containerExpressions[id] === mainEquation
      );
      
      // Process the equation to make it solvable
      let processedEquation = mainEquation.replace(/(\w+)\s+\(/g, '$1(');
      processedEquation = processedEquation.replace(/(\d)\s+(\d)/g, '$1$2');
      processedEquation = processedEquation.replace(/(\d)\s+\.\s+(\d)/g, '$1.$2');

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
            
        // When only a unit symbol is on the right side (like "5 yd = ft")
        if (leftPart && rightSide.match(/^[a-zA-Z°]+$/)) {
          const rightUnit = rightSide.trim();
          
          // Find unit information from unitSymbols array
          const leftUnitInfo = unitSymbols.find(u => u.text === leftPart.unit);
          const rightUnitInfo = unitSymbols.find(u => u.text === rightUnit);
          
          if (leftUnitInfo && rightUnitInfo && leftUnitInfo.category === rightUnitInfo.category) {
            let result;
            
            // Handle temperature specially due to offsets
            if (leftUnitInfo.category === 'temperature') {
              // Convert left to base (Celsius), then to target
              const leftInCelsius = (leftPart.number + leftUnitInfo.offset) * leftUnitInfo.conversionBase;
              const rightValue = (leftInCelsius / rightUnitInfo.conversionBase) - rightUnitInfo.offset;
              result = rightValue.toFixed(4);
            } else {
              // For all other unit types, convert via base unit
              const valueInBaseUnit = leftPart.number * leftUnitInfo.conversionBase;
              const convertedValue = valueInBaseUnit / rightUnitInfo.conversionBase;
              result = convertedValue.toFixed(4);
            }
            
            // Format result with appropriate decimal places
            const formattedResult = parseFloat(result) % 1 === 0 
              ? parseInt(result).toString() 
              : parseFloat(result).toFixed(2);
            
            setEquation(processedEquation);
            setResult(`${leftPart.number} ${leftPart.unit} = ${formattedResult} ${rightUnit}`);
            setError('');
            return;
          } else {
            setError(`Cannot convert between ${leftPart.unit} and ${rightUnit} - different unit types`);
            setResult(null);
            return;
          }
        }

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
            let calcExpression = sides[0];
            calcExpression = calcExpression.replace(/([0-9.]+)\s*[a-zA-Z°]+/g, '$1');
            const value = math.evaluate(calcExpression);
            const unitMatch = sides[0].match(/ft|mi|km|m|in|yd/g);
            let resultUnit = '';
            
            if (unitMatch) {
              const units = unitMatch.reduce((acc, unit) => {
                acc[unit] = (acc[unit] || 0) + 1;
                return acc;
              }, {});
              
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
          try {
            // Evaluate the non-x part of the expression
            const rightSide = math.evaluate(exprToSolve.replace(/x/g, '0')) * -1;
            setResult(`x = ${parseFloat(rightSide.toFixed(4))}`);
          } catch (err) {
            console.error('Error solving for x:', err);
            setResult('Unable to solve equation');
          }
        } else if (!exprToSolve.includes('x') && !exprToSolve.includes('y')) {

          const [leftSide, rightSide] = sides;

          if (leftSide.includes('sqrt') || rightSide.includes('sqrt') || 
              leftSide.includes('√') || rightSide.includes('√')) {
            try {
              // Handle sqrt symbol
              const processedLeft = leftSide.replace(/√/g, 'sqrt');
              const processedRight = rightSide.replace(/√/g, 'sqrt');
              
              // Evaluate each side
              const leftValue = math.evaluate(processedLeft);
              const rightValue = math.evaluate(processedRight);
              
              setResult(`${leftValue} = ${rightValue}`);
              setError('');
              return;
            } catch (err) {
              console.error('Error evaluating sqrt expression:', err);
              setError('Error evaluating expression with square root');
              return;
            }
          }

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