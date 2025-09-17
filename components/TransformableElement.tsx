
import React, { useRef, useState, useEffect, useCallback } from 'react';
import type { CanvasElement, Point, Viewport, NoteElement, ImageElement, DrawingElement, ArrowElement, PlaceholderElement, ImageCompareElement } from '../types';
import { getElementCenter, rotatePoint, gcd } from '../utils';
import { ImagePlus } from 'lucide-react';
import { ImageCompare } from './ImageCompare';

export type ScreenToCanvasFn = (p: Point) => Point;

interface TransformableElementProps {
    element: CanvasElement;
    elements: CanvasElement[];
    viewport: Viewport;
    isSelected: boolean;
    isDeepSelected: boolean;
    onSelect: (ids: string[], additive?: boolean) => void;
    onUpdateElements: (updates: { id: string, data: Partial<CanvasElement> }[]) => void;
    onCommitHistory: (updates: { id: string, data: Partial<CanvasElement> }[]) => void;
    onAltDragDuplicate: (elementsToCreate: Omit<CanvasElement, 'id' | 'zIndex'>[], revertUpdates: { id: string, data: Partial<CanvasElement> }[]) => void;
    onReplacePlaceholder: (placeholderId: string, file: File) => void;
    onDoubleClick: () => void;
    lockedGroupIds: Set<string>;
    screenToCanvas: ScreenToCanvasFn;
    selectedElementIds: string[];
    onTriggerCameraForCompare: (elementId: string, side: 'before' | 'after') => void;
    onTriggerPasteForCompare: (elementId: string, side: 'before' | 'after') => void;
    onStartAltDrag: (elements: CanvasElement[]) => void;
    onEndAltDrag: () => void;
}

type TransformMode = 'translate' | 'resize' | 'rotate' | 'resize-arrow-start' | 'resize-arrow-end' | null;
type ResizeHandle = 'tl' | 'tr' | 'bl' | 'br';

export const TransformableElement: React.FC<TransformableElementProps> = ({
    element, elements, viewport, isSelected, isDeepSelected, onSelect, onUpdateElements, onCommitHistory, onAltDragDuplicate, onReplacePlaceholder, onDoubleClick, lockedGroupIds, screenToCanvas,
    selectedElementIds, onTriggerCameraForCompare, onTriggerPasteForCompare, onStartAltDrag, onEndAltDrag
}) => {
    const [mode, setMode] = useState<TransformMode>(null);
    const [activeHandle, setActiveHandle] = useState<ResizeHandle | null>(null);
    const startDragDetails = useRef<{
        startMouse: Point;
        startElements: CanvasElement[]; // Store multiple elements for group drag
        startCenter: Point;
        startVector: Point;
        isAltDrag: boolean;
    } | null>(null);

    const isLocked = element.groupId && lockedGroupIds.has(element.groupId);

    const handleMouseDown = (e: React.MouseEvent) => {
        e.stopPropagation();

        if (element.type === 'placeholder' || (element.type === 'imageCompare' && (!element.srcBefore || !element.srcAfter))) {
            onSelect([element.id], e.shiftKey || e.metaKey || e.ctrlKey);
        } else {
             onSelect([element.id], e.shiftKey || e.metaKey || e.ctrlKey);
        }
        
        let elementsToDrag: CanvasElement[];
        
        if (e.altKey && isSelected) {
           elementsToDrag = elements.filter(el => selectedElementIds.includes(el.id));
           onStartAltDrag(elementsToDrag);
        } else if (isLocked && isSelected && !isDeepSelected) {
            elementsToDrag = elements.filter(el => el.groupId === element.groupId);
        } else {
            elementsToDrag = [element];
        }

        startDragDetails.current = {
            startMouse: { x: e.clientX, y: e.clientY },
            startElements: JSON.parse(JSON.stringify(elementsToDrag)), // Deep copy start state
            startCenter: getElementCenter(element), // Placeholder for rotation
            startVector: { x:0, y:0 },
            isAltDrag: e.altKey
        };
       
        setMode('translate');
    };

    const handleTransformMouseDown = (e: React.MouseEvent, handle: ResizeHandle | 'rotate') => {
        e.stopPropagation();
        const center = getElementCenter(element);
        const mousePos = { x: e.clientX, y: e.clientY };

        if (handle === 'rotate') {
            setMode('rotate');
            startDragDetails.current = { startMouse: mousePos, startElements: [element], startCenter: center, startVector: { x: mousePos.x - center.x, y: mousePos.y - center.y }, isAltDrag: false };
        } else {
            setMode('resize');
            setActiveHandle(handle);
            startDragDetails.current = { startMouse: mousePos, startElements: [element], startCenter: center, startVector: { x:0, y:0 }, isAltDrag: false };
        }
    };
    
    const handleArrowTransformMouseDown = (e: React.MouseEvent, handle: 'start' | 'end') => {
        e.stopPropagation();
        setMode(handle === 'start' ? 'resize-arrow-start' : 'resize-arrow-end');
        startDragDetails.current = {
            startMouse: { x: e.clientX, y: e.clientY },
            startElements: [element],
            startCenter: {x:0, y:0}, // Not used
            startVector: {x:0, y:0},
            isAltDrag: false
        };
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!mode || !startDragDetails.current) return;
        
        const { startMouse, startElements } = startDragDetails.current;
        const startElement = startElements[0]; // Primary element for reference
        const mousePos = { x: e.clientX, y: e.clientY };
        
        if (mode === 'translate') {
            const dx = (mousePos.x - startMouse.x) / viewport.zoom;
            const dy = (mousePos.y - startMouse.y) / viewport.zoom;
            const updates = startElements.map(el => ({
                id: el.id,
                data: { position: { x: el.position.x + dx, y: el.position.y + dy } }
            }));
            onUpdateElements(updates);
        } else if (mode === 'resize' && activeHandle) {
             const dx = (mousePos.x - startMouse.x) / viewport.zoom;
             const dy = (mousePos.y - startMouse.y) / viewport.zoom;

            let newWidth = startElement.width;
            let newHeight = startElement.height;
            let newX = startElement.position.x;
            let newY = startElement.position.y;
            
            let maintainAspectRatio = true;
            if (element.type === 'note' || element.type === 'placeholder' || element.type === 'imageCompare') {
                maintainAspectRatio = false;
            }

            const aspectRatio = startElement.width / startElement.height;

            if (activeHandle === 'br') {
                newWidth = startElement.width + dx;
                newHeight = maintainAspectRatio ? newWidth / aspectRatio : startElement.height + dy;
            } else if (activeHandle === 'bl') {
                newWidth = startElement.width - dx;
                newX = startElement.position.x + dx;
                newHeight = maintainAspectRatio ? newWidth / aspectRatio : startElement.height + dy;
            } else if (activeHandle === 'tr') {
                newWidth = startElement.width + dx;
                newHeight = maintainAspectRatio ? newWidth / aspectRatio : startElement.height - dy;
                newY = startElement.position.y + (startElement.height - newHeight);
            } else if (activeHandle === 'tl') {
                newWidth = startElement.width - dx;
                newX = startElement.position.x + dx;
                newHeight = maintainAspectRatio ? newWidth / aspectRatio : startElement.height - dy;
                newY = startElement.position.y + (startElement.height - newHeight);
            }
            
             if (newWidth > 20 && newHeight > 20) {
                onUpdateElements([{ id: element.id, data: { width: newWidth, height: newHeight, position: { x: newX, y: newY } } }]);
             }
        } else if (mode === 'rotate') {
            const { startCenter, startVector } = startDragDetails.current;
            const currentVector = { x: e.clientX - startCenter.x, y: e.clientY - startCenter.y };

            const startAngle = Math.atan2(startVector.y, startVector.x);
            const currentAngle = Math.atan2(currentVector.y, currentVector.x);
            
            const angleDiff = (currentAngle - startAngle) * (180 / Math.PI);
            const newRotation = startElement.rotation + angleDiff;
            
            onUpdateElements([{ id: element.id, data: { rotation: newRotation } }]);
        } else if (mode === 'resize-arrow-start' || mode === 'resize-arrow-end') {
            const mouseCanvasPos = screenToCanvas({ x: e.clientX, y: e.clientY });
            const originalElement = startDragDetails.current.startElements[0] as ArrowElement;
            
            const originalStart = originalElement.position;
            const endVec = { x: originalElement.width, y: 0 };
            const rotEndVec = rotatePoint(endVec, { x: 0, y: 0 }, originalElement.rotation);
            const originalEnd = { x: originalStart.x + rotEndVec.x, y: originalStart.y + rotEndVec.y };
            
            const start = (mode === 'resize-arrow-start') ? mouseCanvasPos : originalStart;
            const end = (mode === 'resize-arrow-end') ? mouseCanvasPos : originalEnd;
            
            const dx = end.x - start.x;
            const dy = end.y - start.y;
            const newWidth = Math.sqrt(dx * dx + dy * dy);
            const newRotation = Math.atan2(dy, dx) * (180 / Math.PI);
            
            onUpdateElements([{ id: element.id, data: { position: start, width: newWidth, rotation: newRotation } }])
        }
    }, [mode, activeHandle, viewport.zoom, element.id, onUpdateElements, screenToCanvas]);

    const handleMouseUp = useCallback(() => {
        if (startDragDetails.current?.isAltDrag) {
            onEndAltDrag();
        }

        if (!mode || !startDragDetails.current) return;

        const { isAltDrag, startElements } = startDragDetails.current;
        
        if (isAltDrag && mode === 'translate') {
            const finalElements = startElements.map(startEl => elements.find(el => el.id === startEl.id)!);
            
            const elementsToCreate = finalElements.map(el => {
                const { id, zIndex, ...rest } = el;
                return rest;
            });

            const revertUpdates = startElements.map(el => ({ 
                id: el.id, 
                data: { position: el.position } 
            }));
            
            onAltDragDuplicate(elementsToCreate, revertUpdates);
            
        } else {
            const finalUpdates = startElements.map(startEl => {
                const finalEl = elements.find(el => el.id === startEl.id);
                const { id, ...data } = finalEl ? finalEl : startEl;
                return { id: startEl.id, data };
            });
            onCommitHistory(finalUpdates as any);
        }

        setMode(null);
        setActiveHandle(null);
        startDragDetails.current = null;
    }, [mode, elements, onCommitHistory, onAltDragDuplicate, onEndAltDrag]);

    useEffect(() => {
        if (mode) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp, { once: true });
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [mode, handleMouseMove, handleMouseUp]);

    const renderElementContent = () => {
        switch (element.type) {
            case 'note': return <NoteContent element={element} onUpdate={onUpdateElements} onCommitHistory={onCommitHistory} isSelected={isSelected} />;
            case 'image': return <ImageContent element={element} />;
            case 'drawing': return <DrawingContent element={element} />;
            case 'arrow': return <ArrowContent element={element} />;
            case 'placeholder': return <PlaceholderContent onImageSet={(file) => onReplacePlaceholder(element.id, file)} />;
            case 'imageCompare': return <ImageCompare 
                element={element}
                onUpdateElements={onUpdateElements}
                onTriggerCameraForCompare={onTriggerCameraForCompare}
                onTriggerPasteForCompare={onTriggerPasteForCompare}
            />;
            default: return null;
        }
    };
    
    const renderAspectRatio = () => {
        if (element.type !== 'image' && element.type !== 'drawing' && element.type !== 'imageCompare') return null;
        if (element.type === 'imageCompare' && (!element.srcBefore || !element.srcAfter)) return null;


        let w: number;
        let h: number;

        if (element.type === 'image') {
            w = element.intrinsicWidth;
            h = element.intrinsicHeight;
        } else if (element.type === 'imageCompare') {
            w = element.intrinsicWidthAfter;
            h = element.intrinsicHeightAfter;
        } else { // drawing
            w = element.width;
            h = element.height;
        }

        if (!w || !h) return null;
        const roundedW = Math.round(w);
        const roundedH = Math.round(h);
        
        const commonDivisor = gcd(roundedW, roundedH);
        const aspectW = roundedW / commonDivisor;
        const aspectH = roundedH / commonDivisor;

        return (
            <div 
                className="absolute bottom-0 right-0 bg-black/60 text-white px-1.5 py-0.5 rounded-tl-md pointer-events-none"
                style={{ 
                    fontSize: Math.max(8, 10 / viewport.zoom),
                    transformOrigin: 'bottom right',
                }}
            >
                {aspectW}:{aspectH}
            </div>
        );
    };

    const resizeHandles: { pos: ResizeHandle, style: React.CSSProperties }[] = [
        { pos: 'tl', style: { top: -5, left: -5, cursor: 'nwse-resize' } },
        { pos: 'tr', style: { top: -5, right: -5, cursor: 'nesw-resize' } },
        { pos: 'br', style: { bottom: -5, right: -5, cursor: 'nwse-resize' } },
        { pos: 'bl', style: { bottom: -5, left: -5, cursor: 'nesw-resize' } },
    ];
    
    const showStandardTransformHandles = isSelected && (!isLocked || isDeepSelected) && element.type !== 'arrow';
    const showArrowTransformHandles = isSelected && (!isLocked || isDeepSelected) && element.type === 'arrow';
    const noteGlowClass = element.type === 'note' ? 'note-glow' : '';

    const elementStyle: React.CSSProperties = {
        left: element.position.x,
        top: element.position.y,
        width: element.width,
        height: element.height,
        transform: `rotate(${element.rotation}deg)`,
        zIndex: element.zIndex,
        cursor: element.type === 'placeholder' || (element.type === 'imageCompare' && (!element.srcBefore || !element.srcAfter))
            ? 'default' 
            : (isLocked && !isDeepSelected) ? 'grab' : isSelected ? 'move' : 'pointer',
        transformOrigin: element.type === 'arrow' ? 'left center' : 'center center',
    };

    if (element.type === 'note') {
        const color = element.color;
        let finalGlowColor = 'var(--cyber-glow-cyan)'; // Default fallback

        if (color.startsWith('#')) {
            const hex = color.substring(1);
            if (hex.length === 6) {
                const r = parseInt(hex.substring(0, 2), 16);
                const g = parseInt(hex.substring(2, 4), 16);
                const b = parseInt(hex.substring(4, 6), 16);
                if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
                    finalGlowColor = `rgba(${r}, ${g}, ${b}, 0.7)`;
                }
            }
        } else if (color.startsWith('var(')) {
            if (color === 'var(--cyber-pink)') {
                finalGlowColor = 'var(--cyber-glow-pink)';
            } else if (color === 'var(--cyber-purple)') {
                finalGlowColor = 'rgba(157, 0, 255, 0.7)';
            }
        } else if (color.startsWith('linear-gradient')) {
            const colorStops = color.match(/#[a-fA-F0-9]{6}/g);
            if (colorStops && colorStops.length > 0) {
                const firstColor = colorStops[0];
                const hex = firstColor.substring(1);
                const r = parseInt(hex.substring(0, 2), 16);
                const g = parseInt(hex.substring(2, 4), 16);
                const b = parseInt(hex.substring(4, 6), 16);
                if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
                    finalGlowColor = `rgba(${r}, ${g}, ${b}, 0.7)`;
                }
            }
        } else if (color === 'transparent') {
            finalGlowColor = 'transparent';
        }
        
        (elementStyle as any)['--element-glow-color'] = finalGlowColor;
    }

    return (
        <div
            className={`absolute ${noteGlowClass}`}
            data-element-id={element.id}
            data-group-id={element.groupId}
            style={elementStyle}
            onMouseDown={ (element.type === 'placeholder' || (element.type === 'imageCompare' && (!element.srcBefore || !element.srcAfter))) ? undefined : handleMouseDown}
            onDoubleClick={onDoubleClick}
        >
            <div className="relative w-full h-full" onMouseDown={(element.type === 'placeholder' || (element.type === 'imageCompare' && (!element.srcBefore || !element.srcAfter))) ? handleMouseDown : undefined}>
                {renderElementContent()}
                {renderAspectRatio()}
            </div>
            {isSelected && (
                <div 
                    className="absolute inset-0 border-2 pointer-events-none"
                    style={{ 
                        borderColor: element.type === 'arrow' ? 'transparent' : (isDeepSelected ? 'var(--cyber-purple)' : isLocked ? 'var(--cyber-pink)' : 'var(--cyber-cyan)'),
                        boxShadow: isDeepSelected ? `0 0 8px var(--cyber-purple)` : 'none',
                        transform: 'translateZ(0)' 
                    }}
                />
            )}
            {showStandardTransformHandles && (
                <>
                  {resizeHandles.map(({ pos, style }) => (
                       <div
                          key={pos}
                          className="absolute w-3 h-3 bg-white border border-[var(--cyber-cyan)] rounded-full"
                          style={style}
                          onMouseDown={(e) => handleTransformMouseDown(e, pos)}
                      />
                  ))}
                  <div
                      className="absolute w-4 h-4 bg-white border border-[var(--cyber-cyan)] rounded-full cursor-alias"
                      style={{ top: -25, left: '50%', transform: 'translateX(-50%)' }}
                      onMouseDown={(e) => handleTransformMouseDown(e, 'rotate')}
                  />
                </>
            )}
            {showArrowTransformHandles && (
                <>
                  <div
                    className="absolute w-4 h-4 bg-white border-2 border-[var(--cyber-cyan)] rounded-full cursor-pointer"
                    style={{ top: '50%', left: 0, transform: 'translate(-50%, -50%)' }}
                    onMouseDown={(e) => handleArrowTransformMouseDown(e, 'start')}
                  />
                  <div
                    className="absolute w-4 h-4 bg-white border-2 border-[var(--cyber-cyan)] rounded-full cursor-pointer"
                    style={{ top: '50%', left: '100%', transform: 'translate(-50%, -50%)' }}
                    onMouseDown={(e) => handleArrowTransformMouseDown(e, 'end')}
                  />
                </>
            )}
        </div>
    );
};

const NoteContent: React.FC<{ element: NoteElement, onUpdate: TransformableElementProps['onUpdateElements'], onCommitHistory: TransformableElementProps['onCommitHistory'], isSelected: boolean }> = ({ element, onUpdate, onCommitHistory, isSelected }) => {
    const [isEditing, setIsEditing] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const startContent = useRef(element.content);

    useEffect(() => {
        if (isEditing) {
            textareaRef.current?.focus();
            textareaRef.current?.select();
        }
    }, [isEditing]);
    
    const handleBlur = () => {
        setIsEditing(false);
        if (element.content !== startContent.current) {
            onCommitHistory([{ id: element.id, data: { content: element.content } }]);
        }
    };
    
    const handleDoubleClick = (e: React.MouseEvent) => {
        if (isSelected) {
            e.stopPropagation();
            setIsEditing(true);
            startContent.current = element.content;
        }
    };

    if (isEditing) {
        return (
            <textarea
                ref={textareaRef}
                value={element.content}
                onChange={(e) => onUpdate([{ id: element.id, data: { content: e.target.value } }])}
                onBlur={handleBlur}
                className="w-full h-full p-4 bg-transparent text-white border-none outline-none resize-none absolute inset-0"
                style={{ 
                    backgroundColor: element.color,
                    fontSize: `${element.fontSize}px`,
                }}
                onMouseDown={(e) => e.stopPropagation()} // Prevent parent drag
            />
        );
    }

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const isGradient = element.color.startsWith('linear-gradient');

    return (
        <div
            className={`w-full h-full p-4 text-white whitespace-pre-wrap overflow-hidden flex items-center justify-center text-center rounded-lg relative ${isGradient ? 'metallic-sheen' : ''}`}
            style={{ 
                background: isGradient ? element.color : undefined,
                backgroundColor: !isGradient ? element.color : undefined,
                border: element.color === 'transparent' ? '1px solid var(--cyber-border)' : undefined,
                fontSize: `${element.fontSize}px`,
                textShadow: `-1px -1px 0 #404040, 1px -1px 0 #404040, -1px 1px 0 #404040, 1px 1px 0 #404040`,
             }}
            onDoubleClick={handleDoubleClick}
        >
            {element.content.split(urlRegex).map((part, index) => {
                if (part.match(urlRegex)) {
                    return (
                        <a
                            key={`link-${index}`}
                            href={part}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-300 hover:underline"
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {part}
                        </a>
                    );
                }
                return <React.Fragment key={`text-${index}`}>{part}</React.Fragment>;
            })}
        </div>
    );
};

const PlaceholderContent: React.FC<{ onImageSet: (file: File) => void }> = ({ onImageSet }) => {
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingOver(false);
        if (e.dataTransfer.files?.length) {
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                onImageSet(file);
            }
        }
    };
    
    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onImageSet(file);
        }
    };

    return (
        <div 
            className={`w-full h-full border-2 border-dashed rounded-lg flex items-center justify-center text-gray-500 transition-colors cursor-pointer ${isDraggingOver ? 'border-cyan-400 bg-cyan-900/30' : 'border-gray-600 hover:border-gray-400'}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
            onMouseDown={(e) => e.stopPropagation()}
        >
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange}
            />
            <div className="text-center pointer-events-none p-2">
                <ImagePlus size={32} className="mx-auto mb-2" />
                <p className="font-semibold">空圖層</p>
                <p className="text-xs mt-1">拖放圖片至此或點擊上傳</p>
            </div>
        </div>
    );
};

const ImageContent: React.FC<{ element: ImageElement }> = ({ element }) => ( <img src={element.src} alt="canvas element" className="w-full h-full object-cover select-none pointer-events-none" draggable={false} /> );
const DrawingContent: React.FC<{ element: DrawingElement }> = ({ element }) => ( <img src={element.src} alt="drawing" className="w-full h-full object-contain select-none pointer-events-none" draggable={false} /> );
const ArrowContent: React.FC<{ element: ArrowElement }> = ({ element }) => {
    const arrowheadSize = Math.min(10, element.strokeWidth * 2.5);
    return (
        <svg width="100%" height="100%" viewBox={`0 0 ${element.width} ${element.height}`} preserveAspectRatio="none" className="overflow-visible">
            <defs>
                <marker 
                    id={`arrowhead-${element.id}`} 
                    markerWidth={arrowheadSize} 
                    markerHeight={arrowheadSize * 0.7} 
                    refX="0" 
                    refY={arrowheadSize * 0.35} 
                    orient="auto"
                >
                    <polygon points={`0 0, ${arrowheadSize} ${arrowheadSize*0.35}, 0 ${arrowheadSize*0.7}`} fill={element.color} />
                </marker>
            </defs>
            <line 
                x1={element.strokeWidth / 2} 
                y1={element.height / 2} 
                x2={element.width - arrowheadSize} 
                y2={element.height / 2} 
                stroke={element.color} 
                strokeWidth={element.strokeWidth} 
                strokeLinecap="round"
                markerEnd={`url(#arrowhead-${element.id})`}
            />
        </svg>
    )
};
