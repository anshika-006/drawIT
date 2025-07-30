import React, { createContext, useContext, useState, useCallback } from 'react';

export type Tool = 'select' | 'pen' | 'rectangle' | 'circle' | 'triangle' | 'diamond' | 'hexagon' | 'star' | 'arrow' | 'text' | 'image' | 'eraser' | 'fill';

export interface DrawingElement {
  id: string;
  type: Tool;
  x: number;
  y: number;
  width?: number;
  height?: number;
  points?: { x: number; y: number }[];
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  imageData?: string;
  imageElement?: HTMLImageElement;
  color: string;
  strokeWidth: number;
  fillColor?: string;
  filled?: boolean;
  erased?: boolean;
}

interface DrawingContextType {
  currentTool: Tool;
  setCurrentTool: (tool: Tool) => void;
  elements: DrawingElement[];
  addElement: (element: DrawingElement) => void;
  updateElement: (id: string, updates: Partial<DrawingElement>) => void;
  deleteElement: (id: string) => void;
  selectedElement: string | null;
  setSelectedElement: (id: string | null) => void;
  currentColor: string;
  setCurrentColor: (color: string) => void;
  currentFillColor: string;
  setCurrentFillColor: (color: string) => void;
  isFilled: boolean;
  setIsFilled: (filled: boolean) => void;
  currentStrokeWidth: number;
  setCurrentStrokeWidth: (width: number) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  uploadImage: (file: File) => void;
}

const DrawingContext = createContext<DrawingContextType | undefined>(undefined);

export const useDrawing = () => {
  const context = useContext(DrawingContext);
  if (!context) {
    throw new Error('useDrawing must be used within a DrawingProvider');
  }
  return context;
};

export const DrawingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTool, setCurrentTool] = useState<Tool>('select');
  const [elements, setElements] = useState<DrawingElement[]>([]);
  const [history, setHistory] = useState<DrawingElement[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [currentColor, setCurrentColor] = useState('#000000');
  const [currentFillColor, setCurrentFillColor] = useState('#ffffff');
  const [isFilled, setIsFilled] = useState(false);
  const [currentStrokeWidth, setCurrentStrokeWidth] = useState(2);

  const addElement = useCallback((element: DrawingElement) => {
    setElements(prev => {
      const newElements = [...prev, element];
      setHistory(prevHistory => {
        const newHistory = prevHistory.slice(0, historyIndex + 1);
        newHistory.push(newElements);
        return newHistory;
      });
      setHistoryIndex(prev => prev + 1);
      return newElements;
    });
  }, [historyIndex]);

  const uploadImage = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const newElement: DrawingElement = {
          id: Date.now().toString(),
          type: 'image',
          x: 100,
          y: 100,
          width: img.width > 300 ? 300 : img.width,
          height: img.height > 300 ? 300 : img.height,
          imageData: e.target?.result as string,
          imageElement: img,
          color: currentColor,
          strokeWidth: currentStrokeWidth,
        };
        addElement(newElement);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, [addElement, currentColor, currentStrokeWidth]);
  

  const updateElement = useCallback((id: string, updates: Partial<DrawingElement>) => {
    setElements(prev => {
      const newElements = prev.map(el => el.id === id ? { ...el, ...updates } : el);
      setHistory(prevHistory => {
        const newHistory = prevHistory.slice(0, historyIndex + 1);
        newHistory.push(newElements);
        return newHistory;
      });
      setHistoryIndex(prev => prev + 1);
      return newElements;
    });
  }, [historyIndex]);

  const deleteElement = useCallback((id: string) => {
    setElements(prev => {
      const newElements = prev.filter(el => el.id !== id);
      setHistory(prevHistory => {
        const newHistory = prevHistory.slice(0, historyIndex + 1);
        newHistory.push(newElements);
        return newHistory;
      });
      setHistoryIndex(prev => prev + 1);
      return newElements;
    });
    setSelectedElement(null);
  }, [historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      setElements(history[historyIndex - 1]);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      setElements(history[historyIndex + 1]);
    }
  }, [history, historyIndex]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <DrawingContext.Provider value={{
      currentTool,
      setCurrentTool,
      elements,
      addElement,
      updateElement,
      deleteElement,
      selectedElement,
      setSelectedElement,
      currentColor,
      setCurrentColor,
      currentFillColor,
      setCurrentFillColor,
      isFilled,
      setIsFilled,
      currentStrokeWidth,
      setCurrentStrokeWidth,
      undo,
      redo,
      canUndo,
      canRedo,
      uploadImage,
    }}>
      {children}
    </DrawingContext.Provider>
  );
};