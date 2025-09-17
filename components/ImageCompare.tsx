import React, { useState, useRef, useCallback } from 'react';
import type { ImageCompareElement } from '../types';
import { ChevronsLeftRight, ImagePlus, Camera, ClipboardPaste } from 'lucide-react';
import { fileToBase64 } from '../utils';

interface ImageCompareProps {
  element: ImageCompareElement;
  onUpdateElements: (updates: { id: string; data: Partial<ImageCompareElement> }[]) => void;
  onTriggerCameraForCompare: (elementId: string, side: 'before' | 'after') => void;
  onTriggerPasteForCompare: (elementId: string, side: 'before' | 'after') => void;
}

const UploadArea: React.FC<{
    title: string;
    onImageSet: (file: File) => void;
    onCameraClick: () => void;
    onPasteClick: () => void;
}> = ({ title, onImageSet, onCameraClick, onPasteClick }) => {
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) onImageSet(file);
    };
    
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
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            onImageSet(file);
        }
    };

    return (
        <div 
            className={`w-full h-full border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-gray-500 transition-colors ${isDraggingOver ? 'border-cyan-400 bg-cyan-900/30' : 'border-gray-600'}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div 
                className="flex-grow flex flex-col items-center justify-center cursor-pointer w-full"
                onClick={() => fileInputRef.current?.click()}
            >
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                <ImagePlus size={24} className="mx-auto mb-2" />
                <p className="text-lg font-semibold">{title}</p>
                <p className="text-base mt-1">拖放或點擊上傳</p>
            </div>
            <div className="flex-shrink-0 flex items-center gap-2 p-2 border-t border-dashed border-gray-600 w-full justify-center">
                <button title="攝像頭" onClick={(e) => { e.stopPropagation(); onCameraClick(); }} className="p-2 hover:bg-slate-700 rounded-lg"><Camera size={18} /></button>
                <button title="貼上" onClick={(e) => { e.stopPropagation(); onPasteClick(); }} className="p-2 hover:bg-slate-700 rounded-lg"><ClipboardPaste size={18} /></button>
            </div>
        </div>
    );
};


export const ImageCompare: React.FC<ImageCompareProps> = ({ element, onUpdateElements, onTriggerCameraForCompare, onTriggerPasteForCompare }) => {
  const [mode, setMode] = useState<'slider' | 'result'>('slider');
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (mode !== 'slider' || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const percent = (x / rect.width) * 100;
    setSliderPosition(percent);
  }, [mode]);
  
  const handleMouseDown = (e: React.MouseEvent) => {
      e.stopPropagation();
  };
  
  const handleImageSet = async (side: 'before' | 'after', file: File) => {
    try {
      const src = `data:${file.type};base64,${await fileToBase64(file)}`;
      const img = new Image();
      img.onload = () => {
        const updates = side === 'before' 
          ? { srcBefore: src, intrinsicWidthBefore: img.width, intrinsicHeightBefore: img.height }
          : { srcAfter: src, intrinsicWidthAfter: img.width, intrinsicHeightAfter: img.height };
        onUpdateElements([{ id: element.id, data: updates }]);
      };
      img.src = src;
    } catch (error) {
      console.error("Failed to load image for comparison:", error);
    }
  };

  const { id, srcBefore, srcAfter } = element;
  const isReady = srcBefore && srcAfter;

  if (!isReady) {
    const hasOneImage = srcBefore || srcAfter;
    return (
        <div className="w-full h-full relative select-none flex flex-col bg-gray-900/50 rounded-lg overflow-hidden border border-gray-700 p-4 gap-4" onMouseDown={handleMouseDown}>
            <p className="text-center text-lg text-gray-300 absolute top-2 left-1/2 -translate-x-1/2">左右各放一張圖來比較</p>
            <div className={`flex-1 flex ${hasOneImage ? 'flex-col' : ''} gap-4 h-full`}>
                <div className={`${hasOneImage ? 'w-full h-1/2' : 'w-1/2 h-full'} flex items-center justify-center`}>
                    {srcBefore ? 
                        <img src={srcBefore} className="max-w-full max-h-full object-contain rounded-md" alt="Before" /> : 
                        <UploadArea 
                            title="放入「之前」的圖片" 
                            onImageSet={(f) => handleImageSet('before', f)} 
                            onCameraClick={() => onTriggerCameraForCompare(id, 'before')}
                            onPasteClick={() => onTriggerPasteForCompare(id, 'before')}
                        />
                    }
                </div>
                <div className={`${hasOneImage ? 'w-full h-1/2' : 'w-1/2 h-full'} flex items-center justify-center`}>
                    {srcAfter ? 
                        <img src={srcAfter} className="max-w-full max-h-full object-contain rounded-md" alt="After" /> : 
                        <UploadArea 
                            title="放入「之後」的圖片" 
                            onImageSet={(f) => handleImageSet('after', f)} 
                            onCameraClick={() => onTriggerCameraForCompare(id, 'after')}
                            onPasteClick={() => onTriggerPasteForCompare(id, 'after')}
                        />
                    }
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="w-full h-full relative select-none flex flex-col bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 bg-black/60 p-1 rounded-full flex text-xs">
        <button
          onClick={(e) => { e.stopPropagation(); setMode('result'); }}
          className={`px-3 py-1 rounded-full ${mode === 'result' ? 'bg-gray-600 text-white' : 'text-gray-300'}`}
        >
          結果
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); setMode('slider'); }}
          className={`px-3 py-1 rounded-full ${mode === 'slider' ? 'bg-orange-500 text-white' : 'text-gray-300'}`}
        >
          滑桿
        </button>
      </div>

      {mode === 'slider' ? (
        <div 
          ref={containerRef} 
          className="relative w-full h-full cursor-ew-resize overflow-hidden" 
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
        >
          {/* After image, clipped on the left side */}
          <div
            className="absolute inset-0"
            style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
          >
            <img
              src={srcAfter}
              alt="After"
              className="absolute top-0 left-0 w-full h-full object-contain pointer-events-none"
              draggable={false}
            />
          </div>
          {/* Before image, clipped on the right side */}
          <div
            className="absolute inset-0"
            style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
          >
            <img
              src={srcBefore}
              alt="Before"
              className="absolute top-0 left-0 w-full h-full object-contain pointer-events-none"
              draggable={false}
            />
          </div>
          {/* Slider handle */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-orange-500 pointer-events-none cursor-ew-resize"
            style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
              <ChevronsLeftRight size={16} className="text-white" />
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full h-full">
            <img
              src={srcAfter}
              alt="Result"
              className="w-full h-full object-contain pointer-events-none"
              draggable={false}
            />
        </div>
      )}
    </div>
  );
};