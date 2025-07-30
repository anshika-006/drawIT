import React, { useState, useEffect, useRef } from 'react';
import { Check, X } from 'lucide-react';

interface TextEditorProps {
  position: { x: number; y: number };
  initialText: string;
  onSubmit: (text: string) => void;
  onCancel: () => void;
  isDarkMode: boolean;
}

export const TextEditor: React.FC<TextEditorProps> = ({
  position,
  initialText,
  onSubmit,
  onCancel,
  isDarkMode
}) => {
  const [text, setText] = useState(initialText);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit(text);
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  const handleSubmit = () => {
    onSubmit(text);
  };

  return (
    <div
      className="absolute z-50"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -50%)'
      }}
    >
      <div className={`${
        isDarkMode ? 'bg-slate-800 border-slate-600' : 'bg-white border-gray-300'
      } border rounded-lg shadow-lg p-3 min-w-48`}>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your text..."
          className={`w-full min-h-16 p-2 border rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            isDarkMode 
              ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
          }`}
          rows={3}
        />
        
        <div className="flex justify-end space-x-2 mt-2">
          <button
            onClick={onCancel}
            className={`p-1.5 rounded transition-colors ${
              isDarkMode
                ? 'hover:bg-slate-700 text-slate-300'
                : 'hover:bg-gray-100 text-gray-600'
            }`}
            title="Cancel (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
          <button
            onClick={handleSubmit}
            className="p-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            title="Add Text (Enter)"
          >
            <Check className="w-4 h-4" />
          </button>
        </div>
        
        <div className={`text-xs mt-2 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
          Press Enter to add • Shift+Enter for new line • Esc to cancel
        </div>
      </div>
    </div>
  );
};