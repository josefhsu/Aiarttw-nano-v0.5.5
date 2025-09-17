import React, { useState } from 'react';

interface InspirationModalProps {
  suggestions: string[];
  prompts: string[];
  onClose: () => void;
  onApply: (selectedSuggestions: string[], selectedPrompt: string | null) => void;
}

export const InspirationModal: React.FC<InspirationModalProps> = ({ suggestions, prompts, onClose, onApply }) => {
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);

  const handleSuggestionToggle = (suggestion: string) => {
    setSelectedSuggestions(prev =>
      prev.includes(suggestion)
        ? prev.filter(s => s !== suggestion)
        : [...prev, suggestion]
    );
  };
  
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center backdrop-blur-sm" onMouseDown={onClose}>
      <div 
        className="bg-[var(--cyber-bg)] border border-[var(--cyber-border)] p-6 rounded-xl shadow-2xl flex flex-col gap-6 w-full max-w-lg" 
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-[var(--cyber-cyan)]">靈感提示</h2>
        
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          <div>
            <h3 className="text-md font-semibold text-gray-300 mb-2">改圖建議 (可複選):</h3>
            <div className="bg-slate-800/50 p-3 rounded-md text-gray-200 text-sm space-y-3">
              {(suggestions && suggestions.length > 0) ? suggestions.map((s, i) => (
                <label key={i} className="flex items-start gap-3 cursor-pointer p-1 hover:bg-slate-700/50 rounded">
                  <input
                    type="checkbox"
                    checked={selectedSuggestions.includes(s)}
                    onChange={() => handleSuggestionToggle(s)}
                    className="mt-1 w-4 h-4 text-cyan-500 bg-gray-700 border-gray-600 rounded focus:ring-cyan-600 ring-offset-gray-800 shrink-0"
                  />
                  <span>{s}</span>
                </label>
              )) : <p>沒有可用的建議。</p>}
            </div>
          </div>
          <div>
            <h3 className="text-md font-semibold text-gray-300 mb-2">圖片文字提示 (單選):</h3>
            <div className="bg-slate-800/50 p-3 rounded-md text-gray-200 text-sm space-y-3">
              {(prompts && prompts.length > 0) ? prompts.map((p, i) => (
                <label key={i} className="flex items-start gap-3 cursor-pointer p-1 hover:bg-slate-700/50 rounded">
                  <input
                    type="radio"
                    name="prompt-option"
                    checked={selectedPrompt === p}
                    onChange={() => setSelectedPrompt(p)}
                    className="mt-1 w-4 h-4 text-cyan-500 bg-gray-700 border-gray-600 focus:ring-cyan-600 ring-offset-gray-800 shrink-0"
                  />
                  <span>{p}</span>
                </label>
              )) : <p>沒有可用的提示。</p>}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-700">
          <button onClick={onClose} className="px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-500">取消</button>
          <button
            onClick={() => onApply(selectedSuggestions, selectedPrompt)}
            disabled={selectedSuggestions.length === 0 && !selectedPrompt}
            className="px-4 py-2 bg-[var(--cyber-cyan)] text-black font-bold rounded-md hover:bg-cyan-300 disabled:bg-slate-600 disabled:cursor-not-allowed"
          >
            套用
          </button>
        </div>
      </div>
    </div>
  );
};