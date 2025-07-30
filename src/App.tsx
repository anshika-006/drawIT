import React, { useState } from 'react';
import { Canvas } from './components/Canvas';
import { Toolbar } from './components/Toolbar';
import { Sidebar } from './components/Sidebar';
import { ThemeProvider } from './contexts/ThemeContext';
import { DrawingProvider } from './contexts/DrawingContext';

function App() {
  return (
    <ThemeProvider>
      <DrawingProvider>
        <div className="h-screen flex flex-col overflow-hidden">
          <Toolbar />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar />
            <Canvas />
          </div>
        </div>
      </DrawingProvider>
    </ThemeProvider>
  );
}

export default App;