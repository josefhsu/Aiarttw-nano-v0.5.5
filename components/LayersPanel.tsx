import React from 'react';
import type { CanvasElement, NoteElement, ImageElement, DrawingElement } from '../types';
import { Trash2, Group, Layers, ChevronRight, ChevronLeft } from 'lucide-react';

interface LayersPanelProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  elements: CanvasElement[];
  selectedElementIds: string[];
  onLayerSelect: (elementId: string, event: React.MouseEvent) => void;
  onGroupLayerSelect: (groupId: string) => void;
  lockedGroupIds: Set<string>;
  onDelete: (ids: string[]) => void;
  onReorder: (elementId: string, newIndex: number) => void;
  isAnimationActive: boolean;
  onAnimationToggle: () => void;
  isMusicPlayerVisible: boolean;
  onMusicPlayerToggle: () => void;
}

const LayerThumbnail: React.FC<{ element: CanvasElement }> = ({ element }) => {
    switch (element.type) {
        case 'note': {
            const isGradient = element.color.startsWith('linear-gradient');
            const style: React.CSSProperties = isGradient
              ? { background: element.color }
              : { backgroundColor: element.color };
            return <div className="w-8 h-6 rounded border border-slate-500 flex-shrink-0" style={style} />;
        }
        case 'image':
        case 'drawing':
            return <img src={element.src} alt={element.type} className="w-8 h-6 rounded object-cover border border-slate-500 flex-shrink-0" />;
        case 'arrow':
             return (
                <div className="w-8 h-6 rounded border border-slate-500 flex-shrink-0 flex items-center justify-center">
                    <svg width="20" height="10" viewBox="0 0 20 10" stroke={element.color} strokeWidth="2" fill="none">
                        <path d="M 0 5 L 20 5" />
                        <path d="M 15 0 L 20 5 L 15 10" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            );
        default:
            return <div className="w-8 h-6 rounded border border-slate-500 flex-shrink-0 flex items-center justify-center text-xs">?</div>;
    }
};

export const LayersPanel: React.FC<LayersPanelProps> = ({ isOpen, setIsOpen, elements, selectedElementIds, onLayerSelect, onGroupLayerSelect, lockedGroupIds, onDelete, onReorder, isAnimationActive, onAnimationToggle, isMusicPlayerVisible, onMusicPlayerToggle }) => {
    const sortedElements = [...elements].sort((a, b) => b.zIndex - a.zIndex);
    
    const processedGroupIds = new Set<string>();
    const renderableItems: (CanvasElement | { type: 'group'; groupId: string; elements: CanvasElement[] })[] = [];
    
    sortedElements.forEach(element => {
        if (element.groupId && lockedGroupIds.has(element.groupId)) {
            if (!processedGroupIds.has(element.groupId)) {
                const groupElements = sortedElements.filter(el => el.groupId === element.groupId);
                renderableItems.push({
                    type: 'group',
                    groupId: element.groupId,
                    elements: groupElements
                });
                processedGroupIds.add(element.groupId);
            }
        } else {
            renderableItems.push(element);
        }
    });

    const handleDragStart = (e: React.DragEvent<HTMLLIElement>, id: string) => {
        e.dataTransfer.setData('application/x-birdnest-layer', id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDrop = (e: React.DragEvent, targetIndex: number) => {
        e.preventDefault();
        const draggedId = e.dataTransfer.getData('application/x-birdnest-layer');
        if (draggedId) {
            onReorder(draggedId, targetIndex);
        }
    };

    return (
        <div 
            className={`fixed top-0 right-0 h-screen z-40 flex flex-row-reverse items-start pt-4 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-[calc(100%-3rem)]'}`}
            onMouseLeave={() => setIsOpen(false)}
        >
            <div className="w-64 max-h-[calc(100vh-4rem)] bg-slate-900/80 backdrop-blur-md rounded-lg shadow-2xl border border-[var(--cyber-border)] flex flex-col mr-4">
                <div className="flex justify-between items-center p-3 border-b border-slate-700 flex-shrink-0">
                    <h3 className="text-lg font-bold text-[var(--cyber-cyan)]">圖層</h3>
                     <div className="flex items-center gap-2">
                        <button
                            onClick={onAnimationToggle}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${isAnimationActive ? 'bg-[var(--cyber-cyan)] text-black shadow-[0_0_8px_var(--cyber-glow-cyan)]' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'}`}
                        >
                            動畫
                        </button>
                        <button
                            onClick={onMusicPlayerToggle}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${isMusicPlayerVisible ? 'bg-[var(--cyber-pink)] text-black shadow-[0_0_8px_var(--cyber-glow-pink)]' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'}`}
                        >
                            音樂
                        </button>
                    </div>
                </div>
                <ul 
                    className="overflow-y-auto p-2 space-y-1"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(e, 0)} // Drop on empty space
                >
                    {renderableItems.map((item, index) => {
                        if ('type' in item && item.type === 'group') {
                            const isSelected = item.elements.every(el => selectedElementIds.includes(el.id));
                            return (
                                 <li
                                    key={item.groupId}
                                    onClick={() => onGroupLayerSelect(item.groupId)}
                                    onDrop={(e) => { e.stopPropagation(); handleDrop(e, index); }}
                                    className={`p-2 rounded-md cursor-pointer flex items-center gap-3 text-sm group ${
                                        isSelected ? 'bg-[var(--cyber-pink)]/30 text-white' : 'hover:bg-slate-700/50 text-gray-300'
                                    }`}
                                >
                                    <div className="w-8 h-6 rounded border border-slate-500 flex-shrink-0 flex items-center justify-center">
                                        <Group size={16} className="text-pink-400" />
                                    </div>
                                    <span className="truncate flex-1 font-bold text-pink-400">群組 ({item.elements.length})</span>
                                    <div className="w-5 h-5" />
                                </li>
                            );
                        } else {
                            const element = item as CanvasElement;
                            return (
                                <li
                                    key={element.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, element.id)}
                                    onDrop={(e) => { e.stopPropagation(); handleDrop(e, index); }}
                                    onClick={(e) => onLayerSelect(element.id, e)}
                                    className={`p-2 rounded-md cursor-pointer flex items-center gap-3 text-sm group ${
                                        selectedElementIds.includes(element.id) ? 'bg-[var(--cyber-cyan)]/30 text-white' : 'hover:bg-slate-700/50 text-gray-300'
                                    }`}
                                >
                                    <LayerThumbnail element={element} />
                                    <span className="truncate flex-1">{element.type === 'note' ? element.content : element.type}</span>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onDelete([element.id]); }}
                                        className="w-5 h-5 flex items-center justify-center rounded text-gray-400 hover:bg-rose-600/50 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                       <Trash2 size={14} />
                                    </button>
                                </li>
                            );
                        }
                    })}
                </ul>
            </div>
            <button
                onMouseEnter={() => setIsOpen(true)}
                onClick={() => setIsOpen(false)}
                className="w-12 h-24 bg-slate-900/80 backdrop-blur-md rounded-l-lg border-y border-l border-[var(--cyber-border)] flex flex-col items-center justify-center text-gray-400 hover:text-white transition-colors"
                title="圖層"
            >
                <Layers size={20} className={`transition-transform duration-300 ${isOpen ? 'rotate-12' : ''}`} />
                <span className={`mt-2 text-xs writing-mode-vertical-rl transition-transform duration-300 ${isOpen ? '-rotate-12' : ''}`}>圖層</span>
                {isOpen ? <ChevronRight size={16} className="mt-2" /> : <ChevronLeft size={16} className="mt-2" />}
            </button>
        </div>
    );
};
