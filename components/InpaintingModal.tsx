import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { ImageElement, DrawingElement, Point, ImageCompareElement } from '../types';
import { Wand2, Lightbulb, Sparkles, Brush, Eraser, Undo, Redo, Trash2, ChevronsLeftRight } from 'lucide-react';
import { GoogleGenAI, Modality } from "@google/genai";
import { dataUrlToBlob } from '../utils';

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

const SMART_SELECT_OPTIONS = {
    '人物': ['臉', '頭髮', '頭部', '手掌', '上半身', '下半身', '全身', '上衣', '褲/裙', '衣服'],
    '場景': ['背景', '電線', '物件主體', '產品'],
};

const SMART_SELECT_PROMPT_MAP: Record<string, string> = {
    '臉': 'the face of the person',
    '頭髮': 'the hair of the person',
    '頭部': 'the entire head of the person',
    '手掌': 'the hands',
    '上半身': 'the upper body of the person',
    '下半身': 'the lower body of the person',
    '全身': 'the entire person',
    '上衣': 'the shirt or top clothing',
    '褲/裙': 'the pants or skirt',
    '衣服': 'all the clothing on the person',
    '背景': 'the background, excluding the main subjects',
    '電線': 'any visible cables or wires',
    '物件主體': 'the main subject/object in the foreground',
    '產品': 'the product being displayed',
};

type Tool = 'brush' | 'eraser' | 'smart';

export const InpaintingModal: React.FC<InpaintingModalProps> = ({ element, onClose, onGenerate }) => {
    const backgroundCanvasRef = useRef<HTMLCanvasElement>(null);
    const drawingCanvasRef = useRef<HTMLCanvasElement>(null); // Visible canvas
    const maskCanvasRef = useRef<HTMLCanvasElement | null>(null); // Offscreen solid mask
    
    const [isDrawing, setIsDrawing] = useState(false);
    const [brushColor, setBrushColor] = useState(BRUSH_COLORS['White']);
    const [lineWidth, setLineWidth] = useState(40);
    const [prompt, setPrompt] = useState('');
    const [activeTool, setActiveTool] = useState<Tool>('brush');
    const [smartSelectTarget, setSmartSelectTarget] = useState<string>(SMART_SELECT_OPTIONS['人物'][0]);
    
    const [history, setHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [showBrushPreview, setShowBrushPreview] = useState(false);
    const [brushCursorPosition, setBrushCursorPosition] = useState<Point | null>(null);

    const [isGenerating, setIsGenerating] = useState(false);
    const [generationStatus, setGenerationStatus] = useState('生成中...');
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [sliderPosition, setSliderPosition] = useState(50);
    const compareContainerRef = useRef<HTMLDivElement>(null);

    const lastPointRef = useRef<Point | null>(null);

    const isReEdit = element.type === 'imageCompare' && element.wasInpainted;
    // FIX: Correctly determine the base image source by checking the element type.
    // 'ImageCompareElement' does not have a 'src' property, so we must handle it explicitly.
    const baseImageSrc = element.type === 'imageCompare' ? element.srcBefore : element.src;
    const initialMaskSrc = isReEdit ? element.maskSrc : undefined;
    
    useEffect(() => {
        setPrompt(isReEdit ? element.inpaintedPrompt || '' : '');
    }, [isReEdit, element]);
    
    const getDrawingContext = useCallback(() => drawingCanvasRef.current?.getContext('2d'), []);
    const getMaskContext = useCallback(() => maskCanvasRef.current?.getContext('2d'), []);

    const syncVisibleCanvas = useCallback(() => {
        const visibleCtx = getDrawingContext();
        const maskCanvas = maskCanvasRef.current;
        if (!visibleCtx || !maskCanvas) return;

        visibleCtx.clearRect(0, 0, visibleCtx.canvas.width, visibleCtx.canvas.height);
        
        // Draw the semi-transparent mask color
        visibleCtx.fillStyle = brushColor;
        visibleCtx.fillRect(0, 0, visibleCtx.canvas.width, visibleCtx.canvas.height);

        // Use the solid mask shape to clip the color
        visibleCtx.globalCompositeOperation = 'destination-in';
        visibleCtx.drawImage(maskCanvas, 0, 0);

        // Reset for future operations
        visibleCtx.globalCompositeOperation = 'source-over';

    }, [getDrawingContext, brushColor]);

    const saveHistory = useCallback(() => {
        const canvas = maskCanvasRef.current;
        if (!canvas) return;
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(canvas.toDataURL());
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    }, [history, historyIndex]);

    const restoreCanvasFromHistory = useCallback(() => {
        if (historyIndex < 0 || history.length === 0) {
            // Clear if history is empty
            const maskCtx = getMaskContext();
            if (maskCtx) {
                maskCtx.clearRect(0, 0, maskCtx.canvas.width, maskCtx.canvas.height);
                syncVisibleCanvas();
            }
            return;
        };
        const dataUrl = history[historyIndex];
        const maskCtx = getMaskContext();
        if (maskCtx) {
            const img = new Image();
            img.onload = () => {
                maskCtx.clearRect(0, 0, maskCtx.canvas.width, maskCtx.canvas.height);
                maskCtx.drawImage(img, 0, 0);
                syncVisibleCanvas();
            };
            img.src = dataUrl;
        }
    }, [history, historyIndex, getMaskContext, syncVisibleCanvas]);
    
    useEffect(() => {
        restoreCanvasFromHistory();
    }, [historyIndex, restoreCanvasFromHistory]);


    useEffect(() => {
        const bgCanvas = backgroundCanvasRef.current;
        const drawCanvas = drawingCanvasRef.current; // This is the visible canvas
        if (!bgCanvas || !drawCanvas) return;

        // Create the offscreen canvas for the solid mask
        maskCanvasRef.current = document.createElement('canvas');
        const maskCanvas = maskCanvasRef.current;
        
        const bgCtx = bgCanvas.getContext('2d');
        if (!bgCtx) return;

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const container = bgCanvas.parentElement;
            if (!container) return;
            const containerWidth = container.clientWidth;
            const containerHeight = container.clientHeight;
            
            const scale = Math.min(containerWidth / img.width, containerHeight / img.height);
            const displayWidth = img.width * scale;
            const displayHeight = img.height * scale;

            bgCanvas.width = drawCanvas.width = maskCanvas.width = img.width;
            bgCanvas.height = drawCanvas.height = maskCanvas.height = img.height;
            
            bgCanvas.style.width = `${displayWidth}px`;
            bgCanvas.style.height = `${displayHeight}px`;
            drawCanvas.style.width = `${displayWidth}px`;
            drawCanvas.style.height = `${displayHeight}px`;

            bgCtx.drawImage(img, 0, 0);
            
            const maskCtx = getMaskContext();
            if(!maskCtx) return;

            maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
            const blankDataUrl = maskCanvas.toDataURL();

            if (initialMaskSrc) {
                const maskImg = new Image();
                maskImg.crossOrigin = 'anonymous';
                maskImg.onload = () => {
                    maskCtx.drawImage(maskImg, 0, 0);
                    const dataUrl = maskCanvas.toDataURL();
                    setHistory([blankDataUrl, dataUrl]);
                    setHistoryIndex(1);
                    syncVisibleCanvas();
                };
                maskImg.src = initialMaskSrc;
            } else {
                setHistory([blankDataUrl]);
                setHistoryIndex(0);
                syncVisibleCanvas();
            }
        };
        img.src = baseImageSrc;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [baseImageSrc, initialMaskSrc, getMaskContext, syncVisibleCanvas]);

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
        const ctx = getMaskContext();
        if (ctx) {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            syncVisibleCanvas();
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
        if (activeTool === 'smart') return;
        const ctx = getMaskContext();
        if (!ctx) return;
        setIsDrawing(true);
        lastPointRef.current = getMousePos(e);

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = 'white';
        ctx.fillStyle = 'white';
        ctx.globalCompositeOperation = activeTool === 'eraser' ? 'destination-out' : 'source-over';

        ctx.beginPath();
        ctx.arc(lastPointRef.current.x, lastPointRef.current.y, lineWidth / 2, 0, Math.PI * 2);
        ctx.fill();
        syncVisibleCanvas();
    };

    const draw = (e: React.MouseEvent) => {
        if (!isDrawing) return;
        const ctx = getMaskContext();
        const currentPoint = getMousePos(e);
        if (ctx && lastPointRef.current) {
            ctx.beginPath();
            ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
            ctx.lineTo(currentPoint.x, currentPoint.y);
            ctx.stroke();
        }
        lastPointRef.current = currentPoint;
        syncVisibleCanvas();
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

    const generateSmartMask = async () => {
        if (!smartSelectTarget) return;

        try {
            setIsGenerating(true);
            setGenerationStatus('正在分析物件...');
            const { base64, blob } = await dataUrlToBlob(baseImageSrc);
            
            const target = SMART_SELECT_PROMPT_MAP[smartSelectTarget] || smartSelectTarget;
            const smartPrompt = `Given the input image, create a binary mask image with the same dimensions as the input. The mask must highlight ${target}. The area corresponding to ${target} should be solid white (#FFFFFF), and everything else should be solid black (#000000). Output only the mask image.`;

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image-preview',
                contents: { parts: [
                    { inlineData: { data: base64, mimeType: blob.type } },
                    { text: smartPrompt },
                ]},
                config: { responseModalities: [Modality.IMAGE] }
            });

            const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
            if (!imagePart?.inlineData) throw new Error("AI did not return a mask image.");

            const maskSrc = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
            const maskImg = new Image();
            maskImg.crossOrigin = "anonymous";
            maskImg.onload = () => {
                const maskCtx = getMaskContext();
                if (maskCtx) {
                    maskCtx.globalCompositeOperation = 'source-over';
                    maskCtx.drawImage(maskImg, 0, 0);
                    syncVisibleCanvas();
                    saveHistory();
                }
            };
            maskImg.src = maskSrc;

        } catch (error) {
            console.error("Smart mask generation error:", error);
            alert(`智慧選取失敗: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleCanvasClick = (e: React.MouseEvent) => {
        if (activeTool === 'smart') {
            generateSmartMask();
        }
    }

    const handleGenerateClick = async () => {
        const maskShapeCanvas = maskCanvasRef.current;
        if (!maskShapeCanvas) return;

        setIsGenerating(true);
        setGenerationStatus('生成中...');

        const finalMaskCanvas = document.createElement('canvas');
        finalMaskCanvas.width = maskShapeCanvas.width;
        finalMaskCanvas.height = maskShapeCanvas.height;
        const finalMaskCtx = finalMaskCanvas.getContext('2d');
        if (!finalMaskCtx) {
            setIsGenerating(false);
            return;
        }
        
        finalMaskCtx.fillStyle = 'black';
        finalMaskCtx.fillRect(0, 0, finalMaskCanvas.width, finalMaskCanvas.height);
        finalMaskCtx.drawImage(maskShapeCanvas, 0, 0);

        const maskDataUrl = finalMaskCanvas.toDataURL('image/png');
        const newImageSrc = await onGenerate(element, maskDataUrl, prompt);
        
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
            <div className="relative" style={{ lineHeight: 0 }} onClick={handleCanvasClick}>
                <canvas ref={backgroundCanvasRef} className="rounded-lg bg-slate-800" />
                <canvas 
                    ref={drawingCanvasRef} 
                    className={`absolute top-0 left-0 rounded-lg ${activeTool === 'smart' ? 'cursor-crosshair' : 'cursor-none'}`}
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
                    const displaySize = lineWidth * (rect.width / canvas.width);
                    
                    return (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div 
                                className="border-2 border-dashed border-white/50 rounded-full"
                                style={{ width: displaySize, height: displaySize }}
                            />
                        </div>
                    );
                })()}
                {brushCursorPosition && !showBrushPreview && activeTool !== 'smart' && (()=>{
                    const canvas = drawingCanvasRef.current;
                    if (!canvas) return null;
                    const rect = canvas.getBoundingClientRect();
                    if (rect.width === 0 || rect.height === 0) return null;
                    
                    const displayX = brushCursorPosition.x / (canvas.width / rect.width);
                    const displayY = brushCursorPosition.y / (canvas.height / rect.height);
                    const displayWidth = lineWidth / (canvas.width / rect.width);
                    
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
                         <p className="mt-4 text-md text-white">{generationStatus}</p>
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
                                onClick={() => setBrushColor(colorValue)}
                                className={`w-6 h-6 rounded-full border-2 ${brushColor === colorValue ? 'border-white' : 'border-transparent'}`}
                                style={{ backgroundColor: colorValue }}
                            />
                         ))}
                    </div>
                    <div className="flex items-center gap-1 p-1 bg-slate-800/50 rounded-lg">
                        <button title="筆刷" onClick={() => setActiveTool('brush')} className={`p-2 rounded-lg ${activeTool === 'brush' ? 'bg-cyan-500/30' : 'hover:bg-slate-700'}`}><Brush size={18} /></button>
                        <button title="橡皮擦" onClick={() => setActiveTool('eraser')} className={`p-2 rounded-lg ${activeTool === 'eraser' ? 'bg-cyan-500/30' : 'hover:bg-slate-700'}`}><Eraser size={18} /></button>
                        <button title="智慧選取" onClick={() => setActiveTool('smart')} className={`p-2 rounded-lg ${activeTool === 'smart' ? 'bg-cyan-500/30' : 'hover:bg-slate-700'}`}><Wand2 size={18} /></button>
                        <div className="w-px h-6 bg-slate-700 mx-1" />
                        <button title="復原" onClick={handleUndo} disabled={historyIndex <= 0} className="p-2 rounded-lg hover:bg-slate-700 disabled:opacity-50"><Undo size={18} /></button>
                        <button title="重做" onClick={handleRedo} disabled={historyIndex >= history.length - 1} className="p-2 rounded-lg hover:bg-slate-700 disabled:opacity-50"><Redo size={18} /></button>
                        <button title="清除" onClick={handleClear} className="p-2 rounded-lg hover:bg-slate-700"><Trash2 size={18} /></button>
                    </div>
                 </div>
                 {activeTool === 'smart' && (
                     <div className="flex items-center gap-2 mt-1">
                         <span className="text-sm text-gray-400">智慧選取目標:</span>
                         <select
                            value={smartSelectTarget}
                            onChange={e => setSmartSelectTarget(e.target.value)}
                            className="flex-grow bg-slate-800 p-1.5 rounded-md text-sm text-gray-200 focus:ring-1 focus:ring-[var(--cyber-cyan)] outline-none"
                         >
                            {Object.entries(SMART_SELECT_OPTIONS).map(([group, options]) => (
                                <optgroup label={group} key={group}>
                                    {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </optgroup>
                            ))}
                         </select>
                         <span className='text-xs text-gray-500'>選好目標後，點擊圖片區域進行分析</span>
                     </div>
                 )}
                <div className="flex justify-end gap-2 mt-2">
                    <button onClick={onClose} className="px-4 py-2 bg-slate-700 text-gray-200 rounded-md hover:bg-slate-600">取消</button>
                    <button onClick={handleGenerateClick} disabled={isGenerating} className="px-4 py-2 bg-[var(--cyber-cyan)] text-black font-bold rounded-md hover:bg-cyan-300 flex items-center gap-2">
                        <Wand2 size={16}/>
                        {isGenerating ? '生成中...' : '生成'}
                    </button>
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