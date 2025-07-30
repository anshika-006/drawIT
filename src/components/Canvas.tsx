import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useDrawing } from '../contexts/DrawingContext';
import { useTheme } from '../contexts/ThemeContext';
import { TextEditor } from './TextEditor';

// Define types for better TypeScript support
interface Point {
  x: number;
  y: number;
}

interface Element {
  id: string;
  type: 'pen' | 'rectangle' | 'circle' | 'triangle' | 'diamond' | 'hexagon' | 'star' | 'arrow' | 'image' | 'text';
  x: number;
  y: number;
  width?: number;
  height?: number;
  points?: Point[];
  color: string;
  strokeWidth: number;
  fillColor?: string;
  filled?: boolean;
  erased?: boolean;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  imageElement?: HTMLImageElement;
}

export const Canvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isDarkMode } = useTheme();
  const {
    currentTool,
    elements,
    addElement,
    currentColor,
    currentFillColor,
    isFilled,
    currentStrokeWidth,
    selectedElement,
    setSelectedElement,
    updateElement,
  } = useDrawing();

  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });
  const [isEditingText, setIsEditingText] = useState(false);
  const [textPosition, setTextPosition] = useState<Point>({ x: 0, y: 0 });
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [lastClickTime, setLastClickTime] = useState(0);

  const getCanvasCoordinates = useCallback((e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  const drawElement = useCallback(
    (ctx: CanvasRenderingContext2D, element: Element) => {
      if (element.erased) return;

      ctx.strokeStyle = element.color;
      ctx.lineWidth = element.strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (element.filled && element.fillColor) {
        ctx.fillStyle = element.fillColor;
      }

      switch (element.type) {
        case 'pen':
          if (element.points && element.points.length > 1) {
            ctx.beginPath();
            ctx.moveTo(element.points[0].x, element.points[0].y);
            for (let i = 1; i < element.points.length; i++) {
              ctx.lineTo(element.points[i].x, element.points[i].y);
            }
            ctx.stroke();
          }
          break;
        case 'rectangle':
          if (element.filled && element.fillColor) {
            ctx.fillRect(element.x, element.y, element.width || 0, element.height || 0);
          }
          ctx.strokeRect(element.x, element.y, element.width || 0, element.height || 0);
          break;
        case 'circle':
          const radius = Math.min(Math.abs(element.width || 0), Math.abs(element.height || 0)) / 2;
          ctx.beginPath();
          ctx.arc(
            element.x + (element.width || 0) / 2,
            element.y + (element.height || 0) / 2,
            radius,
            0,
            2 * Math.PI
          );
          if (element.filled && element.fillColor) {
            ctx.fill();
          }
          ctx.stroke();
          break;
        case 'triangle':
          const centerX = element.x + (element.width || 0) / 2;
          const centerY = element.y + (element.height || 0) / 2;
          const size = Math.min(Math.abs(element.width || 0), Math.abs(element.height || 0)) / 2;

          ctx.beginPath();
          ctx.moveTo(centerX, centerY - size);
          ctx.lineTo(centerX - size, centerY + size);
          ctx.lineTo(centerX + size, centerY + size);
          ctx.closePath();

          if (element.filled && element.fillColor) {
            ctx.fill();
          }
          ctx.stroke();
          break;
        case 'diamond':
          const diamondCenterX = element.x + (element.width || 0) / 2;
          const diamondCenterY = element.y + (element.height || 0) / 2;
          const diamondWidth = Math.abs(element.width || 0) / 2;
          const diamondHeight = Math.abs(element.height || 0) / 2;

          ctx.beginPath();
          ctx.moveTo(diamondCenterX, diamondCenterY - diamondHeight);
          ctx.lineTo(diamondCenterX + diamondWidth, diamondCenterY);
          ctx.lineTo(diamondCenterX, diamondCenterY + diamondHeight);
          ctx.lineTo(diamondCenterX - diamondWidth, diamondCenterY);
          ctx.closePath();

          if (element.filled && element.fillColor) {
            ctx.fill();
          }
          ctx.stroke();
          break;
        case 'hexagon':
          const hexCenterX = element.x + (element.width || 0) / 2;
          const hexCenterY = element.y + (element.height || 0) / 2;
          const hexRadius = Math.min(Math.abs(element.width || 0), Math.abs(element.height || 0)) / 2;

          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            const x = hexCenterX + hexRadius * Math.cos(angle);
            const y = hexCenterY + hexRadius * Math.sin(angle);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();

          if (element.filled && element.fillColor) {
            ctx.fill();
          }
          ctx.stroke();
          break;
        case 'star':
          const starCenterX = element.x + (element.width || 0) / 2;
          const starCenterY = element.y + (element.height || 0) / 2;
          const starRadius = Math.min(Math.abs(element.width || 0), Math.abs(element.height || 0)) / 2;
          const innerRadius = starRadius * 0.4;

          ctx.beginPath();
          for (let i = 0; i < 10; i++) {
            const angle = (i * Math.PI) / 5;
            const radius = i % 2 === 0 ? starRadius : innerRadius;
            const x = starCenterX + radius * Math.cos(angle - Math.PI / 2);
            const y = starCenterY + radius * Math.sin(angle - Math.PI / 2);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();

          if (element.filled && element.fillColor) {
            ctx.fill();
          }
          ctx.stroke();
          break;
        case 'arrow':
          if (element.width && element.height) {
            const endX = element.x + element.width;
            const endY = element.y + element.height;

            ctx.beginPath();
            ctx.moveTo(element.x, element.y);
            ctx.lineTo(endX, endY);
            ctx.stroke();

            const headlen = 15;
            const angle = Math.atan2(element.height, element.width);
            ctx.beginPath();
            ctx.moveTo(endX, endY);
            ctx.lineTo(endX - headlen * Math.cos(angle - Math.PI / 6), endY - headlen * Math.sin(angle - Math.PI / 6));
            ctx.moveTo(endX, endY);
            ctx.lineTo(endX - headlen * Math.cos(angle + Math.PI / 6), endY - headlen * Math.sin(angle + Math.PI / 6));
            ctx.stroke();
          }
          break;
        case 'image':
          if (element.imageElement && element.width && element.height) {
            ctx.drawImage(element.imageElement, element.x, element.y, element.width, element.height);

            if (selectedElement === element.id) {
              ctx.strokeStyle = '#2563eb';
              ctx.lineWidth = 2;
              ctx.setLineDash([5, 5]);
              ctx.strokeRect(element.x, element.y, element.width, element.height);
              ctx.setLineDash([]);
            }
          }
          break;
        case 'text':
          if (element.text) {
            ctx.fillStyle = element.color;
            ctx.font = `${element.fontSize || 16}px ${element.fontFamily || 'Arial'}`;
            ctx.textBaseline = 'top';

            const lines = element.text.split('\n');
            const lineHeight = (element.fontSize || 16) * 1.2;

            lines.forEach((line: string, index: number) => {
              ctx.fillText(line, element.x, element.y + index * lineHeight);
            });

            if (selectedElement === element.id) {
              const textWidth = Math.max(...lines.map((line: string) => ctx.measureText(line).width));
              const textHeight = lines.length * lineHeight;

              ctx.strokeStyle = '#2563eb';
              ctx.lineWidth = 1;
              ctx.setLineDash([3, 3]);
              ctx.strokeRect(element.x - 2, element.y - 2, textWidth + 4, textHeight + 4);
              ctx.setLineDash([]);
            }
          }
          break;
      }

      if (selectedElement === element.id && element.type !== 'image') {
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);

        if (element.type === 'pen' && element.points) {
          const xs = element.points.map((p: Point) => p.x);
          const ys = element.points.map((p: Point) => p.y);
          const minX = Math.min(...xs);
          const maxX = Math.max(...xs);
          const minY = Math.min(...ys);
          const maxY = Math.max(...ys);
          ctx.strokeRect(minX - 5, minY - 5, maxX - minX + 10, maxY - minY + 10);
        } else if (element.width && element.height) {
          ctx.strokeRect(element.x, element.y, element.width, element.height);
        }

        ctx.setLineDash([]);
      }
    },
    [selectedElement]
  );

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    elements.forEach((element: Element) => drawElement(ctx, element));

    if (isDrawing && (currentTool === 'pen' || currentTool === 'eraser') && currentPath.length > 1) {
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = currentStrokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (currentTool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
        ctx.lineWidth = currentStrokeWidth * 2;
      }

      ctx.beginPath();
      ctx.moveTo(currentPath[0].x, currentPath[0].y);
      currentPath.forEach((point: Point) => ctx.lineTo(point.x, point.y));
      ctx.stroke();

      if (currentTool === 'eraser') {
        ctx.globalCompositeOperation = 'source-over';
      }
    }

    if (isDrawing && startPoint && currentTool !== 'pen' && currentTool !== 'select' && currentTool !== 'eraser' && currentTool !== 'text') {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const currentX = (window.event as MouseEvent)?.clientX - rect.left || 0;
      const currentY = (window.event as MouseEvent)?.clientY - rect.top || 0;

      ctx.strokeStyle = currentColor;
      ctx.lineWidth = currentStrokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (isFilled) {
        ctx.fillStyle = currentFillColor;
      }

      const width = currentX - startPoint.x;
      const height = currentY - startPoint.y;

      switch (currentTool) {
        case 'rectangle':
          if (isFilled) {
            ctx.fillRect(startPoint.x, startPoint.y, width, height);
          }
          ctx.strokeRect(startPoint.x, startPoint.y, width, height);
          break;
        case 'circle':
          const radius = Math.sqrt(width * width + height * height) / 2;
          ctx.beginPath();
          ctx.arc(startPoint.x + width / 2, startPoint.y + height / 2, Math.abs(radius), 0, 2 * Math.PI);
          if (isFilled) {
            ctx.fill();
          }
          ctx.stroke();
          break;
        case 'triangle':
          const centerX = startPoint.x + width / 2;
          const centerY = startPoint.y + height / 2;
          const size = Math.min(Math.abs(width), Math.abs(height)) / 2;

          ctx.beginPath();
          ctx.moveTo(centerX, centerY - size);
          ctx.lineTo(centerX - size, centerY + size);
          ctx.lineTo(centerX + size, centerY + size);
          ctx.closePath();

          if (isFilled) {
            ctx.fill();
          }
          ctx.stroke();
          break;
        case 'diamond':
          const diamondCenterX = startPoint.x + width / 2;
          const diamondCenterY = startPoint.y + height / 2;
          const diamondWidth = Math.abs(width) / 2;
          const diamondHeight = Math.abs(height) / 2;

          ctx.beginPath();
          ctx.moveTo(diamondCenterX, diamondCenterY - diamondHeight);
          ctx.lineTo(diamondCenterX + diamondWidth, diamondCenterY);
          ctx.lineTo(diamondCenterX, diamondCenterY + diamondHeight);
          ctx.lineTo(diamondCenterX - diamondWidth, diamondCenterY);
          ctx.closePath();

          if (isFilled) {
            ctx.fill();
          }
          ctx.stroke();
          break;
        case 'hexagon':
          const hexCenterX = startPoint.x + width / 2;
          const hexCenterY = startPoint.y + height / 2;
          const hexRadius = Math.min(Math.abs(width), Math.abs(height)) / 2;

          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            const x = hexCenterX + hexRadius * Math.cos(angle);
            const y = hexCenterY + hexRadius * Math.sin(angle);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();

          if (isFilled) {
            ctx.fill();
          }
          ctx.stroke();
          break;
        case 'star':
          const starCenterX = startPoint.x + width / 2;
          const starCenterY = startPoint.y + height / 2;
          const starRadius = Math.min(Math.abs(width), Math.abs(height)) / 2;
          const innerRadius = starRadius * 0.4;

          ctx.beginPath();
          for (let i = 0; i < 10; i++) {
            const angle = (i * Math.PI) / 5;
            const radius = i % 2 === 0 ? starRadius : innerRadius;
            const x = starCenterX + radius * Math.cos(angle - Math.PI / 2);
            const y = starCenterY + radius * Math.sin(angle - Math.PI / 2);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();

          if (isFilled) {
            ctx.fill();
          }
          ctx.stroke();
          break;
        case 'arrow':
          ctx.beginPath();
          ctx.moveTo(startPoint.x, startPoint.y);
          ctx.lineTo(currentX, currentY);
          ctx.stroke();

          const headlen = 15;
          const angle = Math.atan2(height, width);
          ctx.beginPath();
          ctx.moveTo(currentX, currentY);
          ctx.lineTo(currentX - headlen * Math.cos(angle - Math.PI / 6), currentY - headlen * Math.sin(angle - Math.PI / 6));
          ctx.moveTo(currentX, currentY);
          ctx.lineTo(currentX - headlen * Math.cos(angle + Math.PI / 6), currentY - headlen * Math.sin(angle + Math.PI / 6));
          ctx.stroke();
          break;
      }
    }
  }, [elements, isDrawing, currentPath, startPoint, currentTool, currentColor, currentFillColor, isFilled, currentStrokeWidth, drawElement, selectedElement]);

  const getElementAtPosition = useCallback(
    (x: number, y: number): Element | null => {
      for (let i = elements.length - 1; i >= 0; i--) {
        const element = elements[i];

        if (element.erased) continue;

        if (element.type === 'text' && element.text) {
          const canvas = canvasRef.current;
          if (!canvas) continue;
          const ctx = canvas.getContext('2d');
          if (!ctx) continue;

          ctx.font = `${element.fontSize || 16}px ${element.fontFamily || 'Arial'}`;
          const lines = element.text.split('\n');
          const lineHeight = (element.fontSize || 16) * 1.2;
          const textWidth = Math.max(...lines.map((line: string) => ctx.measureText(line).width));
          const textHeight = lines.length * lineHeight;

          if (x >= element.x && x <= element.x + textWidth && y >= element.y && y <= element.y + textHeight) {
            return element;
          }
        } else if (element.type === 'pen' && element.points) {
          for (const point of element.points) {
            const distance = Math.sqrt(Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2));
            if (distance < 10) return element;
          }
        } else if (element.width && element.height) {
          if (x >= element.x && x <= element.x + element.width && y >= element.y && y <= element.y + element.height) {
            return element;
          }
        }
      }
      return null;
    },
    [elements]
  );

  const eraseAtPosition = useCallback(
    (x: number, y: number) => {
      const element = getElementAtPosition(x, y);
      if (element) {
        updateElement(element.id, { erased: true });
      }
    },
    [getElementAtPosition, updateElement]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (!container) return;

      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      redrawCanvas();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [redrawCanvas]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoordinates(e);
    const currentTime = Date.now();

    if (currentTool === 'text') {
      setTextPosition(coords);
      setIsEditingText(true);
      setEditingTextId(null);
      return;
    }

    if (currentTool === 'select') {
      const clickedElement = getElementAtPosition(coords.x, coords.y);
      if (clickedElement) {
        if (clickedElement.type === 'text' && currentTime - lastClickTime < 300) {
          setTextPosition({ x: clickedElement.x, y: clickedElement.y });
          setIsEditingText(true);
          setEditingTextId(clickedElement.id);
          setLastClickTime(0);
          return;
        }
        setSelectedElement(clickedElement.id);
        setIsDragging(true);
        setDragOffset({
          x: coords.x - clickedElement.x,
          y: coords.y - clickedElement.y,
        });
      } else {
        setSelectedElement(null);
      }
      setLastClickTime(currentTime);
    } else if (currentTool === 'fill') {
      const clickedElement = getElementAtPosition(coords.x, coords.y);
      if (clickedElement && clickedElement.type !== 'pen' && clickedElement.type !== 'image') {
        updateElement(clickedElement.id, {
          filled: true,
          fillColor: currentFillColor,
        });
      }
    } else {
      setIsDrawing(true);
      setStartPoint(coords);

      if (currentTool === 'pen' || currentTool === 'eraser') {
        setCurrentPath([coords]);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoordinates(e);

    if (isDragging && selectedElement) {
      const element = elements.find((el: Element) => el.id === selectedElement);
      if (element) {
        updateElement(selectedElement, {
          x: coords.x - dragOffset.x,
          y: coords.y - dragOffset.y,
        });
      }
    } else if (isDrawing) {
      if (currentTool === 'pen' || currentTool === 'eraser') {
        setCurrentPath((prev) => [...prev, coords]);
        if (currentTool === 'eraser') {
          eraseAtPosition(coords.x, coords.y);
        }
      }
      redrawCanvas();
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) {
      setIsDragging(false);
      return;
    }

    if (!isDrawing || !startPoint) return;

    const coords = getCanvasCoordinates(e);

    if (currentTool !== 'eraser') {
      const newElement: Element = {
        id: Date.now().toString(),
        type: currentTool,
        x: startPoint.x,
        y: startPoint.y,
        width: coords.x - startPoint.x,
        height: coords.y - startPoint.y,
        points: currentTool === 'pen' ? currentPath : undefined,
        color: currentColor,
        strokeWidth: currentStrokeWidth,
        fillColor: isFilled ? currentFillColor : undefined,
        filled: isFilled,
      };
      addElement(newElement);
    }

    setIsDrawing(false);
    setStartPoint(null);
    setCurrentPath([]);
  };

  const handleTextSubmit = (text: string) => {
    if (text.trim()) {
      if (editingTextId) {
        updateElement(editingTextId, { text });
      } else {
        const newElement: Element = {
          id: Date.now().toString(),
          type: 'text',
          x: textPosition.x,
          y: textPosition.y,
          text,
          color: currentColor,
          strokeWidth: currentStrokeWidth,
          fontSize: 16,
          fontFamily: 'Arial',
        };
        addElement(newElement);
      }
    }
    setIsEditingText(false);
    setEditingTextId(null);
  };

  const handleTextCancel = () => {
    setIsEditingText(false);
    setEditingTextId(null);
  };

  return (
    <div className={`flex-1 ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'} transition-colors duration-300 relative`}>
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="w-full h-full cursor-crosshair"
        style={{
          cursor:
            currentTool === 'select' ? 'default' : currentTool === 'eraser' ? 'grab' : currentTool === 'text' ? 'text' : 'crosshair',
        }}
      />

      {isEditingText && (
        <TextEditor
          position={textPosition}
          initialText={editingTextId ? elements.find((el: Element) => el.id === editingTextId)?.text || '' : ''}
          onSubmit={handleTextSubmit}
          onCancel={handleTextCancel}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
};
