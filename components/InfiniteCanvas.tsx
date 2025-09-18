
import React, { useRef, useState, useCallback, useEffect, forwardRef } from 'react';
import type { CanvasElement, Point, Viewport, ArrowElement, ImageCompareElement } from '../types';
import { TransformableElement, ScreenToCanvasFn } from './TransformableElement';
import { getElementsBounds } from '../utils';

interface InfiniteCanvasProps {
  elements: CanvasElement[];
  viewport: Viewport;
  onViewportChange: (viewport: Viewport) => void;
  onUpdateElements: (updates: { id: string, data: Partial<CanvasElement> }[]) => void;
  onCommitHistory: (updates: { id: string, data: Partial<CanvasElement> }[]) => void;
  onAddElement: (element: Omit<ArrowElement, 'id' | 'zIndex'>) => void;
  onAltDragDuplicate: (elementsToCreate: Omit<CanvasElement, 'id' | 'zIndex'>[], revertUpdates: { id: string, data: Partial<CanvasElement> }[]) => void;
  onReplacePlaceholder: (placeholderId: string, file: File) => void;
  onReplacePlaceholderWithImageAndEdit: (placeholderId: string, file: File, editType: 'inpaint' | 'outpaint') => void;
  selectedElementIds: string[];
  onSelectElements: (ids: string[], additive?: boolean) => void;
  onDoubleClickElement: (elementId: string) => void;
  activeTool: 'select' | 'pan' | 'arrow';
  onToolChange: (tool: 'select' | 'pan' | 'arrow') => void;
  isDraggingOver: boolean;
  isConnecting: boolean;
  drawingArrow: {start: Point, end: Point} | null;
  onDrawingArrowChange: (arrow: {start: Point, end: Point} | null) => void;
  lockedGroupIds: Set<string>;
  singlySelectedIdInGroup: string | null;
  isAnimationActive: boolean;
  onTriggerCameraForCompare: (elementId: string, side: 'before' | 'after') => void;
  onTriggerPasteForCompare: (elementId: string, side: 'before' | 'after') => void;
  onFillPlaceholderFromCamera: (placeholderId: string) => void;
  onFillPlaceholderFromPaste: (placeholderId: string) => void;
  ghostElements: CanvasElement[] | null;
  onStartAltDrag: (elements: CanvasElement[]) => void;
  onEndAltDrag: () => void;
}

const intersects = (rect1: {minX: number, minY: number, maxX: number, maxY: number}, rect2: {minX: number, minY: number, maxX: number, maxY: number}) => {
    return rect1.minX < rect2.maxX && rect1.maxX > rect2.minX && rect1.minY < rect2.maxY && rect1.maxY > rect2.minY;
}

export const InfiniteCanvas = forwardRef<HTMLDivElement, InfiniteCanvasProps>(({
  elements, viewport, onViewportChange, onUpdateElements, onCommitHistory, onAddElement, onAltDragDuplicate, onReplacePlaceholder, onReplacePlaceholderWithImageAndEdit,
  selectedElementIds, onSelectElements, onDoubleClickElement, activeTool, onToolChange, isDraggingOver,
  isConnecting, drawingArrow, onDrawingArrowChange, lockedGroupIds, singlySelectedIdInGroup, isAnimationActive,
  onTriggerCameraForCompare, onTriggerPasteForCompare, onFillPlaceholderFromCamera, onFillPlaceholderFromPaste,
  ghostElements, onStartAltDrag, onEndAltDrag
}, ref) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const backgroundCanvasRef = useRef<HTMLCanvasElement>(null);
  const isPanning = useRef(false);
  const lastMousePos = useRef<Point>({ x: 0, y: 0 });
  
  const isAnimationActiveRef = useRef(isAnimationActive);
  useEffect(() => {
    isAnimationActiveRef.current = isAnimationActive;
  }, [isAnimationActive]);

  const [marquee, setMarquee] = useState<{ start: Point; end: Point } | null>(null);
  const isSelectingWithMarquee = useRef(false);
  const [isShiftPressed, setIsShiftPressed] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Shift') setIsShiftPressed(true); };
    const handleKeyUp = (e: KeyboardEvent) => { if (e.key === 'Shift') setIsShiftPressed(false); };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
  
  useEffect(() => {
    const canvas = backgroundCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    
    const computedStyle = getComputedStyle(document.documentElement);
    const colorCyan = computedStyle.getPropertyValue('--cyber-cyan').trim();
    const colorPurple = computedStyle.getPropertyValue('--cyber-purple').trim();
    const colorPink = computedStyle.getPropertyValue('--cyber-pink').trim();
    const colorLakersPurple = '#552583';
    const colorLakersGold = '#FDB927';
    const cyberpunkColorsRGB = ['0, 245, 212', '255, 0, 247', '157, 0, 255']; // Cyan, Pink, Purple
    const cyberpunkColors = [colorCyan, colorPurple, colorPink];


    const handleResize = () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // --- State Management ---
    let blackHoles: any[] = [];
    let particles: any[] = [];
    let explosionParticles: any[] = [];
    let shockwaves: any[] = [];
    let tick = 0;

    // --- Shape Definitions ---
    const bananaShape = [
      { x: -1.0, y: 0.1 }, { x: -0.8, y: -0.3 }, { x: -0.4, y: -0.5 },
      { x: 0.2, y: -0.55 }, { x: 0.7, y: -0.4 }, { x: 1.0, y: 0.0 },
      { x: 0.95, y: 0.2 }, { x: 0.6, y: 0.0 }, { x: 0.1, y: -0.05 },
      { x: -0.5, y: 0.0 }, { x: -0.9, y: 0.3 }
    ];

    // --- Helper Functions ---
    const createBlackHole = (x?: number, y?: number, size: 'large' | 'small' = 'large') => {
        const minSize = size === 'large' ? 50 : 25;
        const maxSize = size === 'large' ? 65 : 35;
        const points: { angle: number; radius: number; radiusV: number; }[] = [];
        const numPoints = 8;
        for (let i = 0; i < numPoints; i++) {
            const angle = (i / numPoints) * Math.PI * 2;
            points.push({
                angle,
                radius: (minSize + maxSize) / 2 + (Math.random() - 0.5) * (maxSize - minSize) * 0.5,
                radiusV: (Math.random() - 0.5) * 0.2
            });
        }
        return {
            id: Math.random(),
            x: x ?? width / 2,
            y: y ?? height / 2,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            minSize, maxSize,
            angle: 0, angleV: 0.01,
            points,
            merging: false,
            mergeTimer: 0,
            getAverageRadius: function() {
                return this.points.reduce((acc: number, p: any) => acc + p.radius, 0) / this.points.length;
            }
        };
    };

    const createExplosion = (x: number, y: number, count: number) => {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 4 + 1;
            explosionParticles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                lifetime: 600, // 10 seconds at 60fps
                color: Math.random() > 0.5 ? colorLakersPurple : colorLakersGold
            });
        }
    };
    
    const createShockwave = (x: number, y: number) => {
        shockwaves.push({
            x, y,
            radius: 0,
            lifetime: 1800, // 30 seconds at 60fps
            amplitude: 10,
            frequency: 0.1,
            tick: 0,
        });
    }

    // --- Initialization ---
    const initialize = () => {
        blackHoles = [createBlackHole(width / 2, height / 2, 'large')];
        particles = [];
        const gridSpacing = 50;
        for (let x = 0; x < width + gridSpacing; x += gridSpacing) {
            for (let y = 0; y < height + gridSpacing; y += gridSpacing) {
                particles.push({
                    x, y, ox: x, oy: y, vx: 0, vy: 0,
                    color: cyberpunkColors[Math.floor(Math.random() * cyberpunkColors.length)],
                    currentFlickerRadius: 0.5 + Math.random() * 0.75,
                    flickerOffset: Math.random() * 1000,
                });
            }
        }
    };
    initialize();

    // --- Animation Loop ---
    const animate = () => {
        tick++;
        ctx.clearRect(0, 0, width, height);
        
        // --- Draw Morphing Banana Silhouette ---
        blackHoles.forEach(bh => {
            ctx.save();
            ctx.translate(bh.x, bh.y);
            ctx.rotate(bh.angle);
            const size = bh.getAverageRadius() * 1.5;
            
            ctx.beginPath();
            bananaShape.forEach((p, i) => {
                const morphX = Math.sin(tick * 0.03 + i * 0.5) * 5 * (size / 100);
                const morphY = Math.cos(tick * 0.02 + i * 0.8) * 5 * (size / 100);
                const x = p.x * size + (isAnimationActiveRef.current ? morphX : 0);
                const y = p.y * size + (isAnimationActiveRef.current ? morphY : 0);
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            ctx.closePath();

            ctx.fillStyle = '#000000';
            ctx.fill();
            ctx.restore();
        });


        // Update & Draw Particles
        particles.forEach(p => {
            if (isAnimationActiveRef.current) {
                let totalForceX = 0;
                let totalForceY = 0;
                
                blackHoles.forEach(bh => {
                    // Create a path for the current morphed banana to check if point is inside
                    const size = bh.getAverageRadius() * 1.5;
                    const tempPath = new Path2D();
                    bananaShape.forEach((point, i) => {
                       const morphX = Math.sin(tick * 0.03 + i * 0.5) * 5 * (size / 100);
                       const morphY = Math.cos(tick * 0.02 + i * 0.8) * 5 * (size / 100);
                       const x = point.x * size + morphX;
                       const y = point.y * size + morphY;
                       if (i === 0) tempPath.moveTo(x, y);
                       else tempPath.lineTo(x, y);
                    });
                    tempPath.closePath();
                    
                    const cos = Math.cos(-bh.angle);
                    const sin = Math.sin(-bh.angle);
                    const translatedX = p.x - bh.x;
                    const translatedY = p.y - bh.y;
                    const localX = translatedX * cos - translatedY * sin;
                    const localY = translatedX * sin + translatedY * cos;
            
                    if (ctx.isPointInPath(tempPath, localX, localY)) {
                        const dx = p.x - bh.x;
                        const dy = p.y - bh.y;
                        const distSq = dx * dx + dy * dy;
                        if (distSq > 1) {
                            const dist = Math.sqrt(distSq);
                            const repulsionForce = 40;
                            totalForceX += (dx / dist) * repulsionForce;
                            totalForceY += (dy / dist) * repulsionForce;
                        }
                    } else {
                        const attractAngle = bh.angle;
                        const attractCos = Math.cos(attractAngle);
                        const attractSin = Math.sin(attractAngle);
            
                        let closestDistSq = Infinity;
                        let closestAttractor = { x: 0, y: 0 };
            
                        bananaShape.forEach((bp, i) => {
                            const morphX = Math.sin(tick * 0.03 + i * 0.5) * 5 * (size / 100);
                            const morphY = Math.cos(tick * 0.02 + i * 0.8) * 5 * (size / 100);
                            const scaledX = bp.x * size + morphX;
                            const scaledY = bp.y * size + morphY;
                            const rotatedX = scaledX * attractCos - scaledY * attractSin;
                            const rotatedY = scaledX * attractSin + scaledY * attractCos;
                            const attractorX = rotatedX + bh.x;
                            const attractorY = rotatedY + bh.y;
                            
                            const dx_attr = attractorX - p.x;
                            const dy_attr = attractorY - p.y;
                            const distSq_attr = dx_attr * dx_attr + dy_attr * dy_attr;
            
                            if (distSq_attr < closestDistSq) {
                                closestDistSq = distSq_attr;
                                closestAttractor.x = attractorX;
                                closestAttractor.y = attractorY;
                            }
                        });
            
                        const dist = Math.sqrt(closestDistSq);
                        const dx = closestAttractor.x - p.x;
                        const dy = closestAttractor.y - p.y;
                        
                        const gravityRadius = 300;
                        if (dist < gravityRadius && dist > 1) { 
                            const force = (1 - dist / gravityRadius) * 8.0; 
                            const forceAngle = Math.atan2(dy, dx);
                            totalForceX += Math.cos(forceAngle) * force;
                            totalForceY += Math.sin(forceAngle) * force;
                        }
                    }
                });
                
                shockwaves.forEach(sw => {
                    const dx = p.x - sw.x;
                    const dy = p.y - sw.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const shockwaveWidth = 50; // How wide the ripple effect is
                    
                    if (dist > 1 && Math.abs(dist - sw.radius) < shockwaveWidth / 2) {
                        const falloff = 1 - (Math.abs(dist - sw.radius) / (shockwaveWidth / 2));
                        const forceMagnitude = 15 * falloff * (sw.lifetime / 1800); // Force decreases as shockwave fades
                        
                        totalForceX += (dx / dist) * forceMagnitude;
                        totalForceY += (dy / dist) * forceMagnitude;
                    }
                });

                const springX = (p.ox - p.x) * 0.01;
                const springY = (p.oy - p.y) * 0.01;
                
                p.vx = (p.vx + totalForceX + springX) * 0.95;
                p.vy = (p.vy + totalForceY + springY) * 0.95;
                
                p.x += p.vx;
                p.y += p.vy;
            }
        
            const breath = (Math.sin((tick + p.flickerOffset) * 0.01) + 1) / 2;
            p.currentFlickerRadius = 0.5 + breath * 0.75;
            
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.currentFlickerRadius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
        });
        
        if (isAnimationActiveRef.current) {
            shockwaves = shockwaves.filter(sw => sw.lifetime > 0 && sw.radius < Math.max(width, height) * 1.5);
            shockwaves.forEach(sw => {
                sw.lifetime -= 1;
                sw.radius += 2;
                sw.tick += 1;
                ctx.beginPath();
                const colorIndex = Math.floor(sw.tick / 30) % cyberpunkColorsRGB.length;
                const currentColorRGB = cyberpunkColorsRGB[colorIndex];
                ctx.strokeStyle = `rgba(${currentColorRGB}, ${sw.lifetime / 1800})`;
                ctx.lineWidth = 1;
                ctx.setLineDash([1, 5]);
                ctx.lineCap = 'round';
                for(let i = 0; i < 360; i++) {
                    const angle = i * Math.PI / 180;
                    const waveValue = (angle * 20) + (sw.tick * sw.frequency);
                    const triangleWave = (2 / Math.PI) * Math.asin(Math.sin(waveValue)); // Zigzag wave
                    const r = sw.radius + triangleWave * sw.amplitude * (sw.lifetime / 1800);
                    const x = sw.x + Math.cos(angle) * r;
                    const y = sw.y + Math.sin(angle) * r;
                    if(i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.stroke();
                ctx.setLineDash([]);
            });
            
            explosionParticles = explosionParticles.filter(p => p.lifetime > 0);
            explosionParticles.forEach(p => {
                p.lifetime -= 1;
                p.x += p.vx;
                p.y += p.vy;
                ctx.beginPath();
                ctx.arc(p.x, p.y, 1, 0, Math.PI * 2);
                const r = parseInt(p.color.slice(1, 3), 16);
                const g = parseInt(p.color.slice(3, 5), 16);
                const b = parseInt(p.color.slice(5, 7), 16);
                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.lifetime / 600})`;
                ctx.fill();
            });

            if (blackHoles.length > 1) {
                const bh1 = blackHoles[0];
                const bh2 = blackHoles[1];
                const d = Math.sqrt((bh1.x - bh2.x) ** 2 + (bh1.y - bh2.y) ** 2);
                const r1 = bh1.getAverageRadius();
                const r2 = bh2.getAverageRadius();
                if (d < r1 + r2) {
                    const mergeX = (bh1.x * r1 + bh2.x * r2) / (r1 + r2);
                    const mergeY = (bh1.y * r1 + bh2.y * r2) / (r1 + r2);
                    const newBh = createBlackHole(mergeX, mergeY, 'large');
                    newBh.merging = true;
                    newBh.mergeTimer = 600; // 10 seconds stationary + effects
                    newBh.vx = 0;
                    newBh.vy = 0;
                    blackHoles = [newBh];
                    createExplosion(mergeX, mergeY, 200);
                    createShockwave(mergeX, mergeY);
                }
            }

            blackHoles.forEach((bh, index) => {
                if (bh.merging) {
                    bh.mergeTimer -= 1;
                    if (bh.mergeTimer <= 0) {
                        bh.merging = false;
                        bh.vx = (Math.random() - 0.5) * 2;
                        bh.vy = (Math.random() - 0.5) * 2;
                    }
                } else {
                    bh.x += bh.vx;
                    bh.y += bh.vy;
                }

                bh.angle += bh.angleV;
                bh.points.forEach((p: any) => {
                    p.radius += p.radiusV;
                    if (p.radius < bh.minSize || p.radius > bh.maxSize) p.radiusV *= -1;
                });
                
                const avgR = bh.getAverageRadius();
                let hasSplit = false;
                if (blackHoles.length < 2 && !bh.merging && (bh.x < avgR || bh.x > width - avgR || bh.y < avgR || bh.y > height - avgR)) {
                    if (bh.x < avgR) bh.x = avgR;
                    if (bh.x > width - avgR) bh.x = width - avgR;
                    if (bh.y < avgR) bh.y = avgR;
                    if (bh.y > height - avgR) bh.y = height - avgR;
                    
                    const angle = Math.atan2(bh.vy, bh.vx);
                    const bh1 = createBlackHole(bh.x, bh.y, 'small');
                    const bh2 = createBlackHole(bh.x, bh.y, 'small');
                    bh1.vx = Math.cos(angle + Math.PI / 4) * 2;
                    bh1.vy = Math.sin(angle + Math.PI / 4) * 2;
                    bh2.vx = Math.cos(angle - Math.PI / 4) * 2;
                    bh2.vy = Math.sin(angle - Math.PI / 4) * 2;
                    blackHoles.splice(index, 1, bh1, bh2);
                    hasSplit = true;
                } 
                
                if(!hasSplit && !bh.merging) {
                    if (bh.x < avgR || bh.x > width - avgR) {
                        bh.vx *= -1;
                        if (bh.x < avgR) bh.x = avgR;
                        if (bh.x > width-avgR) bh.x = width-avgR;
                    }
                    if (bh.y < avgR || bh.y > height - avgR) {
                        bh.vy *= -1;
                        if (bh.y < avgR) bh.y = avgR;
                        if (bh.y > height-avgR) bh.y = height-avgR;
                    }
                }
            });
        }
        
        animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener('resize', handleResize);
    };
  }, []);


  const screenToCanvas: ScreenToCanvasFn = (p: Point) => ({
    x: (p.x - viewport.pan.x) / viewport.zoom,
    y: (p.y - viewport.pan.y) / viewport.zoom,
  });

  const handleMouseDown = (e: React.MouseEvent) => {
    lastMousePos.current = { x: e.clientX, y: e.clientY };
    if (activeTool === 'pan' || e.button === 1) { // Middle mouse button
      isPanning.current = true;
      if(canvasRef.current) canvasRef.current.style.cursor = 'grabbing';
    } else if (activeTool === 'select' && (e.target as HTMLElement).closest('[data-element-id]') === null) {
      isSelectingWithMarquee.current = true;
      const startPoint = { x: e.clientX, y: e.clientY };
      setMarquee({ start: startPoint, end: startPoint });
    } else if (activeTool === 'arrow') {
        onDrawingArrowChange({ start: screenToCanvas(lastMousePos.current), end: screenToCanvas(lastMousePos.current) });
    } else if ((e.target as HTMLElement).closest('[data-element-id]') === null) {
      onSelectElements([]);
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const currentMousePos = { x: e.clientX, y: e.clientY };
    if (isPanning.current) {
      const dx = currentMousePos.x - lastMousePos.current.x;
      const dy = currentMousePos.y - lastMousePos.current.y;
      onViewportChange({
        ...viewport,
        pan: { x: viewport.pan.x + dx, y: viewport.pan.y + dy },
      });
    } else if (isSelectingWithMarquee.current && marquee) {
        setMarquee(m => m ? { ...m, end: currentMousePos } : null);
    } else if (drawingArrow) {
        onDrawingArrowChange({ ...drawingArrow, end: screenToCanvas(currentMousePos) });
    }
    lastMousePos.current = currentMousePos;
  }, [viewport, onViewportChange, marquee, drawingArrow, onDrawingArrowChange, screenToCanvas]);

  const handleMouseUp = useCallback(() => {
    isPanning.current = false;
    if (canvasRef.current) {
        canvasRef.current.style.cursor = isConnecting ? 'crosshair' : (activeTool === 'pan' ? 'grab' : (activeTool === 'arrow' ? 'crosshair' : 'default'));
    }
    
    if (isSelectingWithMarquee.current && marquee) {
      const marqueeStartCanvas = screenToCanvas(marquee.start);
      const marqueeEndCanvas = screenToCanvas(marquee.end);

      const marqueeBounds = {
        minX: Math.min(marqueeStartCanvas.x, marqueeEndCanvas.x),
        minY: Math.min(marqueeStartCanvas.y, marqueeEndCanvas.y),
        maxX: Math.max(marqueeStartCanvas.x, marqueeEndCanvas.x),
        maxY: Math.max(marqueeStartCanvas.y, marqueeEndCanvas.y),
      };
      
      const isClick = Math.abs(marquee.start.x - marquee.end.x) < 5 && Math.abs(marquee.start.y - marquee.end.y) < 5;

      if (isClick) {
          if (!isShiftPressed) onSelectElements([]);
      } else {
         const selectedIds = elements
            .filter(el => {
              // Use getElementsBounds for accurate rotated AABB intersection check
              const elBounds = getElementsBounds([el]);
              return intersects(elBounds, marqueeBounds);
            })
            .map(el => el.id);

          onSelectElements(selectedIds, isShiftPressed);
      }
    } else if (drawingArrow) {
        const { start, end } = drawingArrow;
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > 5) {
            onAddElement({
                type: 'arrow',
                position: start,
                width: distance,
                height: 20,
                rotation: Math.atan2(dy, dx) * (180 / Math.PI),
                color: '#f43f5e',
                strokeWidth: 12,
            });
        }
        onDrawingArrowChange(null);
        onToolChange('select');
    }
    isSelectingWithMarquee.current = false;
    setMarquee(null);

  }, [activeTool, viewport, elements, onSelectElements, isShiftPressed, marquee, isConnecting, drawingArrow, screenToCanvas, onAddElement, onDrawingArrowChange, onToolChange]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = 1.1;
    const newZoom = e.deltaY < 0 ? viewport.zoom * zoomFactor : viewport.zoom / zoomFactor;
    
    const rect = canvasRef.current!.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Position on canvas before zoom
    const worldX = (mouseX - viewport.pan.x) / viewport.zoom;
    const worldY = (mouseY - viewport.pan.y) / viewport.zoom;

    // New pan to keep mouse position fixed
    const newPanX = mouseX - worldX * newZoom;
    const newPanY = mouseY - worldY * newZoom;
    
    onViewportChange({ pan: { x: newPanX, y: newPanY }, zoom: newZoom });
  };
  
  useEffect(() => {
    const nativeMouseMove = (e: MouseEvent) => handleMouseMove(e);
    const nativeMouseUp = () => handleMouseUp();

    window.addEventListener('mousemove', nativeMouseMove);
    window.addEventListener('mouseup', nativeMouseUp);

    return () => {
      window.removeEventListener('mousemove', nativeMouseMove);
      window.removeEventListener('mouseup', nativeMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);
  
  const getMarqueeStyle = (): React.CSSProperties => {
      if (!marquee) return { display: 'none' };
      const { start, end } = marquee;
      return {
          position: 'absolute',
          left: Math.min(start.x, end.x),
          top: Math.min(start.y, end.y),
          width: Math.abs(start.x - end.x),
          height: Math.abs(start.y - end.y),
          border: '1px dashed var(--cyber-cyan)',
          backgroundColor: 'rgba(0, 245, 212, 0.1)',
          pointerEvents: 'none',
          zIndex: 9999,
      };
  }

  const cursorStyle = isConnecting || activeTool === 'arrow'
    ? 'crosshair'
    : activeTool === 'pan'
    ? 'grab'
    : activeTool === 'select'
    ? 'default'
    : 'default';

  return (
    <div
      ref={canvasRef}
      className="w-full h-full overflow-hidden relative"
      style={{ cursor: cursorStyle }}
      onMouseDown={handleMouseDown}
      onWheel={handleWheel}
    >
      <canvas ref={backgroundCanvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" />
      <div
        ref={ref}
        className="transform-gpu infinite-canvas-content-wrapper"
        style={{
          transform: `translate(${viewport.pan.x}px, ${viewport.pan.y}px) scale(${viewport.zoom})`,
          transformOrigin: '0 0',
          width: '100vw', height: '100vh',
        }}
      >
        <div className="relative w-full h-full">
            {ghostElements?.map(ghost => (
                <div
                    key={`ghost-${ghost.id}`}
                    className="absolute pointer-events-none"
                    style={{
                        left: ghost.position.x,
                        top: ghost.position.y,
                        width: ghost.width,
                        height: ghost.height,
                        transform: `rotate(${ghost.rotation}deg)`,
                        zIndex: ghost.zIndex,
                        transformOrigin: ghost.type === 'arrow' ? 'left center' : 'center center',
                    }}
                >
                    <div className="w-full h-full border-2 border-dashed border-[var(--cyber-cyan)] opacity-50" />
                </div>
            ))}
            {elements.map((element) => (
              <TransformableElement
                key={element.id}
                element={element}
                elements={elements}
                viewport={viewport}
                isSelected={selectedElementIds.includes(element.id)}
                isDeepSelected={singlySelectedIdInGroup === element.id}
                onSelect={onSelectElements}
                onUpdateElements={onUpdateElements}
                onCommitHistory={onCommitHistory}
                onAltDragDuplicate={onAltDragDuplicate}
                onReplacePlaceholder={onReplacePlaceholder}
                onReplacePlaceholderWithImageAndEdit={onReplacePlaceholderWithImageAndEdit}
                onDoubleClick={() => onDoubleClickElement(element.id)}
                lockedGroupIds={lockedGroupIds}
                screenToCanvas={screenToCanvas}
                selectedElementIds={selectedElementIds}
                onTriggerCameraForCompare={onTriggerCameraForCompare}
                onTriggerPasteForCompare={onTriggerPasteForCompare}
                onFillPlaceholderFromCamera={onFillPlaceholderFromCamera}
                onFillPlaceholderFromPaste={onFillPlaceholderFromPaste}
                onStartAltDrag={onStartAltDrag}
                onEndAltDrag={onEndAltDrag}
              />
            ))}
        </div>
      </div>
      {marquee && <div style={getMarqueeStyle()} />}
       {isDraggingOver && (
          <div className="absolute inset-0 bg-cyan-900/40 border-4 border-dashed border-[var(--cyber-cyan)] pointer-events-none z-50 flex items-center justify-center backdrop-blur-sm">
            <p className="text-3xl font-bold text-white drop-shadow-lg">將圖片拖放到此處以上傳</p>
          </div>
       )}
    </div>
  );
});