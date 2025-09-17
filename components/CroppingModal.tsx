import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import type { Point, Area } from 'react-easy-crop';
import { getCroppedImg } from '../utils';
import type { ImageElement, DrawingElement } from '../types';

interface CroppingModalProps {
  element: ImageElement | DrawingElement;
  onClose: () => void;
  onSave: (src: string, width: number, height: number) => void;
}

const aspectRatios = [
    { value: 0, text: 'Free' },
    { value: 1 / 1, text: '1:1' },
    { value: 16 / 9, text: '16:9' },
    { value: 9 / 16, text: '9:16' },
    { value: 4 / 3, text: '4:3' },
    { value: 3 / 4, text: '3:4' },
    { value: 3 / 2, text: '3:2' },
    { value: 2 / 3, text: '2:3' },
];

export const CroppingModal: React.FC<CroppingModalProps> = ({ element, onClose, onSave }) => {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [aspect, setAspect] = useState(aspectRatios[0].value);

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSave = async () => {
    if (croppedAreaPixels) {
      const croppedImage = await getCroppedImg(element.src, croppedAreaPixels);
      if (croppedImage) {
        onSave(croppedImage.url, croppedImage.width, croppedImage.height);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center backdrop-blur-sm" onMouseDown={onClose}>
      <div className="bg-[var(--cyber-bg)] border border-[var(--cyber-border)] p-6 rounded-xl shadow-2xl flex flex-col gap-4 w-[80vw] h-[90vh]" onMouseDown={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-[var(--cyber-cyan)]">裁切圖片</h2>
        <div className="relative flex-1 bg-slate-900/50 rounded-lg">
          <Cropper
            image={element.src}
            crop={crop}
            zoom={zoom}
            // FIX: The `lockAspectRatio` prop is not supported by `react-easy-crop`.
            // The aspect ratio is locked automatically when a valid `aspect` number is provided.
            // For a "Free" crop, where the aspect state is 0, we pass `undefined` to the component.
            aspect={aspect ? aspect : undefined}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
        <div className="flex justify-between items-center gap-4">
            <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-400">比例:</span>
                {aspectRatios.map(ratio => (
                    <button key={ratio.text} onClick={() => setAspect(ratio.value)} className={`px-3 py-1 text-xs rounded-md ${aspect.toFixed(4) === ratio.value.toFixed(4) ? 'bg-[var(--cyber-cyan)] text-black' : 'bg-slate-700 text-gray-300'}`}>
                        {ratio.text}
                    </button>
                ))}
            </div>
            <div className="flex items-center gap-2 w-1/3">
                <span className="text-sm text-gray-400">縮放:</span>
                <input
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    aria-labelledby="Zoom"
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full"
                />
            </div>
            <div className="flex justify-end gap-2">
                <button onClick={onClose} className="px-4 py-2 bg-slate-700 text-gray-200 rounded-md hover:bg-slate-600">取消</button>
                <button onClick={handleSave} className="px-4 py-2 bg-[var(--cyber-cyan)] text-black font-bold rounded-md hover:bg-cyan-300">儲存</button>
            </div>
        </div>
      </div>
    </div>
  );
};