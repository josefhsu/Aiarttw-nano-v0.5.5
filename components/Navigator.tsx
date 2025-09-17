import React from 'react';
import type { CanvasElement, Viewport } from '../types';
import { Focus, Maximize } from 'lucide-react';

interface NavigatorProps {
  elements: CanvasElement[];
  viewport: Viewport;
  canvasSize: { width: number; height: number };
  onClick: (x: number, y: number) => void;
}

const NAVIGATOR_SIZE = 200; // px

const NavButton: React.FC<{ title: string, onClick: (e: React.MouseEvent) => void, children: React.ReactNode }> =
  ({ title, onClick, children }) => (
    <button
      title={title}
      onClick={onClick}
      className="p-1.5 bg-slate-800/80 rounded-md text-gray-300 hover:bg-[var(--cyber-cyan)] hover:text-black transition-colors"
    >
      {children}
    </button>
);

// Helper to extract the first color from a gradient string for minimap display
const getDisplayColor = (element: CanvasElement): string => {
    if (element.type !== 'note') {
        return 'rgba(100, 116, 139, 0.5)';
    }

    const color = element.color;
    if (color && color.startsWith('linear-gradient')) {
        // Extracts the first color from 'linear-gradient(angle, color1, color2, ...)'
        const parts = color.split(',');
        if (parts.length > 1) {
            // The first part after the angle is the first color.
            return parts[1].trim(); 
        }
        return '#CCCCCC'; // Fallback for malformed gradients
    }

    return color || 'rgba(100, 116, 139, 0.5)';
};


export const Navigator: React.FC<NavigatorProps> = ({ elements, viewport, canvasSize, onClick }) => {
  const allElements = elements.map(e => ({ ...e, x: e.position.x, y: e.position.y }));

  if (allElements.length === 0) {
    return null; // Don't render navigator if canvas is empty
  }

  const bounds = allElements.reduce(
    (acc, el) => ({
      minX: Math.min(acc.minX, el.x),
      minY: Math.min(acc.minY, el.y),
      maxX: Math.max(acc.maxX, el.x + el.width),
      maxY: Math.max(acc.maxY, el.y + el.height),
    }),
    { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
  );
  
  const contentWidth = bounds.maxX - bounds.minX;
  const contentHeight = bounds.maxY - bounds.minY;
  
  if (contentWidth === 0 || contentHeight === 0) return null;

  const scale = Math.min(NAVIGATOR_SIZE / contentWidth, NAVIGATOR_SIZE / contentHeight);

  if (!isFinite(scale)) return null;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale + bounds.minX - (canvasSize.width / 2 / viewport.zoom);
    const y = (e.clientY - rect.top) / scale + bounds.minY - (canvasSize.height / 2 / viewport.zoom);
    onClick(x, y);
  };
  
  return (
    <div className="absolute bottom-4 right-4 flex flex-col gap-2 items-end">
        <div 
            className="rounded-lg shadow-2xl border border-[var(--cyber-border)] overflow-hidden cursor-pointer"
            style={{ width: NAVIGATOR_SIZE, height: NAVIGATOR_SIZE }}
            onClick={handleClick}
        >
            <div 
                className="relative"
                style={{
                    width: contentWidth * scale,
                    height: contentHeight * scale,
                    transform: `translate(${(NAVIGATOR_SIZE - contentWidth * scale) / 2}px, ${(NAVIGATOR_SIZE - contentHeight * scale) / 2}px)`
                }}
            >
                {elements.map(element => (
                    <div key={element.id}
                        className="absolute"
                        style={{
                            left: (element.position.x - bounds.minX) * scale,
                            top: (element.position.y - bounds.minY) * scale,
                            width: Math.max(1, element.width * scale),
                            height: Math.max(1, element.height * scale),
                            backgroundColor: getDisplayColor(element),
                            border: '1px solid rgba(203, 213, 225, 0.5)',
                            filter: 'saturate(50%)'
                        }}
                    />
                ))}
                <div
                    className="absolute border-2 border-[var(--cyber-cyan)] pointer-events-none"
                    style={{
                        left: (-viewport.pan.x / viewport.zoom - bounds.minX) * scale,
                        top: (-viewport.pan.y / viewport.zoom - bounds.minY) * scale,
                        width: (canvasSize.width / viewport.zoom) * scale,
                        height: (canvasSize.height / viewport.zoom) * scale,
                    }}
                />
            </div>
        </div>
    </div>
  );
};