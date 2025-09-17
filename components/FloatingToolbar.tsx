

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Trash2, Copy, Crop, Edit, Wand2, Lightbulb, ArrowUpToLine, ArrowDownToLine, Group, Lock, Unlock, Minus, Plus, Sparkles, Download, Expand, Camera, ClipboardPaste, Eraser, ClipboardCopy, GitCompare, AlignHorizontalSpaceAround, Unlink } from 'lucide-react';
import { AdvancedColorPicker } from './ColorPicker';
import type { CanvasElement, NoteElement, ImageElement, DrawingElement, Viewport, ArrowElement, Point } from '../types';
import { getElementsBounds } from '../utils';
import { ART_STYLES, ASPECT_RATIO_OPTIONS } from '../constants';

interface IconButtonProps {
  title: string;
  onClick: (e: React.MouseEvent) => void;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

interface FloatingToolbarProps {
  elements: CanvasElement[];
  selectedElements: CanvasElement[];
  viewport: Viewport;
  prompts: Record<string, string>;
  onPromptsChange: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  aspectRatios: Record<string, number | null>;
  onAspectRatiosChange: React.Dispatch<React.SetStateAction<Record<string, string | number | null>>>;
  artStyles: Record<string, string>;
  onArtStylesChange: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onDelete: () => void;
  onDuplicate: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onUpdateElements: (updates: { id: string, data: Partial<CanvasElement> }[], addToHistory?: boolean) => void;
  onCommitHistory: (updates: { id: string, data: Partial<CanvasElement> }[]) => void;
  onCrop: () => void;
  onEditDrawing: () => void;
  onDownload: (elementId: string) => void;
  onAIGenerate: (elementId: string) => void;
  onAIZoomOut: (elementId: string) => void;
  onAIGroupGenerate: (groupId: string) => void;
  onRequestInspiration: (elementId: string) => void;
  onRequestGroupInspiration: (groupId: string) => void;
  onOptimizeGroupPrompt: (groupId: string) => void;
  onOptimizeSingleElementPrompt: (elementId: string) => void;
  onNoteInspiration: (noteId: string) => void;
  onNoteOptimization: (noteId: string) => void;
  onNoteGenerate: (noteId: string) => void;
  onCreateComparison: (groupId: string) => void;
  onConvertToComparison: (elementId: string) => void;
  onUnpackComparison: (elementId: string) => void;
  isGenerating: boolean;
  onStartConnection: (elementId: string, portSide: 'left' | 'right') => void;
  onToggleGroupLock: (groupId?: string) => void;
  lockedGroupIds: Set<string>;
  onClearConnections: (elementId: string) => void;
  onFillPlaceholderFromCamera: (placeholderId: string) => void;
  onFillPlaceholderFromPaste: (placeholderId: string) => void;
}

const IconButton: React.FC<IconButtonProps> = 
  ({ title, onClick, children, disabled, className = '' }) => (
    <button title={title} onClick={onClick} disabled={disabled} className={`p-2 hover:bg-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed ${className}`}>
      {children}
    </button>
);

export const FloatingToolbar: React.FC<FloatingToolbarProps> = ({ 
    elements, selectedElements, viewport, prompts, onPromptsChange, aspectRatios, onAspectRatiosChange, artStyles, onArtStylesChange, onDelete, onDuplicate, onBringToFront, onSendToBack, onUpdateElements, onCommitHistory, onCrop, onEditDrawing, onDownload, onAIGenerate, onAIZoomOut, onAIGroupGenerate, onRequestInspiration, onRequestGroupInspiration, onOptimizeGroupPrompt, onOptimizeSingleElementPrompt, onNoteInspiration, onNoteOptimization, onNoteGenerate, onCreateComparison, onConvertToComparison, onUnpackComparison, isGenerating, onStartConnection, onToggleGroupLock, lockedGroupIds, onClearConnections, onFillPlaceholderFromCamera, onFillPlaceholderFromPaste
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [manualTextareaHeight, setManualTextareaHeight] = useState<number | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  
  const [isDragging, setIsDragging] = useState(false);
  const dragStartDetails = useRef<{
      startMouse: { x: number; y: number };
      startElements: CanvasElement[];
  } | null>(null);

  const isSingleSelection = selectedElements.length === 1;
  const element = isSingleSelection ? selectedElements[0] : null;
  const isGroup = selectedElements.length > 1;
  const groupId = isGroup ? selectedElements[0].groupId : (element?.groupId);
  const isLocked = groupId ? lockedGroupIds.has(groupId) : false;

  const currentId = isSingleSelection ? element?.id : (isLocked ? groupId : undefined);
  const activePrompt = currentId ? prompts[currentId] || '' : '';
  const activeAspectRatio = currentId ? aspectRatios[currentId] : null;
  const activeStyle = currentId ? artStyles[currentId] || ART_STYLES[0] : ART_STYLES[0];

  useEffect(() => {
    if (textareaRef.current && manualTextareaHeight === null) {
        textareaRef.current.style.height = 'auto'; // Reset height
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [activePrompt, manualTextareaHeight]);

  const handleTextareaResize = useCallback((e: React.MouseEvent) => {
      if (!textareaRef.current) return;
      e.preventDefault();
      const startHeight = textareaRef.current.offsetHeight;
      const startY = e.clientY;

      const doDrag = (moveEvent: MouseEvent) => {
          const newHeight = startHeight + (moveEvent.clientY - startY);
          if (newHeight > 38) { // Min height
              setManualTextareaHeight(newHeight);
          }
      };

      const stopDrag = () => {
          window.removeEventListener('mousemove', doDrag);
          window.removeEventListener('mouseup', stopDrag);
      };

      window.addEventListener('mousemove', doDrag);
      window.addEventListener('mouseup', stopDrag, { once: true });
  }, []);

  const handleCopyPrompt = useCallback(() => {
    if (!activePrompt) return;
    navigator.clipboard.writeText(activePrompt).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 1500);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
  }, [activePrompt]);
  
  const handleDragMouseDown = (e: React.MouseEvent) => {
      if (e.target !== e.currentTarget) return; // Only drag on background
      e.stopPropagation();
      dragStartDetails.current = {
          startMouse: { x: e.clientX, y: e.clientY },
          startElements: JSON.parse(JSON.stringify(selectedElements)),
      };
      setIsDragging(true);
  };

  useEffect(() => {
      const handleMouseMove = (e: MouseEvent) => {
          if (!isDragging || !dragStartDetails.current) return;

          const { startMouse, startElements } = dragStartDetails.current;
          const dx = (e.clientX - startMouse.x) / viewport.zoom;
          const dy = (e.clientY - startMouse.y) / viewport.zoom;

          const updates = startElements.map(el => ({
              id: el.id,
              data: { position: { x: el.position.x + dx, y: el.position.y + dy } }
          }));
          onUpdateElements(updates, false);
      };

      const handleMouseUp = () => {
          if (!isDragging || !dragStartDetails.current) return;

          const { startElements } = dragStartDetails.current;
          const finalUpdates = startElements.map(startEl => {
              const finalEl = elements.find(el => el.id === startEl.id);
              const { id, ...data } = finalEl || startEl;
              return { id: startEl.id, data };
          });
          onCommitHistory(finalUpdates as any);

          setIsDragging(false);
          dragStartDetails.current = null;
      };

      if (isDragging) {
          window.addEventListener('mousemove', handleMouseMove);
          window.addEventListener('mouseup', handleMouseUp, { once: true });
      }

      return () => {
          window.removeEventListener('mousemove', handleMouseMove);
          window.removeEventListener('mouseup', handleMouseUp);
      };
  }, [isDragging, viewport.zoom, onUpdateElements, onCommitHistory, elements]);

  if (selectedElements.length === 0) return null;

  const isNote = element?.type === 'note';
  const isImage = element?.type === 'image';
  const isDrawing = element?.type === 'drawing';
  const isArrow = element?.type === 'arrow';
  const isPlaceholder = element?.type === 'placeholder';
  const isImageCompare = element?.type === 'imageCompare';
  const canEditAI = isImage || isDrawing;
  
  const getBoundsStyle = (): React.CSSProperties => {
    const bounds = getElementsBounds(selectedElements);
    const boundsWidth = bounds.maxX - bounds.minX;
    
    const canvasBottomCenterX = bounds.minX + boundsWidth / 2;
    const canvasBottomY = bounds.maxY + 20 / viewport.zoom;

    const screenX = canvasBottomCenterX * viewport.zoom + viewport.pan.x;
    const screenY = canvasBottomY * viewport.zoom + viewport.pan.y;

    return {
      position: 'absolute',
      top: screenY,
      left: screenX,
      transform: 'translateX(-50%)',
      minWidth: 300,
      transformOrigin: 'top center',
      cursor: isDragging ? 'grabbing' : 'grab',
    };
  };

  const handleGenerate = () => {
    if (isGenerating) return;
    if (isLocked && groupId) {
        onAIGroupGenerate(groupId);
    } else if (canEditAI && element) {
      onAIGenerate(element.id);
    }
  }

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (currentId) {
          onPromptsChange(p => ({ ...p, [currentId]: e.target.value }));
      }
  };

  const handleAspectRatioChange = (aspect: number | null) => {
      if (currentId) {
          onAspectRatiosChange(a => ({ ...a, [currentId]: aspect }));
      }
  };

  const handleStyleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (currentId) {
          onArtStylesChange(a => ({ ...a, [currentId]: e.target.value }));
      }
  };

  const applyUpdates = (updates: { id: string; data: Partial<CanvasElement> }[]) => {
      if (updates.length === 0) return;
      onUpdateElements(updates, false);
      onCommitHistory(updates);
  };
  
  const handleHorizontalSpread = () => {
      if (selectedElements.length < 2) return;
  
      const spacing = 10 / viewport.zoom;
  
      const items = selectedElements
          .map(element => ({ element, bounds: getElementsBounds([element]) }))
          .sort((a, b) => a.bounds.minX - b.bounds.minX);
  
      const selectionBounds = getElementsBounds(selectedElements);
      const verticalCenter = selectionBounds.minY + (selectionBounds.maxY - selectionBounds.minY) / 2;
  
      const totalWidth = items.reduce((sum, item) => sum + (item.bounds.maxX - item.bounds.minX), 0) + (items.length - 1) * spacing;
      
      let currentX = selectionBounds.minX + (selectionBounds.maxX - selectionBounds.minX) / 2 - totalWidth / 2;
  
      const updates: { id: string; data: Partial<CanvasElement> }[] = [];
  
      for (const item of items) {
          const itemWidth = item.bounds.maxX - item.bounds.minX;
          const itemHeight = item.bounds.maxY - item.bounds.minY;
  
          const newMinX = currentX;
          const newMinY = verticalCenter - (itemHeight / 2);
  
          const dx = newMinX - item.bounds.minX;
          const dy = newMinY - item.bounds.minY;
  
          updates.push({
              id: item.element.id,
              data: {
                  position: {
                      x: item.element.position.x + dx,
                      y: item.element.position.y + dy,
                  }
              }
          });
  
          currentX += itemWidth + spacing;
      }
  
      applyUpdates(updates);
  };

  const renderContent = () => {
    if (isGroup && !isLocked) {
        return (
            <div className="flex items-center gap-2 justify-center">
                <IconButton title="水平攤開" onClick={handleHorizontalSpread} disabled={selectedElements.length < 2}><AlignHorizontalSpaceAround size={18} /></IconButton>
                <div className="w-px h-6 bg-slate-700 mx-1" />
                <IconButton title="移到最前 (Cmd/Ctrl+])" onClick={onBringToFront}><ArrowUpToLine size={18} /></IconButton>
                <IconButton title="移到最後 (Cmd/Ctrl+[)" onClick={onSendToBack}><ArrowDownToLine size={18} /></IconButton>
                <IconButton title="複製 (Cmd/Ctrl+D)" onClick={onDuplicate}><Copy size={18} /></IconButton>
                <IconButton title="刪除 (Delete)" onClick={onDelete}><Trash2 size={18} /></IconButton>
                <div className="w-px h-6 bg-slate-700 mx-1" />
                <div className="flex items-center gap-2 text-xs text-gray-400 mr-2"><Group size={16}/>群組 ({selectedElements.length})</div>
                <IconButton title="鎖定群組" onClick={() => onToggleGroupLock()} className="lock-icon-glow"><Lock size={18} /></IconButton>
                <span className="text-xs text-cyan-400 animate-pulse">鎖定才能群組生成</span>
            </div>
        );
    }
    
    if (isPlaceholder && element) {
        return (
            <div className="flex items-center gap-2 justify-center">
                <span className="text-sm text-gray-400">填入圖片來源:</span>
                <IconButton title="使用攝像頭" onClick={() => onFillPlaceholderFromCamera(element.id)}>
                    <Camera size={18} />
                </IconButton>
                <IconButton title="從剪貼簿貼上" onClick={() => onFillPlaceholderFromPaste(element.id)}>
                    <ClipboardPaste size={18} />
                </IconButton>
                <div className="w-px h-6 bg-slate-700 mx-1" />
                <IconButton title="刪除 (Delete)" onClick={onDelete}><Trash2 size={18} /></IconButton>
            </div>
        );
    }

    const imageElementsInGroup = selectedElements.filter(el => el.type === 'image' || el.type === 'drawing');
    const canCompare = isLocked && imageElementsInGroup.length === 2;
    const showPorts = isSingleSelection && element && !isArrow && !isPlaceholder;

    return (
        <div className="w-full flex flex-col gap-2">
            <div className="relative flex items-center justify-between px-6">
                {showPorts && <div className="node-port" style={{ left: -8 }} title="連接點 (連點兩下清除連接)" onMouseDown={(e) => { e.stopPropagation(); element && onStartConnection(element.id, 'left'); }} onDoubleClick={(e) => { e.stopPropagation(); element && onClearConnections(element.id); }} />}
                
                <div className="flex items-center gap-1">
                    {selectedElements.length > 1 && <IconButton title="水平攤開" onClick={handleHorizontalSpread}><AlignHorizontalSpaceAround size={18} /></IconButton>}
                    <div className="w-px h-6 bg-slate-700 mx-1" />
                    <IconButton title="移到最前 (Cmd/Ctrl+])" onClick={onBringToFront}><ArrowUpToLine size={18} /></IconButton>
                    <IconButton title="移到最後 (Cmd/Ctrl+[)" onClick={onSendToBack}><ArrowDownToLine size={18} /></IconButton>
                    <IconButton title="複製 (Cmd/Ctrl+D)" onClick={onDuplicate}><Copy size={18} /></IconButton>
                    <IconButton title="刪除 (Delete)" onClick={onDelete}><Trash2 size={18} /></IconButton>
                    {isGroup && isLocked && <div className="w-px h-6 bg-slate-700 mx-1" />}
                    {isGroup && isLocked && <div className="flex items-center gap-2 text-xs text-pink-400"><Lock size={16}/>已鎖定群組</div>}
                </div>
                
                <div className="flex items-center gap-1">
                    {isGroup && isLocked && <IconButton title="解鎖群組" onClick={() => onToggleGroupLock(groupId)}><Unlock size={18} /></IconButton>}
                    {(isImage || isDrawing) && <IconButton title="下載" onClick={() => element && onDownload(element.id)}><Download size={18} /></IconButton>}
                    {(isImage || isDrawing) && <IconButton title="建立比較" onClick={() => element && onConvertToComparison(element.id)}><GitCompare size={18} /></IconButton>}
                    {isImageCompare && <IconButton title="解開比較" onClick={() => element && onUnpackComparison(element.id)}><Unlink size={18} /></IconButton>}
                    {(isImage || isDrawing) && <IconButton title="AI 擴展 (Zoom Out)" onClick={() => element && onAIZoomOut(element.id)}><Expand size={18} /></IconButton>}
                    {isImage && <IconButton title="裁切 (Alt+C)" onClick={onCrop}><Crop size={18} /></IconButton>}
                    {isDrawing && <IconButton title="編輯繪圖 (Alt+E)" onClick={onEditDrawing}><Edit size={18} /></IconButton>}
                    {canCompare && (
                      <div className="flex items-center gap-1 p-1 rounded-md compare-feature-glow ml-2">
                          <span className="text-xs font-bold pl-1">比較圖片</span>
                          <IconButton title="建立比較" onClick={() => groupId && onCreateComparison(groupId)} className="!p-1">
                              <GitCompare size={18} />
                          </IconButton>
                      </div>
                    )}
                </div>

                {showPorts && <div className="node-port" style={{ right: -8 }} title="連接點 (連點兩下清除連接)" onMouseDown={(e) => { e.stopPropagation(); element && onStartConnection(element.id, 'right'); }} onDoubleClick={(e) => { e.stopPropagation(); element && onClearConnections(element.id); }} />}
            </div>

            {(isArrow && element) && (
                <>
                    <div className="h-px bg-slate-700 mx-2" />
                    <div className="px-4 flex items-center justify-center gap-4 py-2">
                        <AdvancedColorPicker selectedColor={element.color} onColorChange={(color) => onUpdateElements([{ id: element.id, data: { color } }])} />
                        <div className="flex items-center gap-2 text-sm text-gray-300 flex-grow" style={{ minWidth: 150 }}>
                            <span>粗細</span>
                            <input type="range" min="1" max="50" value={element.strokeWidth}
                                   onChange={e => onUpdateElements([{ id: element.id, data: { strokeWidth: parseInt(e.target.value) } }])}
                                   className="w-full"
                            />
                        </div>
                    </div>
                </>
            )}

            {isNote && element && (
                 <>
                    <div className="h-px bg-slate-700 mx-2" />
                    <div className="flex flex-col items-stretch gap-2 p-2">
                        <div className="flex items-center justify-center">
                            <AdvancedColorPicker selectedColor={element.color} onColorChange={(color) => onUpdateElements([{ id: element.id, data: { color } }])} />
                        </div>
                        <div className="flex items-center flex-wrap justify-center gap-x-4 gap-y-2">
                            <div className="flex items-center gap-2">
                                {ASPECT_RATIO_OPTIONS.map(opt => (
                                    <button key={opt.text}
                                        onClick={() => handleAspectRatioChange(activeAspectRatio === opt.value ? null : opt.value)}
                                        className={`px-2 py-1 text-xs rounded-md ${activeAspectRatio === opt.value ? 'bg-[var(--cyber-cyan)] text-black font-bold' : 'bg-slate-800 text-gray-300 hover:bg-slate-700'}`}
                                    >
                                        {opt.text}
                                    </button>
                                ))}
                            </div>

                             <div className="flex items-center gap-2 text-sm text-gray-300">
                                <IconButton title="縮小字體" onClick={() => onUpdateElements([{ id: element.id, data: { fontSize: Math.max(8, (element as NoteElement).fontSize - 2) } }])}><Minus size={16} /></IconButton>
                                <span>{(element as NoteElement).fontSize}px</span>
                                <IconButton title="放大字體" onClick={() => onUpdateElements([{ id: element.id, data: { fontSize: Math.min(128, (element as NoteElement).fontSize + 2) } }])}><Plus size={16} /></IconButton>
                            </div>
                        </div>
                         <select
                            value={activeStyle}
                            onChange={handleStyleChange}
                            title={activeStyle}
                            className="flex-grow bg-slate-800 p-1.5 rounded-md text-sm text-gray-200 focus:ring-1 focus:ring-[var(--cyber-cyan)] outline-none min-w-0 mt-2"
                        >
                            {ART_STYLES.map(style => (
                                <option key={style} value={style}>{style}</option>
                            ))}
                        </select>
                        <div className="flex items-center gap-2 pt-2 mt-2 border-t border-slate-700/50">
                            <IconButton title="靈感提示 (Alt+I)" onClick={() => onNoteInspiration(element.id)}><Lightbulb size={18}/></IconButton>
                            <IconButton title="自動優化 (Alt+O)" onClick={() => onNoteOptimization(element.id)}><Sparkles size={18}/></IconButton>
                            <button 
                                onClick={() => onNoteGenerate(element.id)}
                                disabled={isGenerating}
                                title="從便籤內容生成圖片"
                                className="flex-grow flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[var(--cyber-cyan)] text-black font-bold rounded-md text-sm hover:bg-cyan-300 disabled:bg-slate-600 disabled:cursor-not-allowed"
                            >
                                <Wand2 size={14} />
                                {isGenerating ? '生成中...' : '生成'}
                            </button>
                        </div>
                    </div>
                </>
            )}

            {(canEditAI || (isGroup && isLocked)) && (
                <>
                    <div className="h-px bg-slate-700 mx-2" />
                    <div className="flex flex-col gap-2 p-2">
                        <div className="flex items-center justify-center gap-2">
                            {ASPECT_RATIO_OPTIONS.map(opt => (
                                <button key={opt.text}
                                    onClick={() => handleAspectRatioChange(activeAspectRatio === opt.value ? null : opt.value)}
                                    className={`px-3 py-1 text-xs rounded-md ${activeAspectRatio === opt.value ? 'bg-[var(--cyber-cyan)] text-black font-bold' : 'bg-slate-800 text-gray-300 hover:bg-slate-700'}`}
                                >
                                    {opt.text}
                                </button>
                            ))}
                        </div>

                        <div className="flex flex-col">
                            <div className="flex items-start gap-2">
                                <textarea 
                                    ref={textareaRef}
                                    placeholder="描述提示..."
                                    value={activePrompt}
                                    onChange={handlePromptChange}
                                    onClick={(e) => { if (e.detail === 3) { handleCopyPrompt(); } }}
                                    className={`flex-grow bg-slate-800/50 p-2 rounded-md text-sm placeholder-gray-400 outline-none resize-y transition-all duration-300 ${isCopied ? 'ring-2 ring-green-500' : 'focus:ring-2 focus:ring-[var(--cyber-cyan)]'}`}
                                    rows={3}
                                    style={{ height: manualTextareaHeight ? `${manualTextareaHeight}px` : undefined, overflowY: 'auto' }}
                                />
                                <div className="flex flex-col">
                                    {element && canEditAI && (
                                        <>
                                            <IconButton title="靈感提示 (Alt+I)" onClick={() => onRequestInspiration(element.id)}><Lightbulb size={18}/></IconButton>
                                            <IconButton title="優化提示 (Alt+O)" onClick={() => onOptimizeSingleElementPrompt(element.id)}><Sparkles size={18}/></IconButton>
                                            <IconButton title="拷貝提示" onClick={handleCopyPrompt}><ClipboardCopy size={18} /></IconButton>
                                            <IconButton title="清除提示" onClick={() => element && onPromptsChange(p => ({...p, [element.id]: ''}))}><Eraser size={18} /></IconButton>
                                        </>
                                    )}
                                    {isGroup && isLocked && groupId && (
                                        <>
                                         <IconButton title="群組靈感提示 (Alt+I)" onClick={() => onRequestGroupInspiration(groupId)}><Lightbulb size={18}/></IconButton>
                                         <IconButton title="優化提示 (Alt+O)" onClick={() => onOptimizeGroupPrompt(groupId)}><Sparkles size={18}/></IconButton>
                                         <IconButton title="拷貝提示" onClick={handleCopyPrompt}><ClipboardCopy size={18} /></IconButton>
                                         <IconButton title="清除提示" onClick={() => groupId && onPromptsChange(p => ({...p, [groupId]: ''}))}><Eraser size={18} /></IconButton>
                                        </>
                                    )}
                                </div>
                            </div>
                             <div
                                onMouseDown={handleTextareaResize}
                                onDoubleClick={() => setManualTextareaHeight(null)}
                                title="拖曳以調整大小 (雙擊重設)"
                                className="h-2.5 cursor-ns-resize flex items-center justify-center group w-full"
                            >
                                <div className="w-8 h-1 bg-slate-600 rounded-full group-hover:bg-cyan-400 transition-colors" />
                            </div>
                        </div>
                        <select
                            value={activeStyle}
                            onChange={handleStyleChange}
                            className="w-full bg-slate-800 p-1.5 rounded-md text-sm text-gray-200 focus:ring-1 focus:ring-[var(--cyber-cyan)] outline-none"
                        >
                            {ART_STYLES.map(style => (
                                <option key={style} value={style}>{style}</option>
                            ))}
                        </select>
                        <button 
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="w-full flex items-center justify-center gap-2 mt-1 px-4 py-2 bg-[var(--cyber-cyan)] text-black font-bold rounded-md hover:bg-cyan-300 disabled:bg-slate-600 disabled:cursor-not-allowed"
                        >
                            <Wand2 size={16} />
                            {isGenerating ? '生成中...' : '生成'}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
  }

  return (
    <div 
        className="absolute z-40 bg-slate-900/80 backdrop-blur-md rounded-xl shadow-2xl border border-[var(--cyber-border)] p-2 flex flex-col gap-2"
        style={getBoundsStyle()}
        onMouseDown={handleDragMouseDown}
    >
      {renderContent()}
    </div>
  );
};