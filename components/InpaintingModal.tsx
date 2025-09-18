import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { ImageElement, DrawingElement, Point, ImageCompareElement } from '../types';
import { Wand2, Lightbulb, Sparkles, Brush, Eraser, Undo, Redo, Trash2, ChevronsLeftRight } from 'lucide-react';

interface InpaintingModalProps {
  element: ImageElement | DrawingElement | ImageCompareElement;
  onClose: () => void;
  onGenerate: (element: ImageElement | DrawingElement | ImageCompareElement, maskDataUrl: string, prompt: string) => Promise<string | null>;
}

const QUICK_PROMPTS = ['漂亮的手', '更清晰精細', '修飾臉部', '移除物件', '添加光影'];

const BRUSH_COLORS = {
    'White': 'rgba(255, 255, 255, 0.5)',
    'Black': 'rgba(0, 0, 0, 0.5)',
    'Cyan': 'rgba(0, 245, 212, 0.5)',
    'Pink': 'rgba(255, 0, 247, 0.5)',
    'Purple': 'rgba(157, 0, 255, 0.5)',
};

export const InpaintingModal: React.FC<InpaintingModalProps> = ({ element, onClose, onGenerate }) => {
    const backgroundCanvasRef = useRef<HTMLCanvasElement>(null);
    const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
    
    const [isDrawing, setIsDrawing] = useState(false);
    const [brushColor, setBrushColor] = useState(BRUSH_COLORS['White']);
    const [lineWidth, setLineWidth] = useState(40);
    const [prompt, setPrompt] = useState('');
    const [isErasing, setIsErasing] = useState(false);
    const [history, setHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [showBrushPreview, setShowBrushPreview] = useState(false);
    const [brushCursorPosition, setBrushCursorPosition] = useState<Point | null>(null);

    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [sliderPosition, setSliderPosition] = useState(50);
    const compareContainerRef = useRef<HTMLDivElement>(null);

    const lastPointRef = useRef<Point | null>(null);

    const isReEdit = element.type === 'imageCompare';
    const baseImageSrc = isReEdit ? element.srcBefore : element.src;
    const initialMaskSrc = isReEdit ? element.maskSrc : undefined;
    
    useEffect(() => {
        setPrompt(isReEdit ? element.inpaintedPrompt || '' : '');
    }, [isReEdit, element]);
    
    const getDrawingContext = useCallback(() => drawingCanvasRef.current?.getContext('2d'), []);

    const saveHistory = useCallback(() => {
        const canvas = drawingCanvasRef.current;
        if (!canvas) return;
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(canvas.toDataURL());
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    }, [history, historyIndex]);

    const restoreCanvasFromHistory = useCallback(() => {
        if (historyIndex < 0 || history.length === 0) return;
        const dataUrl = history[historyIndex];
        const ctx = getDrawingContext();
        const canvas = drawingCanvasRef.current;
        if (ctx && canvas) {
            const img = new Image();
            img.onload = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
            };
            img.src = dataUrl;
        }
    }, [history, historyIndex, getDrawingContext]);
    
    // CRITICAL FIX: Restore canvas on every history change to prevent drawing from disappearing on re-render
    useEffect(() => {
        restoreCanvasFromHistory();
    }, [historyIndex, restoreCanvasFromHistory]);


    useEffect(() => {
        const bgCanvas = backgroundCanvasRef.current;
        const drawCanvas = drawingCanvasRef.current;
        const bgCtx = bgCanvas?.getContext('2d');
        const drawCtx = drawCanvas?.getContext('2d');
        if (!bgCanvas || !drawCanvas || !bgCtx || !drawCtx) return;

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const containerWidth = window.innerWidth * 0.7;
            const containerHeight = window.innerHeight * 0.6;
            
            const scale = Math.min(containerWidth / img.width, containerHeight / img.height);
            const displayWidth = img.width * scale;
            const displayHeight = img.height * scale;

            bgCanvas.width = drawCanvas.width = img.width;
            bgCanvas.height = drawCanvas.height = img.height;
            
            bgCanvas.style.width = `${displayWidth}px`;
            bgCanvas.style.height = `${displayHeight}px`;
            drawCanvas.style.width = `${displayWidth}px`;
            drawCanvas.style.height = `${displayHeight}px`;

            bgCtx.drawImage(img, 0, 0);
            
            drawCtx.clearRect(0,0, drawCanvas.width, drawCanvas.height);
            const blankDataUrl = drawCanvas.toDataURL();

            if (initialMaskSrc) {
                const maskImg = new Image();
                maskImg.crossOrigin = 'anonymous';
                maskImg.onload = () => {
                    drawCtx.drawImage(maskImg, 0, 0);
                    const dataUrl = drawCanvas.toDataURL();
                    setHistory([blankDataUrl, dataUrl]);
                    setHistoryIndex(1);
                };
                maskImg.src = initialMaskSrc;
            } else {
                setHistory([blankDataUrl]);
                setHistoryIndex(0);
            }
        };
        img.src = baseImageSrc;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [baseImageSrc, initialMaskSrc]);

    const handleUndo = () => {
        if (historyIndex > 0) {
            setHistoryIndex(historyIndex - 1);
        }
    };
    
    const handleRedo = () => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(historyIndex + 1);
        }
    };

    const handleClear = () => {
        const ctx = getDrawingContext();
        if (ctx && drawingCanvasRef.current) {
            ctx.clearRect(0, 0, drawingCanvasRef.current.width, drawingCanvasRef.current.height);
            saveHistory();
        }
    };

    const getMousePos = (e: React.MouseEvent): Point => {
        const canvas = drawingCanvasRef.current!;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
    };

    const startDrawing = (e: React.MouseEvent) => {
        const ctx = getDrawingContext();
        if (!ctx) return;
        setIsDrawing(true);
        lastPointRef.current = getMousePos(e);

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = brushColor;
        ctx.fillStyle = brushColor;
        ctx.globalCompositeOperation = isErasing ? 'destination-out' : 'source-over';

        ctx.beginPath();
        ctx.arc(lastPointRef.current.x, lastPointRef.current.y, lineWidth / 2, 0, Math.PI * 2);
        ctx.fill();
    };

    const draw = (e: React.MouseEvent) => {
        if (!isDrawing) return;
        const ctx = getDrawingContext();
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
        if (isDrawing) {
            setIsDrawing(false);
            lastPointRef.current = null;
            saveHistory();
        }
    };
    
    const handleAddQuickPrompt = (p: string) => {
        setPrompt(prev => prev ? `${prev}, ${p}` : p);
    };

    const handleGenerateClick = async () => {
        const drawingCanvas = drawingCanvasRef.current;
        if (!drawingCanvas) return;

        setIsGenerating(true);

        const maskCanvas = document.createElement('canvas');
        maskCanvas.width = drawingCanvas.width;
        maskCanvas.height = drawingCanvas.height;
        const maskCtx = maskCanvas.getContext('2d');
        if (!maskCtx) {
            setIsGenerating(false);
            return;
        }
        
        // Create a solid white mask from the transparent drawing
        maskCtx.fillStyle = 'black';
        maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
        maskCtx.globalCompositeOperation = 'source-over';
        maskCtx.drawImage(drawingCanvas, 0, 0);

        const newImageSrc = await onGenerate(element, maskCanvas.toDataURL('image/png'), prompt);
        
        if (newImageSrc) {
            setGeneratedImage(newImageSrc);
        }
        
        setIsGenerating(false);
    };
    
    const handleMouseMoveCompare = useCallback((e: React.MouseEvent) => {
        if (!compareContainerRef.current) return;
        const rect = compareContainerRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
        const percent = (x / rect.width) * 100;
        setSliderPosition(percent);
      }, []);

    const renderEditingView = () => (
        <>
            <div className="relative" style={{ lineHeight: 0 }}>
                <canvas ref={backgroundCanvasRef} className="rounded-lg bg-slate-800" />
                <canvas 
                    ref={drawingCanvasRef} 
                    className="absolute top-0 left-0 rounded-lg cursor-none"
                    onMouseDown={startDrawing}
                    onMouseMove={(e) => { draw(e); setBrushCursorPosition(getMousePos(e)); }}
                    onMouseUp={stopDrawing}
                    onMouseLeave={() => { stopDrawing(); setBrushCursorPosition(null); }}
                />
                {showBrushPreview && (() => {
                    const canvas = drawingCanvasRef.current;
                    if (!canvas) return null;
                    const rect = canvas.getBoundingClientRect();
                    if (rect.width === 0 || rect.height === 0) return null;
                    const scale = rect.width / canvas.width;
                    const displaySize = lineWidth * scale;
                    
                    return (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div 
                                className="border-2 border-dashed border-white/50 rounded-full"
                                style={{ width: displaySize, height: displaySize }}
                            />
                        </div>
                    );
                })()}
                {brushCursorPosition && !showBrushPreview && (()=>{
                    const canvas = drawingCanvasRef.current;
                    if (!canvas) return null;
                    const rect = canvas.getBoundingClientRect();
                    if (rect.width === 0 || rect.height === 0) return null;
                    
                    const scaleX = rect.width / canvas.offsetWidth;
                    const displayX = brushCursorPosition.x / (canvas.width / canvas.offsetWidth);
                    const displayY = brushCursorPosition.y / (canvas.height / canvas.offsetHeight);
                    const displayWidth = lineWidth / (canvas.width / canvas.offsetWidth);
                    
                    return (
                        <div
                            className="absolute border border-dashed border-white rounded-full pointer-events-none"
                            style={{
                                left: displayX,
                                top: displayY,
                                width: displayWidth,
                                height: displayWidth,
                                transform: `translate(-50%, -50%)`,
                            }}
                        />
                    );
                })()}
                 {isGenerating && (
                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center rounded-lg">
                         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--cyber-cyan)]"></div>
                         <p className="mt-4 text-md text-white">生成中...</p>
                    </div>
                )}
            </div>
             <div className="flex flex-col gap-2">
                <div className="flex items-start gap-2">
                    <textarea 
                        placeholder="描述你想在塗抹區域看到的内容..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="flex-grow bg-slate-800/50 p-2 rounded-md text-sm placeholder-gray-400 outline-none resize-none focus:ring-2 focus:ring-[var(--cyber-cyan)]"
                        rows={2}
                    />
                     <div className="flex flex-col gap-1">
                        <button title="靈感提示" className="p-2 hover:bg-slate-700 rounded-lg"><Lightbulb size={18}/></button>
                        <button title="優化提示" className="p-2 hover:bg-slate-700 rounded-lg"><Sparkles size={18}/></button>
                    </div>
                </div>
                 <div className="flex flex-wrap gap-2">
                    {QUICK_PROMPTS.map(p => (
                         <button key={p} onClick={() => handleAddQuickPrompt(p)} className="px-3 py-1 text-xs rounded-full bg-slate-700 text-gray-300 hover:bg-slate-600">
                            {p}
                        </button>
                    ))}
                </div>
                <div className="h-px bg-slate-700 my-1" />
                 <div className="flex justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400 whitespace-nowrap">筆刷尺寸:</span>
                        <input 
                            type="range" min="1" max="150" value={lineWidth} 
                            onChange={e => setLineWidth(parseInt(e.target.value))}
                            onMouseDown={() => setShowBrushPreview(true)}
                            onMouseUp={() => setShowBrushPreview(false)}
                            onMouseLeave={() => setShowBrushPreview(false)}
                            className="w-24"
                        />
                         <span className="text-sm text-gray-400 w-8 text-center">{lineWidth}px</span>
                    </div>
                     <div className="flex items-center gap-2 p-1 bg-slate-800/50 rounded-lg">
                         {Object.entries(BRUSH_COLORS).map(([name, colorValue]) => (
                            <button
                                key={name}
                                title={name}
                                onClick={() => { setBrushColor(colorValue); setIsErasing(false); }}
                                className={`w-6 h-6 rounded-full border-2 ${brushColor === colorValue && !isErasing ? 'border-white' : 'border-transparent'}`}
                                style={{ backgroundColor: colorValue }}
                            />
                         ))}
                    </div>
                    <div className="flex items-center gap-1 p-1 bg-slate-800/50 rounded-lg">
                        <button title="筆刷" onClick={() => setIsErasing(false)} className={`p-2 rounded-lg ${!isErasing ? 'bg-cyan-500/30' : 'hover:bg-slate-700'}`}><Brush size={18} /></button>
                        <button title="橡皮擦" onClick={() => setIsErasing(true)} className={`p-2 rounded-lg ${isErasing ? 'bg-cyan-500/30' : 'hover:bg-slate-700'}`}><Eraser size={18} /></button>
                        <div className="w-px h-6 bg-slate-700 mx-1" />
                        <button title="復原" onClick={handleUndo} disabled={historyIndex <= 0} className="p-2 rounded-lg hover:bg-slate-700 disabled:opacity-50"><Undo size={18} /></button>
                        <button title="重做" onClick={handleRedo} disabled={historyIndex >= history.length - 1} className="p-2 rounded-lg hover:bg-slate-700 disabled:opacity-50"><Redo size={18} /></button>
                        <button title="清除" onClick={handleClear} className="p-2 rounded-lg hover:bg-slate-700"><Trash2 size={18} /></button>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button onClick={onClose} className="px-4 py-2 bg-slate-700 text-gray-200 rounded-md hover:bg-slate-600">取消</button>
                        <button onClick={handleGenerateClick} disabled={isGenerating} className="px-4 py-2 bg-[var(--cyber-cyan)] text-black font-bold rounded-md hover:bg-cyan-300 flex items-center gap-2">
                            <Wand2 size={16}/>
                            {isGenerating ? '生成中...' : '生成'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );

    const renderResultView = () => (
        <>
            <div 
                ref={compareContainerRef}
                className="relative cursor-ew-resize overflow-hidden rounded-lg bg-slate-800"
                style={{
                    width: backgroundCanvasRef.current?.style.width,
                    height: backgroundCanvasRef.current?.style.height
                }}
                onMouseMove={handleMouseMoveCompare}
            >
                <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}>
                    <img src={generatedImage!} alt="After" className="absolute top-0 left-0 w-full h-full object-contain pointer-events-none" />
                </div>
                <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}>
                    <img src={baseImageSrc} alt="Before" className="absolute top-0 left-0 w-full h-full object-contain pointer-events-none" />
                </div>
                <div className="absolute top-0 bottom-0 w-1 bg-orange-500 pointer-events-none" style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}>
                    <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                        <ChevronsLeftRight size={16} className="text-white" />
                    </div>
                </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
                <button onClick={() => setGeneratedImage(null)} className="px-4 py-2 bg-slate-700 text-gray-200 rounded-md hover:bg-slate-600">繼續編輯</button>
                <button onClick={onClose} className="px-4 py-2 bg-[var(--cyber-cyan)] text-black font-bold rounded-md hover:bg-cyan-300">完成並離開</button>
            </div>
        </>
    );

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center backdrop-blur-sm" onMouseDown={generatedImage ? undefined : onClose}>
            <div className="bg-[var(--cyber-bg)] border border-[var(--cyber-border)] p-6 rounded-xl shadow-2xl flex flex-col gap-4" onMouseDown={(e) => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-[var(--cyber-cyan)]">Inpaint / 局部重繪</h2>
                {generatedImage ? renderResultView() : renderEditingView()}
            </div>
        </div>
    );
};