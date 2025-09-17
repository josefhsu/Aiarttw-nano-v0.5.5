import React, { useEffect, useRef } from 'react';
import {
    AlignStartHorizontal, AlignCenterHorizontal, AlignEndHorizontal,
    AlignStartVertical, AlignCenterVertical, AlignEndVertical,
    AlignHorizontalSpaceAround, AlignVerticalSpaceAround,
    PanelTop, PanelBottom, PanelLeft, PanelRight, PanelTopClose, PanelLeftClose
} from 'lucide-react';
import type { CanvasElement, Viewport, Point } from '../types';
import { getElementsBounds } from '../utils';

interface AlignmentPopoverProps {
    anchorEl: HTMLDivElement | null;
    onClose: () => void;
    selectedElements: CanvasElement[];
    canvasSize: { width: number; height: number };
    viewport: Viewport;
    screenToCanvas: (point: Point) => Point;
    onUpdateElements: (updates: { id: string; data: Partial<CanvasElement> }[], addToHistory?: boolean) => void;
    onCommitHistory: (updates: { id: string; data: Partial<CanvasElement> }[]) => void;
}

const AlignButton: React.FC<{ title: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }> = ({ title, onClick, disabled, children }) => (
    <button
        title={title}
        onClick={onClick}
        disabled={disabled}
        className="p-2 hover:bg-slate-600 rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
    >
        {children}
    </button>
);

export const AlignmentPopover: React.FC<AlignmentPopoverProps> = ({
    anchorEl, onClose, selectedElements, canvasSize, viewport, screenToCanvas, onUpdateElements, onCommitHistory
}) => {
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                popoverRef.current && !popoverRef.current.contains(event.target as Node) &&
                anchorEl && !anchorEl.contains(event.target as Node)
            ) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose, anchorEl]);

    const getPopoverStyle = (): React.CSSProperties => {
        if (!anchorEl) return { display: 'none' };
        const anchorRect = anchorEl.getBoundingClientRect();
        return {
            position: 'absolute',
            top: anchorRect.top - 16, // Position above the anchor button
            left: anchorRect.left + anchorRect.width / 2,
            transform: 'translate(-50%, -100%)',
            zIndex: 41
        };
    };
    
    const applyUpdates = (updates: { id: string; data: Partial<CanvasElement> }[]) => {
        if (updates.length === 0) return;
        onUpdateElements(updates, false);
        onCommitHistory(updates);
    };

    // --- Object Alignment Logic ---
    const handleAlign = (type: 'left' | 'center-h' | 'right' | 'top' | 'center-v' | 'bottom') => {
        if (selectedElements.length < 2) return;
        const boundsArray = selectedElements.map(el => ({ element: el, bounds: getElementsBounds([el]) }));
        const selectionBounds = getElementsBounds(selectedElements);

        const updates = boundsArray.map(({ element, bounds }) => {
            let dx = 0;
            let dy = 0;
            switch (type) {
                case 'left':    dx = selectionBounds.minX - bounds.minX; break;
                case 'right':   dx = selectionBounds.maxX - bounds.maxX; break;
                case 'center-h':dx = (selectionBounds.minX + (selectionBounds.maxX - selectionBounds.minX) / 2) - (bounds.minX + (bounds.maxX - bounds.minX) / 2); break;
                case 'top':     dy = selectionBounds.minY - bounds.minY; break;
                case 'bottom':  dy = selectionBounds.maxY - bounds.maxY; break;
                case 'center-v':dy = (selectionBounds.minY + (selectionBounds.maxY - selectionBounds.minY) / 2) - (bounds.minY + (bounds.maxY - bounds.minY) / 2); break;
            }
            return { id: element.id, data: { position: { x: element.position.x + dx, y: element.position.y + dy } } };
        });
        applyUpdates(updates);
    };

    // --- Distribution Logic ---
    const handleDistribute = (type: 'horizontal' | 'vertical') => {
        if (selectedElements.length < 3) return;
        const items = selectedElements
            .map(el => ({ element: el, bounds: getElementsBounds([el]) }))
            .map(item => ({ ...item, center: { x: item.bounds.minX + (item.bounds.maxX - item.bounds.minX) / 2, y: item.bounds.minY + (item.bounds.maxY - item.bounds.minY) / 2 } }));

        if (type === 'horizontal') {
            items.sort((a, b) => a.center.x - b.center.x);
            const leftItem = items[0];
            const rightItem = items[items.length - 1];
            const totalRange = rightItem.center.x - leftItem.center.x;
            if (totalRange <= 0) return;
            const spacing = totalRange / (items.length - 1);

            const updates = items.slice(1, -1).map((item, index) => {
                const targetCenterX = leftItem.center.x + (index + 1) * spacing;
                const dx = targetCenterX - item.center.x;
                return { id: item.element.id, data: { position: { x: item.element.position.x + dx, y: item.element.position.y } } };
            });
            applyUpdates(updates);
        } else { // vertical
            items.sort((a, b) => a.center.y - b.center.y);
            const topItem = items[0];
            const bottomItem = items[items.length - 1];
            const totalRange = bottomItem.center.y - topItem.center.y;
            if (totalRange <= 0) return;
            const spacing = totalRange / (items.length - 1);

            const updates = items.slice(1, -1).map((item, index) => {
                const targetCenterY = topItem.center.y + (index + 1) * spacing;
                const dy = targetCenterY - item.center.y;
                return { id: item.element.id, data: { position: { x: item.element.position.x, y: item.element.position.y + dy } } };
            });
            applyUpdates(updates);
        }
    };
    
    // --- Align to Canvas Logic ---
    const handleAlignToCanvas = (type: 'left' | 'center-h' | 'right' | 'top' | 'center-v' | 'bottom') => {
        if (selectedElements.length < 1) return;
        const selectionBounds = getElementsBounds(selectedElements);
        const visibleRect = {
            minX: screenToCanvas({ x: 0, y: 0 }).x,
            minY: screenToCanvas({ x: 0, y: 0 }).y,
            maxX: screenToCanvas({ x: canvasSize.width, y: canvasSize.height }).x,
            maxY: screenToCanvas({ x: canvasSize.width, y: canvasSize.height }).y
        };

        let dx = 0, dy = 0;
        switch (type) {
            case 'left':    dx = visibleRect.minX - selectionBounds.minX; break;
            case 'right':   dx = visibleRect.maxX - selectionBounds.maxX; break;
            case 'center-h':dx = (visibleRect.minX + (visibleRect.maxX - visibleRect.minX) / 2) - (selectionBounds.minX + (selectionBounds.maxX - selectionBounds.minX) / 2); break;
            case 'top':     dy = visibleRect.minY - selectionBounds.minY; break;
            case 'bottom':  dy = visibleRect.maxY - selectionBounds.maxY; break;
            case 'center-v':dy = (visibleRect.minY + (visibleRect.maxY - visibleRect.minY) / 2) - (selectionBounds.minY + (selectionBounds.maxY - selectionBounds.minY) / 2); break;
        }

        const updates = selectedElements.map(el => ({
            id: el.id,
            data: { position: { x: el.position.x + dx, y: el.position.y + dy } }
        }));
        applyUpdates(updates);
    };

    return (
        <div
            ref={popoverRef}
            style={getPopoverStyle()}
            className="bg-slate-800/80 backdrop-blur-md rounded-lg shadow-2xl border border-[var(--cyber-border)] p-2 text-gray-200 flex flex-col gap-2"
            onMouseDown={e => e.stopPropagation()}
        >
            <div className="flex flex-col gap-1">
                <p className="text-xs text-gray-400 px-1">對齊物件</p>
                <div className="flex gap-1">
                    <AlignButton title="靠左對齊" onClick={() => handleAlign('left')} disabled={selectedElements.length < 2}><AlignStartHorizontal size={18} /></AlignButton>
                    <AlignButton title="水平置中" onClick={() => handleAlign('center-h')} disabled={selectedElements.length < 2}><AlignCenterHorizontal size={18} /></AlignButton>
                    <AlignButton title="靠右對齊" onClick={() => handleAlign('right')} disabled={selectedElements.length < 2}><AlignEndHorizontal size={18} /></AlignButton>
                    <div className="w-px bg-slate-600 mx-1" />
                    <AlignButton title="靠上對齊" onClick={() => handleAlign('top')} disabled={selectedElements.length < 2}><AlignStartVertical size={18} /></AlignButton>
                    <AlignButton title="垂直置中" onClick={() => handleAlign('center-v')} disabled={selectedElements.length < 2}><AlignCenterVertical size={18} /></AlignButton>
                    <AlignButton title="靠下對齊" onClick={() => handleAlign('bottom')} disabled={selectedElements.length < 2}><AlignEndVertical size={18} /></AlignButton>
                </div>
            </div>
            <div className="flex flex-col gap-1">
                <p className="text-xs text-gray-400 px-1">均分間距</p>
                <div className="flex gap-1">
                    <AlignButton title="水平均分" onClick={() => handleDistribute('horizontal')} disabled={selectedElements.length < 3}><AlignHorizontalSpaceAround size={18} /></AlignButton>
                    <AlignButton title="垂直均分" onClick={() => handleDistribute('vertical')} disabled={selectedElements.length < 3}><AlignVerticalSpaceAround size={18} /></AlignButton>
                </div>
            </div>
            <div className="flex flex-col gap-1">
                <p className="text-xs text-gray-400 px-1">對齊畫布</p>
                <div className="flex gap-1">
                    <AlignButton title="對齊畫布左側" onClick={() => handleAlignToCanvas('left')}><PanelLeft size={18} /></AlignButton>
                    <AlignButton title="對齊畫布水平中央" onClick={() => handleAlignToCanvas('center-h')}><PanelLeftClose size={18} /></AlignButton>
                    <AlignButton title="對齊畫布右側" onClick={() => handleAlignToCanvas('right')}><PanelRight size={18} /></AlignButton>
                    <div className="w-px bg-slate-600 mx-1" />
                    <AlignButton title="對齊畫布頂部" onClick={() => handleAlignToCanvas('top')}><PanelTop size={18} /></AlignButton>
                    <AlignButton title="對齊畫布垂直中央" onClick={() => handleAlignToCanvas('center-v')}><PanelTopClose size={18} /></AlignButton>
                    <AlignButton title="對齊畫布底部" onClick={() => handleAlignToCanvas('bottom')}><PanelBottom size={18} /></AlignButton>
                </div>
            </div>
        </div>
    );
};
