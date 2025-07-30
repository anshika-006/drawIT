import React from 'react';
import { Palette, Sliders, PaintBucket } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useDrawing } from '../contexts/DrawingContext';

const colors = [
  '#000000', '#ef4444', '#f97316', '#eab308', '#22c55e', 
  '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280'
];

const strokeWidths = [1, 2, 4, 8, 16];

export const Sidebar: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { 
    currentColor, 
    setCurrentColor, 
    currentFillColor, 
    setCurrentFillColor, 
    isFilled, 
    setIsFilled, 
    currentStrokeWidth, 
    setCurrentStrokeWidth, 
    currentTool,
    selectedElement,
    elements,
    updateElement
  } = useDrawing();

  const selectedElementData = selectedElement ? elements.find(el => el.id === selectedElement) : null;
  return (
    <div className={`w-64 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border-r transition-colors duration-300`}>
      <div className="p-4 space-y-6">
        {/* Color Picker */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <Palette className={`w-4 h-4 ${isDarkMode ? 'text-white' : 'text-gray-700'}`} />
            <h3 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Stroke Color
            </h3>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => setCurrentColor(color)}
                className={`w-8 h-8 rounded-lg border-2 transition-all ${
                  currentColor === color 
                    ? 'border-blue-500 scale-110' 
                    : isDarkMode 
                    ? 'border-slate-600' 
                    : 'border-gray-300'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Fill Color */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <PaintBucket className={`w-4 h-4 ${isDarkMode ? 'text-white' : 'text-gray-700'}`} />
            <h3 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Fill
            </h3>
          </div>
          
          {/* Fill Toggle */}
          <div className="mb-3">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFilled}
                onChange={(e) => setIsFilled(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                Fill shapes
              </span>
            </label>
          </div>

          {/* Fill Color Picker */}
          {isFilled && (
            <div className="grid grid-cols-5 gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setCurrentFillColor(color)}
                  className={`w-8 h-8 rounded-lg border-2 transition-all ${
                    currentFillColor === color 
                      ? 'border-blue-500 scale-110' 
                      : isDarkMode 
                      ? 'border-slate-600' 
                      : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          )}
        </div>
        {/* Stroke Width */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <Sliders className={`w-4 h-4 ${isDarkMode ? 'text-white' : 'text-gray-700'}`} />
            <h3 className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Stroke Width
            </h3>
          </div>
          <div className="space-y-2">
            {strokeWidths.map((width) => (
              <button
                key={width}
                onClick={() => setCurrentStrokeWidth(width)}
                className={`w-full p-2 rounded-lg transition-colors flex items-center justify-center ${
                  currentStrokeWidth === width
                    ? isDarkMode
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-100 text-blue-600'
                    : isDarkMode
                    ? 'hover:bg-slate-700 text-white'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <div 
                  className="bg-current rounded-full"
                  style={{ width: `${width * 2}px`, height: `${width * 2}px` }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Image Tools */}
        {selectedElementData?.type === 'image' && (
          <div>
            <h3 className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Image Tools
            </h3>
            <div className="space-y-2">
              <button className={`w-full p-2 rounded-lg transition-colors text-left ${
                isDarkMode
                  ? 'hover:bg-slate-700 text-white'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}>
                Crop
              </button>
              <button className={`w-full p-2 rounded-lg transition-colors text-left ${
                isDarkMode
                  ? 'hover:bg-slate-700 text-white'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}>
                Resize
              </button>
              <button className={`w-full p-2 rounded-lg transition-colors text-left ${
                isDarkMode
                  ? 'hover:bg-slate-700 text-white'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}>
                Rotate
              </button>
              <button 
                onClick={() => {
                  if (selectedElementData) {
                    const newWidth = selectedElementData.width! * 0.8;
                    const newHeight = selectedElementData.height! * 0.8;
                    updateElement(selectedElementData.id, { width: newWidth, height: newHeight });
                  }
                }}
                className={`w-full p-2 rounded-lg transition-colors text-left ${
                  isDarkMode
                    ? 'hover:bg-slate-700 text-white'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                Make Smaller
              </button>
              <button 
                onClick={() => {
                  if (selectedElementData) {
                    const newWidth = selectedElementData.width! * 1.2;
                    const newHeight = selectedElementData.height! * 1.2;
                    updateElement(selectedElementData.id, { width: newWidth, height: newHeight });
                  }
                }}
                className={`w-full p-2 rounded-lg transition-colors text-left ${
                  isDarkMode
                    ? 'hover:bg-slate-700 text-white'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                Make Larger
              </button>
            </div>
          </div>
        )}
      </div>
        {/* Text Tools */}
        {selectedElementData?.type === 'text' && (
          <div>
            <h3 className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Text Tools
            </h3>
            <div className="space-y-3">
              <div>
                <label className={`text-xs ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                  Font Size
                </label>
                <select
                  value={selectedElementData.fontSize || 16}
                  onChange={(e) => updateElement(selectedElementData.id, { fontSize: parseInt(e.target.value) })}
                  className={`w-full mt-1 p-2 rounded border ${
                    isDarkMode
                      ? 'bg-slate-700 border-slate-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value={12}>12px</option>
                  <option value={14}>14px</option>
                  <option value={16}>16px</option>
                  <option value={18}>18px</option>
                  <option value={20}>20px</option>
                  <option value={24}>24px</option>
                  <option value={32}>32px</option>
                  <option value={48}>48px</option>
                </select>
              </div>
              
              <div>
                <label className={`text-xs ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                  Font Family
                </label>
                <select
                  value={selectedElementData.fontFamily || 'Arial'}
                  onChange={(e) => updateElement(selectedElementData.id, { fontFamily: e.target.value })}
                  className={`w-full mt-1 p-2 rounded border ${
                    isDarkMode
                      ? 'bg-slate-700 border-slate-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="Arial">Arial</option>
                  <option value="Helvetica">Helvetica</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Verdana">Verdana</option>
                  <option value="Courier New">Courier New</option>
                  <option value="Comic Sans MS">Comic Sans MS</option>
                </select>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};