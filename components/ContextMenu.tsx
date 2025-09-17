
import React, { useEffect, useRef } from 'react';

export type ContextMenuItem = {
  label: string;
  action: () => void;
  disabled?: boolean;
  type?: 'item';
} | {
  type: 'separator';
};

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, items, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);
  
  const menuStyle: React.CSSProperties = {
    top: y,
    left: x,
    transform: 'translate(5px, 5px)' // Offset a bit from the cursor
  };

  return (
    <div
      ref={menuRef}
      style={menuStyle}
      className="absolute z-50 w-48 bg-slate-900/80 backdrop-blur-md rounded-md shadow-2xl border border-[var(--cyber-border)] py-1"
      onContextMenu={(e) => e.preventDefault()}
    >
      <ul>
        {items.map((item, index) => {
           if (item.type === 'separator') {
            return <li key={`sep-${index}`} className="h-px bg-slate-700 my-1" />;
          }
          return (
            <li key={item.label}>
              <button
                onClick={() => {
                  item.action();
                  onClose();
                }}
                disabled={item.disabled}
                className="w-full text-left px-3 py-1.5 text-sm text-gray-200 hover:bg-cyan-600/50 disabled:text-gray-500 disabled:cursor-not-allowed disabled:hover:bg-transparent"
              >
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
