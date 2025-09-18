import html2canvas from "html2canvas";

export interface Point {
  x: number;
  y: number;
}

export interface Viewport {
    pan: Point;
    zoom: number;
}

export type ElementType = 'note' | 'image' | 'arrow' | 'drawing' | 'placeholder' | 'imageCompare' | 'inpaintPlaceholder' | 'outpaintPlaceholder';

interface BaseElement {
  id: string;
  position: Point;
  width: number;
  height: number;
  rotation: number; // in degrees
  zIndex: number;
  groupId?: string;
  meta?: Record<string, any>;
}

export interface NoteElement extends BaseElement {
  type: 'note';
  content: string;
  color: string; // HEX color string
  fontSize: number;
}

export interface ImageElement extends BaseElement {
  type: 'image';
  src: string;
  intrinsicWidth: number;
  intrinsicHeight: number;
}

export interface ArrowElement extends BaseElement {
  type: 'arrow';
  color: string;
  strokeWidth: number;
}

export interface DrawingElement extends BaseElement {
  type: 'drawing';
  src: string; // base64 data URL
}

export interface PlaceholderElement extends BaseElement {
  type: 'placeholder';
}

export interface InpaintPlaceholderElement extends BaseElement {
  type: 'inpaintPlaceholder';
}

export interface OutpaintPlaceholderElement extends BaseElement {
  type: 'outpaintPlaceholder';
}

export interface ImageCompareElement extends BaseElement {
    type: 'imageCompare';
    srcBefore: string;
    intrinsicWidthBefore: number;
    intrinsicHeightBefore: number;
    srcAfter: string;
    intrinsicWidthAfter: number;
    intrinsicHeightAfter: number;
    wasInpainted?: boolean;
    maskSrc?: string;
    inpaintedPrompt?: string;
}

export type CanvasElement = NoteElement | ImageElement | ArrowElement | DrawingElement | PlaceholderElement | ImageCompareElement | InpaintPlaceholderElement | OutpaintPlaceholderElement;

export interface Connection {
    id: string;
    sourceId: string;
    targetId: string;
    sourceSide: 'left' | 'right';
    targetSide: 'left' | 'right';
}

export interface ExportedTrack {
    id: number;
    name: string;
    fileName: string;
    lrc?: string;
}
export interface ExportedPlaylist { name: string; trackIds: number[]; }
export interface BackupData { version: number; tracks: ExportedTrack[]; playlists: ExportedPlaylist[]; }