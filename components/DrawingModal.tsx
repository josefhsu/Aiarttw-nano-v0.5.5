import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { Point } from '../types';
import { AdvancedColorPicker } from './ColorPicker';
import { Eraser, Upload, Camera, X } from 'lucide-react';
import { CameraModal } from './CameraModal';
import { fileToBase64 } from '../utils';

interface DrawingModalProps {
  onSave: (dataUrl: string, width: number, height: number) => void;
  onClose: () => void;
  initialDrawing?: string;
}

const aspectRatios = [
    { value: 16/9, text: '16:9', width: 960, height: 540 },
    { value: 3/2, text: '3:2', width: 800, height: 533 },
    { value: 1/1, text: '1:1', width: 600, height: 600 },
    { value: 2/3, text: '2:3', width: 533, height: 800 },
    { value: 9/16, text: '9:16', width: 540, height: 960 },
];

export const DrawingModal: React.FC<DrawingModalProps> = ({ onSave, onClose, initialDrawing }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#ffffff');
  const [backgroundColor, setBackgroundColor] = useState('transparent');
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);
  const [lineWidth, setLineWidth] = useState(5);
  const [isErasing, setIsErasing] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(aspectRatios[0]);
  const [showBrushPreview, setShowBrushPreview] = useState(false);
  const [brushCursorPosition, setBrushCursorPosition] = useState<Point | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isTakingPhotoForBackground, setIsTakingPhotoForBackground] = useState(false);

  const lastPointRef = useRef<Point | null>(null);
  const getCanvasContext = useCallback(() => canvasRef.current?.getContext('2d', { willReadFrequently: true }), []);

  const drawCanvasContent = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = getCanvasContext();
    if (!canvas || !ctx) return;

    // Clear everything first
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background color
    if (backgroundColor !== 'transparent') {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // Draw background image
    if (backgroundImage) {
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    }
  }, [getCanvasContext, backgroundColor, backgroundImage]);

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = aspectRatio.width;
    canvas.height = aspectRatio.height;
    
    drawCanvasContent();

    const ctx = getCanvasContext();
    if (ctx && initialDrawing) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      img.src = initialDrawing;
    }
  }, [getCanvasContext, initialDrawing, aspectRatio, drawCanvasContent]);

  useEffect(() => {
    setupCanvas();
  }, [setupCanvas]);
  
  const handleBackgroundImageFile = async (file: File | null) => {
    if (!file || !file.type.startsWith('image/')) return;
    const base64 = await fileToBase64(file);
    handleBackgroundImageSrc(base64);
  };
  
  const handleBackgroundImageSrc = (src: string) => {
    const img = new Image();
    img.onload = () => {
        const newAspectRatioInfo = {
            value: img.width / img.height,
            text: `${img.width}x${img.height}`,
            width: img.width,
            height: img.height,
        };
        setBackgroundImage(img);
        setAspectRatio(newAspectRatioInfo);
    };
    img.src = src;
  };

  const clearCanvasStrokes = useCallback(() => {
    drawCanvasContent();
  }, [drawCanvasContent]);
  
  const getMousePos = (e: React.MouseEvent): Point => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const scaleX = canvasRef.current!.width / rect.width;
    const scaleY = canvasRef.current!.height / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const startDrawing = (e: React.MouseEvent) => {
    const ctx = getCanvasContext();
    if (!ctx) return;
    setIsDrawing(true);
    lastPointRef.current = getMousePos(e);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = lineWidth;
    ctx.globalCompositeOperation = isErasing ? 'destination-out' : 'source-over';
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    
    // Draw a single dot if it's just a click
    ctx.beginPath();
    ctx.arc(lastPointRef.current.x, lastPointRef.current.y, lineWidth / 2, 0, Math.PI * 2);
    ctx.fill();
  };

  const draw = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    const ctx = getCanvasContext();
    const currentPoint = getMousePos(e);
    if (ctx && lastPointRef.current) {
      ctx.beginPath();
      ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
      ctx.lineTo(currentPoint.x, currentPoint.y);
      ctx.stroke();
    }
    lastPointRef.current = currentPoint;
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    lastPointRef.current = null;
  };

  const handleSave = () => {
    if (canvasRef.current) {
      onSave(canvasRef.current.toDataURL('image/png'), canvasRef.current.width, canvasRef.current.height);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };
  const handleDragLeave = () => setIsDraggingOver(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleBackgroundImageFile(e.dataTransfer.files[0]);
    }
  };
  
  return (
    <div 
        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center backdrop-blur-sm" 
        onMouseDown={onClose}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
    >
      <div className="bg-[var(--cyber-bg)] border border-[var(--cyber-border)] p-6 rounded-xl shadow-2xl flex flex-col gap-4" onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
                 <h2 className="text-xl font-bold text-[var(--cyber-cyan)]">塗鴉板</h2>
                 <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">背景色:</span>
                    <AdvancedColorPicker selectedColor={backgroundColor} onColorChange={setBackgroundColor} />
                 </div>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">畫布比例:</span>
                {aspectRatios.map(ar => (
                    <button key={ar.text} onClick={() => { setBackgroundImage(null); setAspectRatio(ar); }} className={`px-3 py-1 text-xs rounded-md ${aspectRatio.value === ar.value && !backgroundImage ? 'bg-[var(--cyber-cyan)] text-black' : 'bg-slate-700 text-gray-300'}`}>
                        {ar.text}
                    </button>
                ))}
            </div>
        </div>
        <div className="relative">
            <canvas
              ref={canvasRef}
              className="bg-slate-800 rounded-lg cursor-none"
              style={{ width: aspectRatio.width, height: aspectRatio.height, maxWidth: '70vw', maxHeight: '60vh' }}
              onMouseDown={startDrawing}
              onMouseMove={(e) => { draw(e); setBrushCursorPosition(getMousePos(e)); }}
              onMouseUp={stopDrawing}
              onMouseLeave={() => { stopDrawing(); setBrushCursorPosition(null); }}
            />
             {showBrushPreview && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div 
                        className="border-2 border-dashed border-white/50 rounded-full"
                        style={{ width: lineWidth, height: lineWidth }}
                    />
                </div>
            )}
            {brushCursorPosition && (() => {
                const canvas = canvasRef.current;
                if (!canvas) return null;
                const rect = canvas.getBoundingClientRect();

                // Handle potential division by zero if canvas is not rendered yet
                if (rect.width === 0 || rect.height === 0) return null;

                // Calculate separate scaling factors for X and Y axes to handle non-uniform scaling
                const scaleX = canvas.width / rect.width;
                const scaleY = canvas.height / rect.height;

                // Convert brush position from canvas bitmap coordinates to display coordinates
                const displayX = brushCursorPosition.x / scaleX;
                const displayY = brushCursorPosition.y / scaleY;

                // Convert brush size from canvas bitmap pixels to display pixels
                const displayWidth = lineWidth / scaleX;
                const displayHeight = lineWidth / scaleY;

                return (
                    <div
                        className="absolute bg-white/30 rounded-full pointer-events-none"
                        style={{
                            left: displayX,
                            top: displayY,
                            width: displayWidth,
                            height: displayHeight,
                            transform: `translate(-50%, -50%)`,
                        }}
                    />
                );
            })()}
            {isDraggingOver && (
                 <div className="absolute inset-0 bg-cyan-900/40 border-4 border-dashed border-[var(--cyber-cyan)] pointer-events-none z-50 flex items-center justify-center backdrop-blur-sm rounded-lg">
                    <p className="text-2xl font-bold text-white drop-shadow-lg">拖放圖片以設為背景</p>
                 </div>
            )}
        </div>
        <div className="flex justify-between items-center gap-4">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400 whitespace-nowrap">筆刷尺寸:</span>
                    <input 
                        type="range" min="1" max="100" value={lineWidth} 
                        onChange={e => setLineWidth(parseInt(e.target.value))} 
                        onMouseDown={() => setShowBrushPreview(true)}
                        onMouseUp={() => setShowBrushPreview(false)}
                        className="w-24"
                    />
                    <span className="text-sm text-gray-400 w-8 text-center">{lineWidth}px</span>
                </div>
                <div className="flex items-center gap-2">
                    <AdvancedColorPicker selectedColor={color} onColorChange={(c) => { setColor(c); setIsErasing(false); }} />
                    <button onClick={() => setIsErasing(!isErasing)} className={`p-2 rounded-full ${isErasing ? 'bg-cyan-500/30' : ''}`}><Eraser color={isErasing ? 'cyan' : 'white'} /></button>
                    <div className="w-px h-6 bg-slate-700 mx-1" />
                    <button title="上傳背景圖" onClick={() => fileInputRef.current?.click()} className="p-2 rounded-full hover:bg-slate-700"><Upload size={20} /></button>
                    <button title="用相機拍攝背景" onClick={() => setIsTakingPhotoForBackground(true)} className="p-2 rounded-full hover:bg-slate-700"><Camera size={20} /></button>
                    {backgroundImage && <button title="移除背景圖" onClick={() => setBackgroundImage(null)} className="p-2 rounded-full hover:bg-rose-500/50"><X size={20} className="text-rose-400" /></button>}
                    <input type="file" ref={fileInputRef} onChange={(e) => handleBackgroundImageFile(e.target.files?.[0] ?? null)} accept="image/*" className="hidden" />
                </div>
            </div>
            <div className="flex gap-2">
                <button onClick={clearCanvasStrokes} className="px-4 py-2 bg-slate-700 text-gray-200 rounded-md hover:bg-slate-600">清除</button>
                <button onClick={handleSave} className="px-4 py-2 bg-[var(--cyber-cyan)] text-black font-bold rounded-md hover:bg-cyan-300">儲存</button>
                <button onClick={onClose} className="px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-500">關閉</button>
            </div>
        </div>
      </div>
      {isTakingPhotoForBackground && (
        <CameraModal 
            onClose={() => setIsTakingPhotoForBackground(false)}
            onCapture={(dataUrl) => {
                handleBackgroundImageSrc(dataUrl);
                setIsTakingPhotoForBackground(false);
            }}
        />
      )}
    </div>
  );
};