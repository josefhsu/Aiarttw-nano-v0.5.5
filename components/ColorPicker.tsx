import React, { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import { Pipette } from 'lucide-react';

// Color conversion utilities
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

const rgbToHex = (r: number, g: number, b: number): string => {
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
};

// FIX: The original code likely had a redeclaration of `s` (e.g., `const s = ...` or `let s = ...`),
// which caused a "Duplicate identifier 's'" error. `s` is already declared in the line above.
// The fix is to use assignment instead of declaration.
const rgbToHsv = (r: number, g: number, b: number): { h: number; s: number; v: number } => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, v = max;
  const d = max - min;
  s = max === 0 ? 0 : d / max;
  if (max !== min) {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, v: v * 100 };
};

// FIX: The original code likely had a redeclaration of the `s` parameter (e.g., `let s = s / 100;`),
// which caused a "Duplicate identifier 's'" error.
// The fix is to use assignment to the parameter instead of redeclaring it.
const hsvToRgb = (h: number, s: number, v: number): { r: number; g: number; b: number } => {
  s /= 100; v /= 100;
  let r = 0, g = 0, b = 0;
  const i = Math.floor(h / 60);
  const f = h / 60 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
};

interface ColorPickerDialogProps {
  anchorEl: HTMLElement | null;
  initialColor: string;
  onColorChange: (color: string) => void;
  onClose: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const ColorPickerDialog: React.FC<ColorPickerDialogProps> = ({ anchorEl, initialColor, onColorChange, onClose, onMouseEnter, onMouseLeave }) => {
    const dialogRef = useRef<HTMLDivElement>(null);
    const initialRgb = hexToRgb(initialColor === 'transparent' || initialColor.startsWith('linear-gradient') ? '#FFFFFF' : initialColor) || { r: 255, g: 0, b: 0 };
    const [hsv, setHsv] = useState(rgbToHsv(initialRgb.r, initialRgb.g, initialRgb.b));
    const [rgb, setRgb] = useState(initialRgb);
    const [style, setStyle] = useState<React.CSSProperties>({ opacity: 0, pointerEvents: 'none' });
    
    const svBoxRef = useRef<HTMLDivElement>(null);
    const hueSliderRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (anchorEl?.contains(event.target as Node)) {
                return;
            }
            if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose, anchorEl]);

    useLayoutEffect(() => {
        if (anchorEl && dialogRef.current) {
            const anchorRect = anchorEl.getBoundingClientRect();
            const dialogNode = dialogRef.current;
            const dialogWidth = dialogNode.offsetWidth;
            const dialogHeight = dialogNode.offsetHeight;
            const vpWidth = window.innerWidth;
            const vpHeight = window.innerHeight;
            const PADDING = 8;
            const Y_OFFSET = 10; // A small gap between anchor and dialog

            // --- Vertical positioning ---
            let top;
            // Try positioning below first, as it's more natural
            if (anchorRect.bottom + Y_OFFSET + dialogHeight <= vpHeight - PADDING) {
                top = anchorRect.bottom + Y_OFFSET;
            } 
            // If not enough space below, try positioning above
            else if (anchorRect.top - Y_OFFSET - dialogHeight >= PADDING) {
                top = anchorRect.top - Y_OFFSET - dialogHeight;
            }
            // If there's no space above or below, clamp to the bottom of the viewport as a fallback
            else {
                top = vpHeight - dialogHeight - PADDING;
            }
            // Ensure it never goes above the top of the viewport
            top = Math.max(PADDING, top);

            // --- Horizontal positioning ---
            // Center it horizontally relative to the anchor
            let left = anchorRect.left + (anchorRect.width / 2) - (dialogWidth / 2);
            // Clamp to viewport to prevent horizontal overflow
            if (left < PADDING) {
                left = PADDING;
            }
            if (left + dialogWidth > vpWidth - PADDING) {
                left = vpWidth - dialogWidth - PADDING;
            }

            setStyle({
                position: 'fixed',
                top: `${top}px`,
                left: `${left}px`,
                opacity: 1,
                zIndex: 51,
            });
        }
    }, [anchorEl]);
    
    const updateColor = (newHsv: { h: number; s: number; v: number }) => {
        const validHsv = { h: isNaN(newHsv.h) ? hsv.h : newHsv.h, s: newHsv.s, v: newHsv.v };
        setHsv(validHsv);
        const newRgb = hsvToRgb(validHsv.h, validHsv.s, validHsv.v);
        setRgb(newRgb);
        onColorChange(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
    };

    const handleRgbChange = (channel: 'r' | 'g' | 'b', value: string) => {
        const numValue = parseInt(value, 10);
        if (isNaN(numValue) || numValue < 0 || numValue > 255) return;
        const newRgb = { ...rgb, [channel]: numValue };
        setRgb(newRgb);
        setHsv(rgbToHsv(newRgb.r, newRgb.g, newRgb.b));
        onColorChange(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
    };

    const handleEyeDropper = async () => {
        if (!('EyeDropper' in window)) {
            alert("此瀏覽器不支援滴管工具。");
            return;
        }
        try {
            const eyeDropper = new (window as any).EyeDropper();
            const result = await eyeDropper.open();
            const newRgb = hexToRgb(result.sRGBHex);
            if (newRgb) {
                updateColor(rgbToHsv(newRgb.r, newRgb.g, newRgb.b));
            }
        } catch (e) {
            console.log('EyeDropper cancelled.');
        }
    };
    
    const handleSliderDrag = (ref: React.RefObject<HTMLDivElement>, callback: (e: MouseEvent) => void) => (e: React.MouseEvent) => {
        e.preventDefault();
        
        const handleMove = (moveEvent: MouseEvent) => {
             callback(moveEvent);
        };
        const handleUp = () => {
            document.removeEventListener('mousemove', handleMove);
            document.removeEventListener('mouseup', handleUp);
        };
        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', handleUp);
        callback(e as any);
    };
    
    const handleSvChange = (e: MouseEvent) => {
        if (!svBoxRef.current) return;
        const rect = svBoxRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
        const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
        updateColor({ ...hsv, s: (x / rect.width) * 100, v: 100 - (y / rect.height) * 100 });
    };

    const handleHueChange = (e: MouseEvent) => {
        if (!hueSliderRef.current) return;
        const rect = hueSliderRef.current.getBoundingClientRect();
        const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
        updateColor({ ...hsv, h: (y / rect.height) * 360 });
    };

    const hueColor = `hsl(${hsv.h}, 100%, 50%)`;
    
    return (
        <div 
            ref={dialogRef} 
            style={style} 
            className="bg-[#2a2a3a] p-4 rounded-lg shadow-2xl border border-slate-700 w-72 flex flex-col gap-4"
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <div ref={svBoxRef} onMouseDown={handleSliderDrag(svBoxRef, handleSvChange)} className="w-full h-40 rounded-md cursor-crosshair relative" style={{ backgroundColor: hueColor }}>
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, white, transparent)' }}/>
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, black, transparent)' }}/>
                <div className="absolute rounded-full w-4 h-4 border-2 border-white pointer-events-none shadow-lg" style={{ left: `${hsv.s}%`, top: `${100 - hsv.v}%`, transform: 'translate(-50%, -50%)' }} />
            </div>

            <div className="flex gap-3">
                 <div className="flex-grow flex items-center gap-2">
                    <button onClick={handleEyeDropper} className="p-2 rounded-md bg-slate-700 hover:bg-slate-600"><Pipette size={16} /></button>
                    <div ref={hueSliderRef} onMouseDown={handleSliderDrag(hueSliderRef, handleHueChange)} className="w-6 h-40 rounded-md cursor-pointer relative" style={{ background: 'linear-gradient(to top, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)' }}>
                        <div className="absolute w-full h-1.5 rounded-full bg-white/80 pointer-events-none border border-black/30" style={{ top: `${(hsv.h / 360) * 100}%`, transform: 'translateY(-50%)' }} />
                    </div>
                 </div>
                 <div className="flex-grow-[3] flex flex-col gap-2">
                    <div className="w-full h-12 rounded-md" style={{ backgroundColor: rgbToHex(rgb.r, rgb.g, rgb.b) }} />
                    <div className="grid grid-cols-4 gap-x-2 gap-y-1 text-sm">
                        <label htmlFor="hex-input" className="font-semibold">HEX</label>
                        <input id="hex-input" value={rgbToHex(rgb.r, rgb.g, rgb.b)} onChange={(e) => { const newRgb = hexToRgb(e.target.value); if(newRgb) updateColor(rgbToHsv(newRgb.r, newRgb.g, newRgb.b)) }} className="col-span-3 bg-slate-800 rounded px-2 py-1 text-center" />
                        
                        <label htmlFor="r-input">R</label>
                        <input id="r-input" type="number" value={rgb.r} onChange={e => handleRgbChange('r', e.target.value)} className="col-span-3 bg-slate-800 rounded px-2 py-1 text-center" />
                        
                        <label htmlFor="g-input">G</label>
                        <input id="g-input" type="number" value={rgb.g} onChange={e => handleRgbChange('g', e.target.value)} className="col-span-3 bg-slate-800 rounded px-2 py-1 text-center" />
                        
                        <label htmlFor="b-input">B</label>
                        <input id="b-input" type="number" value={rgb.b} onChange={e => handleRgbChange('b', e.target.value)} className="col-span-3 bg-slate-800 rounded px-2 py-1 text-center" />
                    </div>
                 </div>
            </div>
        </div>
    );
}

interface AdvancedColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
}

const CYBERPUNK_GRADIENTS = [
  'linear-gradient(135deg, #00f5d4, #9d00ff)',
  'linear-gradient(135deg, #ff00f7, #00f5d4)',
  'linear-gradient(135deg, #f7ff00, #9d00ff)',
  'linear-gradient(135deg, #00f5d4, #ff00f7, #f7ff00)',
  'linear-gradient(45deg, #00f5d4, #00a2ff, #9d00ff, #ff00f7)',
];

export const AdvancedColorPicker: React.FC<AdvancedColorPickerProps> = ({ selectedColor, onColorChange }) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [isHoveringDialog, setIsHoveringDialog] = useState(false);
    const closeTimeoutRef = useRef<number | null>(null);

    const isGradient = selectedColor.startsWith('linear-gradient');
    const isTransparent = selectedColor === 'transparent';
    const displayColor = isGradient ? 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cdefs%3E%3ClinearGradient id=\'g\' x1=\'0%25\' y1=\'0%25\' x2=\'100%25\' y2=\'100%25\'%3E%3Cstop offset=\'0%25\' style=\'stop-color:%2300f5d4;\'/%3E%3Cstop offset=\'50%25\' style=\'stop-color:%239d00ff;\'/%3E%3Cstop offset=\'100%25\' style=\'stop-color:%23ff00f7;\'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill=\'url(%23g)\' width=\'100\' height=\'100\'/%3E%3C/svg%3E")' 
                       : isTransparent ? 'url("data:image/svg+xml,%3Csvg width=\'10\' height=\'10\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0 H5 V5 H0 Z\' fill=\'%23fff\'/%3E%3Cpath d=\'M5 0 H10 V5 H5 Z\' fill=\'%23ccc\'/%3E%3Cpath d=\'M0 5 H5 V10 H0 Z\' fill=\'%23ccc\'/%3E%3Cpath d=\'M5 5 H10 V10 H5 Z\' fill=\'%23fff\'/%3E%3C/svg%3E")'
                       : selectedColor;

    const handleOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(e.currentTarget);
        setIsDialogOpen(true);
    };

    const handleClose = useCallback(() => {
        if (isHoveringDialog) return;
        setIsDialogOpen(false);
        setAnchorEl(null);
    }, [isHoveringDialog]);
    
    const handleMouseLeave = useCallback(() => {
        closeTimeoutRef.current = window.setTimeout(() => {
            handleClose();
        }, 100);
    }, [handleClose]);
    
    const handleMouseEnter = useCallback(() => {
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = null;
        }
    }, []);
    
    const [hsv, setHsv] = useState({ h: 0, s: 0, v: 0 });
    const hsvRef = useRef(hsv);
    hsvRef.current = hsv;

    useEffect(() => {
        const currentRgb = hexToRgb(isGradient || isTransparent ? '#FFFFFF' : selectedColor);
        if (currentRgb) {
            const newHsv = rgbToHsv(currentRgb.r, currentRgb.g, currentRgb.b);
            setHsv(newHsv);
        }
    }, [selectedColor, isGradient, isTransparent]);
    
    const handleHueDrag = (initialEvent: React.MouseEvent<HTMLDivElement>) => {
        const slider = initialEvent.currentTarget;
        
        const handleMouseMove = (moveEvent: MouseEvent) => {
            const rect = slider.getBoundingClientRect();
            const x = Math.max(0, Math.min(rect.width, moveEvent.clientX - rect.left));
            const newHue = (x / rect.width) * 360;
            
            const currentHsv = hsvRef.current;
            let newColor: string;
            
            if (currentHsv.s < 10 || currentHsv.v < 10) {
                const newRgb = hsvToRgb(newHue, 100, 100);
                newColor = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
            } else {
                const newRgb = hsvToRgb(newHue, currentHsv.s, currentHsv.v);
                newColor = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
            }
            onColorChange(newColor);
        };

        const handleMouseUp = () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };

        initialEvent.preventDefault();
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp, { once: true });

        handleMouseMove(initialEvent.nativeEvent);
    };

    return (
        <div className="flex items-center gap-2" onMouseLeave={handleMouseLeave}>
            <button
                onClick={handleOpen}
                onMouseEnter={handleMouseEnter}
                className="w-8 h-8 rounded-md border-2 border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                style={{ background: displayColor }}
            />
            
            <div className="flex items-center gap-2">
                <div
                    onMouseDown={handleHueDrag}
                    className="h-2 rounded-md cursor-pointer relative"
                    style={{
                        width: '7.5rem', /* 120px */
                        background: 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)'
                    }}
                >
                    <div className="absolute h-full w-1.5 rounded-full bg-white/80 pointer-events-none border border-black/30"
                         style={{ left: `${(hsv.h / 360) * 100}%`, transform: 'translateX(-50%)' }}
                    />
                </div>
                
                <div className="flex items-center gap-1.5">
                    {CYBERPUNK_GRADIENTS.map((grad, i) => (
                        <button key={i} title={`Gradient ${i+1}`} onClick={() => onColorChange(grad)}
                                className={`w-6 h-6 rounded-md border-2 ${selectedColor === grad ? 'border-white' : 'border-transparent'}`}
                                style={{ background: grad }}/>
                    ))}
                    <button title="Transparent" onClick={() => onColorChange('transparent')}
                            className={`w-6 h-6 rounded-md border-2 ${isTransparent ? 'border-white' : 'border-transparent'}`}
                            style={{ background: 'url("data:image/svg+xml,%3Csvg width=\'10\' height=\'10\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0 H5 V5 H0 Z\' fill=\'%23fff\'/%3E%3Cpath d=\'M5 0 H10 V5 H5 Z\' fill=\'%23ccc\'/%3E%3Cpath d=\'M0 5 H5 V10 H0 Z\' fill=\'%23ccc\'/%3E%3Cpath d=\'M5 5 H10 V10 H5 Z\' fill=\'%23fff\'/%3E%3C/svg%3E")' }}
                    />
                </div>
            </div>

            {isDialogOpen && (
                <ColorPickerDialog
                    anchorEl={anchorEl}
                    initialColor={selectedColor}
                    onColorChange={onColorChange}
                    onClose={handleClose}
                    onMouseEnter={() => setIsHoveringDialog(true)}
                    onMouseLeave={() => { setIsHoveringDialog(false); handleClose(); }}
                />
            )}
        </div>
    );
};