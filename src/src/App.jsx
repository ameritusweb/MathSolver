import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import MathSolver from './components/MathSolver';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <MathSolver />
    </div>
  );
}

export default App
