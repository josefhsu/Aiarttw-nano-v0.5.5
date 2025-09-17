import React, { useState, useCallback, useEffect } from 'react';
import type { Point } from '../types';

interface CaptureBoxProps {
  onCapture: (box: { x: number; y: number; width: number; height: number }) => void;
  onCancel: () => void;
}

type Action = 'move' | 'resize-tl' | 'resize-tr' | 'resize-bl' | 'resize-br' | null;

const aspectRatios = [
    { value: 0, text: 'Free' },
    { value: 16 / 9, text: '16:9' },
    { value: 9 / 16, text: '9:16' },
    { value: 4 / 3, text: '4:3' },
    { value: 3 / 4, text: '3:4' },
    { value: 1 / 1, text: '1:1' },
];

export const CaptureBox: React.FC<CaptureBoxProps> = ({ onCapture, onCancel }) => {
  const [box, setBox] = useState({
    x: window.innerWidth / 2 - 250,
    y: window.innerHeight / 2 - 150,
    width: 500,
    height: 300,
  });
  const [action, setAction] = useState<Action>(null);
  const [startDrag, setStartDrag] = useState<{ mouseX: number; mouseY: number; box: typeof box } | null>(null);
  const [aspect, setAspect] = useState(aspectRatios[0].value);

  const handleMouseDown = useCallback((e: React.MouseEvent, newAction: Action) => {
    e.stopPropagation();
    e.preventDefault();
    setAction(newAction);
    setStartDrag({ mouseX: e.clientX, mouseY: e.clientY, box });
  }, [box]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!action || !startDrag) return;

    const dx = e.clientX - startDrag.mouseX;
    const dy = e.clientY - startDrag.mouseY;
    let newBox = { ...startDrag.box };

    switch (action) {
      case 'move':
        newBox.x = startDrag.box.x + dx;
        newBox.y = startDrag.box.y + dy;
        break;
      case 'resize-br':
        newBox.width = Math.max(20, startDrag.box.width + dx);
        newBox.height = aspect ? newBox.width / aspect : Math.max(20, startDrag.box.height + dy);
        break;
      case 'resize-bl':
        newBox.width = Math.max(20, startDrag.box.width - dx);
        newBox.x = startDrag.box.x + dx;
        newBox.height = aspect ? newBox.width / aspect : Math.max(20, startDrag.box.height + dy);
        break;
      case 'resize-tr':
        newBox.width = Math.max(20, startDrag.box.width + dx);
        newBox.y = startDrag.box.y + dy;
        newBox.height = aspect ? newBox.width / aspect : Math.max(20, startDrag.box.height - dy);
        if (aspect) newBox.y = startDrag.box.y + (startDrag.box.height - newBox.height);
        break;
      case 'resize-tl':
        newBox.width = Math.max(20, startDrag.box.width - dx);
        newBox.x = startDrag.box.x + dx;
        newBox.y = startDrag.box.y + dy;
        newBox.height = aspect ? newBox.width / aspect : Math.max(20, startDrag.box.height - dy);
        if (aspect) newBox.y = startDrag.box.y + (startDrag.box.height - newBox.height);
        break;
    }
    setBox(newBox);
  }, [action, startDrag, aspect]);

  const handleMouseUp = useCallback(() => {
    setAction(null);
    setStartDrag(null);
  }, []);

  useEffect(() => {
    if (action) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [action, handleMouseMove, handleMouseUp]);
  
  const handleConfirm = () => {
    if (box.width > 10 && box.height > 10) {
      onCapture(box);
    } else {
      onCancel();
    }
  };
  
  const ResizeHandle: React.FC<{position: 'tl'|'tr'|'bl'|'br', onMouseDown: (e: React.MouseEvent) => void}> = ({position, onMouseDown}) => {
    const cursorMap = { tl: 'nwse-resize', tr: 'nesw-resize', bl: 'nesw-resize', br: 'nwse-resize'};
    const posMap = { tl: {top: -5, left: -5}, tr: {top: -5, right: -5}, bl: {bottom: -5, left: -5}, br: {bottom: -5, right: -5}};
    return <div className="absolute w-3 h-3 bg-white border border-[var(--cyber-cyan)] rounded-full" style={{...posMap[position], cursor: cursorMap[position]}} onMouseDown={onMouseDown} />;
  }

  return (
    <div className="absolute inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center">
       <div className="absolute inset-0" onClick={onCancel} />
       <div
          className="absolute border-2 border-dashed border-cyan-400 bg-cyan-400/10 cursor-move"
          style={{ left: box.x, top: box.y, width: box.width, height: box.height }}
          onMouseDown={(e) => handleMouseDown(e, 'move')}
       >
          <ResizeHandle position="tl" onMouseDown={(e) => handleMouseDown(e, 'resize-tl')} />
          <ResizeHandle position="tr" onMouseDown={(e) => handleMouseDown(e, 'resize-tr')} />
          <ResizeHandle position="bl" onMouseDown={(e) => handleMouseDown(e, 'resize-bl')} />
          <ResizeHandle position="br" onMouseDown={(e) => handleMouseDown(e, 'resize-br')} />
       </div>
       <div 
          className="absolute z-60 p-2 bg-slate-900/80 rounded-lg flex items-center gap-2 border border-[var(--cyber-border)]"
          style={{ left: box.x + box.width / 2, top: box.y + box.height + 15, transform: 'translateX(-50%)' }}
       >
          <div className="flex items-center gap-1.5 flex-wrap">
              {aspectRatios.map(ratio => (
                  <button key={ratio.text} onClick={() => setAspect(ratio.value)} className={`px-2 py-0.5 text-xs rounded ${aspect.toFixed(2) === ratio.value.toFixed(2) ? 'bg-[var(--cyber-cyan)] text-black' : 'bg-slate-700 text-gray-300'}`}>
                      {ratio.text}
                  </button>
              ))}
          </div>
          <div className="w-px h-6 bg-slate-700 mx-1" />
          <button onClick={handleConfirm} className="px-3 py-1 bg-cyan-600 text-white rounded hover:bg-cyan-500">確認</button>
          <button onClick={onCancel} className="px-3 py-1 bg-slate-700 text-gray-200 rounded hover:bg-slate-600">取消</button>
       </div>
    </div>
  );
};