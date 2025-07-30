import React, { useState } from 'react';
import { 
  MousePointer, 
  Pen, 
  Square, 
  Circle, 
  ArrowRight, 
  Type, 
  Image, 
  Eraser, 
  Sun, 
  Moon, 
  Undo, 
  Redo,
  ChevronDown,
  Triangle,
  Hexagon,
  Star,
  Diamond,
  PaintBucket
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useDrawing } from '../contexts/DrawingContext';
import type { Tool } from '../contexts/DrawingContext'

const shapes = [
  { id: 'rectangle', icon: Square, label: 'Rectangle' },
  { id: 'circle', icon: Circle, label: 'Circle' },
  { id: 'triangle', icon: Triangle, label: 'Triangle' },
  { id: 'diamond', icon: Diamond, label: 'Diamond' },
  { id: 'hexagon', icon: Hexagon, label: 'Hexagon' },
  { id: 'star', icon: Star, label: 'Star' },
];

const tools = [
  { id: 'select', icon: MousePointer, label: 'Select' },
  { id: 'pen', icon: Pen, label: 'Pen' },
  { id: 'fill', icon: PaintBucket, label: 'Fill' },
  { id: 'arrow', icon: ArrowRight, label: 'Arrow' },
  { id: 'text', icon: Type, label: 'Text' },
  { id: 'image', icon: Image, label: 'Image' },
  { id: 'eraser', icon: Eraser, label: 'Eraser' },
];

export const Toolbar: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { currentTool, setCurrentTool, undo, redo, canUndo, canRedo, uploadImage } = useDrawing();
  const [showShapes, setShowShapes] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleToolSelect = (tool: Tool) => {
    setCurrentTool(tool);
    if (shapes.some(shape => shape.id === tool)) {
      setShowShapes(false);
    }
    if (tool === 'image') {
      fileInputRef.current?.click();
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadImage(file);
      setCurrentTool('select');
    }
  };
  return (
    <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border-b transition-colors duration-300`}>
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center space-x-2">
          <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            DrawBoard
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Undo/Redo */}
          <div className="flex items-center space-x-1">
            <button
              onClick={undo}
              disabled={!canUndo}
              className={`p-2 rounded-lg transition-colors ${
                canUndo
                  ? isDarkMode
                    ? 'hover:bg-slate-700 text-white'
                    : 'hover:bg-gray-100 text-gray-700'
                  : 'opacity-50 cursor-not-allowed text-gray-400'
              }`}
            >
              <Undo className="w-5 h-5" />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className={`p-2 rounded-lg transition-colors ${
                canRedo
                  ? isDarkMode
                    ? 'hover:bg-slate-700 text-white'
                    : 'hover:bg-gray-100 text-gray-700'
                  : 'opacity-50 cursor-not-allowed text-gray-400'
              }`}
            >
              <Redo className="w-5 h-5" />
            </button>
          </div>

          {/* Tools */}
          <div className="flex items-center space-x-1">
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => handleToolSelect(tool.id as Tool)}
                className={`p-2 rounded-lg transition-colors ${
                  currentTool === tool.id
                    ? isDarkMode
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-100 text-blue-600'
                    : isDarkMode
                    ? 'hover:bg-slate-700 text-white'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
                title={tool.label}
              >
                <tool.icon className="w-5 h-5" />
              </button>
            ))}

            {/* Hidden file input for image upload */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            {/* Shapes Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowShapes(!showShapes)}
                className={`p-2 rounded-lg transition-colors flex items-center space-x-1 ${
                  shapes.some(shape => shape.id === currentTool) || showShapes
                    ? isDarkMode
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-100 text-blue-600'
                    : isDarkMode
                    ? 'hover:bg-slate-700 text-white'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <Square className="w-5 h-5" />
                <ChevronDown className="w-3 h-3" />
              </button>

              {showShapes && (
                <div className={`absolute top-full mt-1 right-0 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border rounded-lg shadow-lg z-10 min-w-48`}>
                  <div className="p-2 space-y-1">
                    {shapes.map((shape) => (
                      <button
                        key={shape.id}
                        onClick={() => handleToolSelect(shape.id as Tool)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-left ${
                          currentTool === shape.id
                            ? isDarkMode
                              ? 'bg-blue-600 text-white'
                              : 'bg-blue-100 text-blue-600'
                            : 
                          isDarkMode
                            ? 'hover:bg-slate-700 text-white'
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <shape.icon className="w-4 h-4" />
                        <span className="text-sm">{shape.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode
                ? 'hover:bg-slate-700 text-white'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};