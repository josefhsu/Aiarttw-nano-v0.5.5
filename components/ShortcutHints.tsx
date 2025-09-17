import React from 'react';

interface Shortcut {
  keys: string;
  desc: string;
  highlight?: boolean;
}

const ShortcutHints: React.FC = () => {
  const shortcuts: Shortcut[] = [
      { keys: 'Tab', desc: '開/關所有面板' },
      { keys: 'N', desc: '新增便籤' },
      { keys: 'A', desc: '新增箭頭' },
      { keys: 'I', desc: '新增圖片' },
      { keys: 'P', desc: '新增空圖層' },
      { keys: 'D', desc: '繪圖' },
      { keys: 'C', desc: '攝像頭' },
      { keys: 'X', desc: '比較物件', highlight: true },
      { keys: 'Alt + I', desc: '靈感提示' },
      { keys: 'Alt + O', desc: '自動優化' },
  ];


  return (
    <div className="absolute top-1/2 right-4 -translate-y-1/2 z-30 p-4 text-gray-300 text-xs font-mono pointer-events-none w-52">
      <h3 className="text-sm font-bold text-[var(--cyber-cyan)] mb-3 text-center" style={{textShadow: '0 0 5px var(--cyber-cyan)'}}>快捷鍵(取消大寫鍵)</h3>
      <ul className="space-y-2">
        {shortcuts.map(({ keys, desc, highlight }) => (
          <li key={desc} className="flex justify-between items-center gap-4 whitespace-nowrap">
            <span 
              className={`text-gray-400 ${highlight ? 'shortcut-highlight-pink font-bold' : ''}`} 
              style={{textShadow: '1px 1px 2px #000'}}
            >
              {desc}
            </span>
            <kbd className="px-2 py-1 text-xs font-semibold text-gray-200 bg-slate-900/50 border border-slate-700 rounded-md">{keys}</kbd>
          </li>
        ))}
      </ul>
    </div>
  );
};

export { ShortcutHints };