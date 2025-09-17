import React, { useState, useCallback, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { GoogleGenAI, Modality, Type } from "@google/genai";
import html2canvas from 'html2canvas';
import { useHistoryState } from './useHistoryState';
import { InfiniteCanvas } from './components/InfiniteCanvas';
import { Toolbar, Tool } from './components/Toolbar';
import { FloatingToolbar } from './components/FloatingToolbar';
import { LayersPanel } from './components/LayersPanel';
import { Navigator } from './components/Navigator';
import { DrawingModal } from './components/DrawingModal';
import { CroppingModal } from './components/CroppingModal';
import { CameraModal } from './components/CameraModal';
import { ContextMenu, ContextMenuItem } from './components/ContextMenu';
import { InspirationModal } from './components/InspirationModal';
import { InspirationPanel } from './components/InspirationPanel';
import { ShortcutHints } from './components/ShortcutHints';
import { MusicPlayer } from './components/MusicPlayer';
import { LyricsDisplay } from './components/LyricsDisplay';
import type { CanvasElement, Viewport, Point, NoteElement, ImageElement, DrawingElement, ArrowElement, Connection, PlaceholderElement, BackupData, ExportedTrack, ImageCompareElement } from './types';
import { ULTIMATE_EDITING_GUIDE, ASPECT_RATIO_OPTIONS, RANDOM_GRADIENTS } from './constants';
// FIX: The constants were moved from constants1.tsx to constants2.tsx and then consolidated. Correcting the import to the right file.
import { NCL_OPTIONS, NIGHT_CITY_WEAPONS, NIGHT_CITY_VEHICLES, NIGHT_CITY_COMPANIONS, NIGHT_CITY_MISSIONS, NIGHT_CITY_LEGENDS } from './constants2';
import { fileToBase64, base64ToFile, dataUrlToBlob, getElementsBounds, createGrayImage, correctImageAspectRatio, calculateNoteHeight, addTrackToDB, getAllTracksFromDB, clearAllTracksFromDB, savePlaylistToDB, getPlaylistsFromDB, getTrackFromDB, updateTrackLrcInDB, parseLRC, ParsedLrcLine, deleteTrackFromDB, removeTrackFromPlaylistInDB } from './utils';

type AddElementFn = {
    (element: Omit<NoteElement, 'id' | 'zIndex'>, sourcePrompt?: string): void;
    (element: Omit<ImageElement, 'id' | 'zIndex'>, sourcePrompt?: string): void;
    (element: Omit<DrawingElement, 'id' | 'zIndex'>, sourcePrompt?: string): void;
    (element: Omit<ArrowElement, 'id' | 'zIndex'>, sourcePrompt?: string): void;
    (element: Omit<PlaceholderElement, 'id' | 'zIndex'>, sourcePrompt?: string): void;
    (element: Omit<ImageCompareElement, 'id' | 'zIndex'>, sourcePrompt?: string): void;
};

const getInitialElements = (): NoteElement[] => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    return [
    {
        id: 'initial-note-1', type: 'note', zIndex: 1, rotation: 0,
        position: { x: centerX - 100, y: centerY - 370 }, width: 230, height: 230,
        content: '歡迎來到\n鳥巢AI包娜娜\n創意畫布！', color: 'linear-gradient(135deg, #00f5d4, #9d00ff)', fontSize: 24
    },
    {
        id: 'initial-note-2', type: 'note', zIndex: 2, rotation: 3,
        position: { x: centerX - 300, y: centerY - 100 }, width: 200, height: 200,
        content: '按Tab鍵，開合常用面板\n按空白鍵，平移畫布\n按右鍵，出現快速選單\n其他快捷鍵請看右側', color: 'var(--cyber-pink)', fontSize: 16
    },
    {
        id: 'initial-note-3', type: 'note', zIndex: 3, rotation: -2,
        position: { x: centerX, y: centerY -50 }, width: 250, height: 200,
        content: '2025歡迎邀約鳥巢AI\n想學最新AI生成影音工具\n企業想找AI工具顧問\n\n歡迎找鳥巢AI\n', color: 'var(--cyber-purple)', fontSize: 16
    },
     {
        id: 'initial-note-4', type: 'note', zIndex: 4, rotation: -1,
        position: { x: centerX + 50, y: centerY + 130}, width: 250, height: 50,
        content: 'https://aiarttw.us/contact', color: 'var(--cyber-purple)', fontSize: 16
    },
     {
        id: 'initial-note-5', type: 'note', zIndex: 5, rotation: 0,
        position: { x: centerX -250, y: centerY + 200}, width: 250, height: 100,
        content: '鳥巢AI包娜娜主題曲', color: 'transparent', fontSize: 16
    },
    {
        id: 'initial-note-6', type: 'note', zIndex: 6, rotation: 2,
        position: { x: centerX -260, y: centerY + 230}, width: 250, height: 100,
        content: 'https://aiarttw.us/nb', color: 'transparent', fontSize: 16
    }
]};

const initialNoteIds = new Set(['initial-note-1', 'initial-note-2', 'initial-note-3', 'initial-note-4', 'initial-note-5', 'initial-note-6']);

const ASPECT_RATIO_PROMPT = `將生成內容重新繪製到灰色參考圖上，如有空白加入符合內容的outpaint以適合灰色參考圖的寬高比，完全佔滿取代灰色參考圖的所有內容(包含底色背景)，僅保留灰色參考圖的寬高比，生成後如果偵測到圖片外緣有大面積灰色（#808080）區域，就自動outpaint填充合適內容，並確保"正確比例"下，生成出 比例完整的內容，也可以偵測 生成後圖片中心點、短邊為基礎，依選擇的比例 進行裁切，或 outpaint 以生成出 比例完整的圖片`;

type RepeatMode = 'off' | 'all' | 'one';
interface MusicTrack { name: string; url: string; dbId: number; lrc?: ParsedLrcLine[] }
interface Playlist { name: string; trackIds: number[]; }

export const App: React.FC = () => {
  const { state: elements, setState: setElements, undo, redo, canUndo, canRedo } = useHistoryState<CanvasElement[]>(getInitialElements());
  const [connections, setConnections] = useState<Connection[]>([]);
  const [viewport, setViewport] = useState<Viewport>({ pan: { x: 0, y: 0 }, zoom: 1 });
  const [activeTool, setActiveTool] = useState<Tool>('select');
  const [previousTool, setPreviousTool] = useState<Tool>('select');
  const [selectedElementIds, setSelectedElementIds] = useState<string[]>([]);
  const [lockedGroupIds, setLockedGroupIds] = useState<Set<string>>(new Set());
  const [singlySelectedIdInGroup, setSinglySelectedIdInGroup] = useState<string | null>(null);
  const [lastInteractedLayerId, setLastInteractedLayerId] = useState<string | null>(null);
  const [ghostElements, setGhostElements] = useState<CanvasElement[] | null>(null);
  
  const [prompts, setPrompts] = useState<Record<string, string>>({});
  const [aspectRatios, setAspectRatios] = useState<Record<string, number | null>>({});
  const [artStyles, setArtStyles] = useState<Record<string, string>>({});
  
  const [isInspirationPanelOpen, setIsInspirationPanelOpen] = useState(false);
  const [isLayersPanelOpen, setIsLayersPanelOpen] = useState(false);
  const [isToolbarOpen, setIsToolbarOpen] = useState(false);
  const [isAnimationActive, setIsAnimationActive] = useState(true);

  const welcomeNotesDeletedRef = useRef(false);

  // Modals and states
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingToEdit, setDrawingToEdit] = useState<DrawingElement | null>(null);
  const [croppingElement, setCroppingElement] = useState<ImageElement | DrawingElement | null>(null);
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);
  const [placeholderTarget, setPlaceholderTarget] = useState<string | null>(null);
  const [imageCompareTarget, setImageCompareTarget] = useState<{ elementId: string; side: 'before' | 'after' } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState('Generating...');
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [newConnection, setNewConnection] = useState<{ sourceId: string; sourceSide: 'left' | 'right'; startPoint: Point, endPoint: Point } | null>(null);
  const [drawingArrow, setDrawingArrow] = useState<{ start: Point; end: Point } | null>(null);
  const [isInspirationModalOpen, setIsInspirationModalOpen] = useState(false);
  const [inspirationData, setInspirationData] = useState<{ modificationSuggestions: string[], textPrompts: string[] } | null>(null);
  const [inspirationConfirm, setInspirationConfirm] = useState<{ elementId: string } | null>(null);

  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, items: ContextMenuItem[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  
  // Music Player State
  const [isMusicPlayerVisible, setIsMusicPlayerVisible] = useState(false);
  const [musicTracks, setMusicTracks] = useState<MusicTrack[]>([]);
  const audioRef = useRef<HTMLAudioElement>(new Audio());
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('all');
  const [isShuffle, setIsShuffle] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [activePlaylistName, setActivePlaylistName] = useState('所有音樂');
  const [currentLrc, setCurrentLrc] = useState<ParsedLrcLine[] | null>(null);
  const [currentLyric, setCurrentLyric] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const linkingMetadataRef = useRef<BackupData | null>(null);
  const musicUploadRefForLink = useRef<HTMLInputElement>(null);


  const selectedElements = elements.filter(el => selectedElementIds.includes(el.id));
  const deepSelectedElement = singlySelectedIdInGroup ? elements.find(el => el.id === singlySelectedIdInGroup) : null;
  
  useEffect(() => {
    const handleResize = () => setCanvasSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const revokeTrackUrls = (tracks: MusicTrack[]) => {
      tracks.forEach(track => {
          if (track.url.startsWith('blob:')) {
              URL.revokeObjectURL(track.url);
          }
      });
  };

  const loadAllUserTracks = useCallback(async () => {
    try {
        const tracksFromDB = await getAllTracksFromDB();
        const loadedTracks = tracksFromDB.map(t => ({
            name: t.name,
            url: URL.createObjectURL(t.file),
            dbId: t.id,
            lrc: t.lrc ? parseLRC(t.lrc) : undefined,
        }));

        setMusicTracks(currentTracks => {
            revokeTrackUrls(currentTracks);
            return loadedTracks;
        });

        setCurrentTrackIndex(0);
        setActivePlaylistName('所有音樂');
        
        if (loadedTracks.length === 0) {
            setIsPlaying(false);
        }
    } catch (error) {
        console.error("Failed to load all user tracks:", error);
        alert('讀取本地音樂失敗。');
    }
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    audio.loop = false;

    const loadData = async () => {
        try {
            const storedPlaylists = await getPlaylistsFromDB();
            setPlaylists(storedPlaylists);
            await loadAllUserTracks();
        } catch (error) {
            console.error("Failed to load data from DB:", error);
        }
    };
    loadData();
    
    return () => {
      audio?.pause();
      revokeTrackUrls(musicTracks);
    }
  }, [loadAllUserTracks]);
  
  useEffect(() => {
    const track = musicTracks[currentTrackIndex];
    const audio = audioRef.current;
    if (track) {
      audio.src = track.url;
      setCurrentLrc(track.lrc || null);
      setCurrentLyric('');
      if (isPlaying) {
        audio.play().catch(e => {
            console.error("Auto-play on track change failed:", e)
            setIsPlaying(false);
        });
      }
    } else if (musicTracks.length === 0) {
      audio.src = '';
      setIsPlaying(false);
    }
  }, [currentTrackIndex, musicTracks, isPlaying]);

  const handlePlayPause = () => {
    if (musicTracks.length === 0) return;
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(e => console.error("Error playing audio:", e));
    }
    setIsPlaying(!isPlaying);
  };
  
  const handleStop = () => {
    const audio = audioRef.current;
    audio.pause();
    audio.currentTime = 0;
    setIsPlaying(false);
  };

  const handleSeek = (time: number) => {
    const audio = audioRef.current;
    if (isFinite(time)) {
        audio.currentTime = time;
        setCurrentTime(time);
    }
  };

  const handleNextTrack = useCallback(() => {
    if (musicTracks.length === 0) return;
    if (isShuffle) {
        let nextIndex = currentTrackIndex;
        if (musicTracks.length > 1) {
            while (nextIndex === currentTrackIndex) {
                nextIndex = Math.floor(Math.random() * musicTracks.length);
            }
        }
        setCurrentTrackIndex(nextIndex);
    } else {
        setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % musicTracks.length);
    }
  }, [currentTrackIndex, isShuffle, musicTracks.length]);

  const handlePrevTrack = () => {
      if (musicTracks.length === 0) return;
      if (isShuffle) {
        let prevIndex = currentTrackIndex;
        if (musicTracks.length > 1) {
            while (prevIndex === currentTrackIndex) {
                prevIndex = Math.floor(Math.random() * musicTracks.length);
            }
        }
        setCurrentTrackIndex(prevIndex);
      } else {
        setCurrentTrackIndex((prevIndex) => (prevIndex - 1 + musicTracks.length) % musicTracks.length);
      }
  };
  
  const handleSelectTrack = (trackIndex: number) => {
    if (trackIndex >= 0 && trackIndex < musicTracks.length) {
        setCurrentTrackIndex(trackIndex);
        if (!isPlaying) {
            setIsPlaying(true);
        }
    }
  };

  useEffect(() => {
    const audio = audioRef.current;

    const handleTrackEnd = () => {
        if (repeatMode === 'one') {
            audio.currentTime = 0;
            audio.play();
        } else {
            const isLastTrack = currentTrackIndex === musicTracks.length - 1;
            if (!isShuffle && isLastTrack && repeatMode === 'off') {
                setIsPlaying(false);
                audio.currentTime = 0;
            } else {
                handleNextTrack();
            }
        }
    };

    const handleTimeUpdate = () => {
        if (!audio.duration) return;
        setCurrentTime(audio.currentTime);

        if (!currentLrc) return;
        const currentTime = audio.currentTime;
        let lyricLine = '';
        for (let i = currentLrc.length - 1; i >= 0; i--) {
            if (currentTime >= currentLrc[i].time) {
                lyricLine = currentLrc[i].text;
                break;
            }
        }
        setCurrentLyric(lyricLine);
    };

    const handleLoadedMetadata = () => {
        setDuration(audio.duration);
    };

    audio.addEventListener('ended', handleTrackEnd);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
        audio.removeEventListener('ended', handleTrackEnd);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [repeatMode, isShuffle, currentTrackIndex, musicTracks.length, handleNextTrack, currentLrc]);

  const processAndSaveTracks = async (tracks: { file: File, name: string, lrc?: string }[], playlistName: string) => {
    const trackIds: number[] = [];
    for (const track of tracks) {
        const id = await addTrackToDB(track);
        trackIds.push(id);
    }
    if (trackIds.length > 0) {
        await savePlaylistToDB(playlistName, trackIds);
    }
  };

  const handleFolderUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const allFiles = Array.from(files).filter(f => !f.name.startsWith('.'));
    const audioFiles = allFiles.filter(f => f.type.startsWith('audio/'));
    const lrcFiles = new Map(allFiles
        .filter(f => f.name.toLowerCase().endsWith('.lrc'))
        .map(f => [f.name.toLowerCase().replace(/\.lrc$/, ''), f])
    );

    if (audioFiles.length === 0) return;

    // Group files by directory
    const filesByDir: Record<string, { file: File, name: string, lrc?: string }[]> = {};

    for (const file of audioFiles) {
        const path = (file as any).webkitRelativePath || file.name;
        const pathParts = path.split('/');
        // The directory is the second to last part, or a default name if it's a flat list
        const dirName = pathParts.length > 1 ? pathParts[pathParts.length - 2] : '我的上傳';
        
        if (!filesByDir[dirName]) {
            filesByDir[dirName] = [];
        }

        const name = file.name.replace(/\.[^/.]+$/, "");
        const lrcFile = lrcFiles.get(name.toLowerCase());
        const lrcContent = lrcFile ? await lrcFile.text() : undefined;
        
        filesByDir[dirName].push({ file, name, lrc: lrcContent });
    }

    try {
        setIsPlaying(false);
        audioRef.current.pause();

        for (const [playlistName, tracks] of Object.entries(filesByDir)) {
            await processAndSaveTracks(tracks, playlistName);
        }
        
        await loadAllUserTracks();
        const storedPlaylists = await getPlaylistsFromDB();
        setPlaylists(storedPlaylists);

        // Switch to the first new playlist that was created
        const firstNewPlaylistName = Object.keys(filesByDir)[0];
        if (firstNewPlaylistName) {
            await handleSwitchPlaylist(firstNewPlaylistName);
        }
        setIsPlaying(false);
        setIsMusicPlayerVisible(true);
        alert(`${Object.keys(filesByDir).length} 個播放清單已成功上傳！`);

    } catch (error) {
        console.error("Failed to upload and process music:", error);
        alert('上傳音樂時發生錯誤。');
    }
  };

  const handleMusicDrop = async (items: DataTransferItemList) => {
    const entries: FileSystemEntry[] = Array.from(items).map(item => item.webkitGetAsEntry()).filter(Boolean) as FileSystemEntry[];
    if (entries.length === 0) return;

    const processDirectory = async (dirEntry: FileSystemDirectoryEntry): Promise<{ files: File[], lrcFiles: Map<string, File> }> => {
        return new Promise((resolve) => {
            const dirReader = dirEntry.createReader();
            const allFiles: File[] = [];
            const allLrcFiles = new Map<string, File>();

            const readEntries = () => {
                dirReader.readEntries(async (entries) => {
                    if (entries.length === 0) {
                        resolve({ files: allFiles, lrcFiles: allLrcFiles });
                        return;
                    }
                    for (const entry of entries) {
                        if (entry.isFile) {
                            await new Promise<void>(resolveFile => {
                                (entry as FileSystemFileEntry).file(file => {
                                    if (!file.name.startsWith('.')) {
                                        if(file.type.startsWith('audio/')) {
                                            allFiles.push(file);
                                        } else if (file.name.toLowerCase().endsWith('.lrc')) {
                                            const baseName = file.name.toLowerCase().replace(/\.lrc$/, '');
                                            allLrcFiles.set(baseName, file);
                                        }
                                    }
                                    resolveFile();
                                });
                            });
                        }
                    }
                    readEntries(); // Read next batch
                });
            };
            readEntries();
        });
    };

    try {
        setIsPlaying(false);
        audioRef.current.pause();

        for (const entry of entries) {
            if (entry.isDirectory) {
                const { files, lrcFiles } = await processDirectory(entry as FileSystemDirectoryEntry);
                if (files.length > 0) {
                    const tracksToSave = await Promise.all(files.map(async file => {
                         const name = file.name.replace(/\.[^/.]+$/, "");
                         const lrcFile = lrcFiles.get(name.toLowerCase());
                         const lrcContent = lrcFile ? await lrcFile.text() : undefined;
                         return { file, name, lrc: lrcContent };
                    }));
                    await processAndSaveTracks(tracksToSave, entry.name);
                }
            } else if (entry.isFile) {
                // Handle single file drop as before, maybe add to a default playlist
                console.warn("Single file drops are not yet configured for playlist creation.");
            }
        }

        await loadAllUserTracks();
        const storedPlaylists = await getPlaylistsFromDB();
        setPlaylists(storedPlaylists);
        setIsPlaying(false);
        setIsMusicPlayerVisible(true);
        alert(`已成功從拖放的資料夾建立播放清單！`);
    } catch (error) {
        console.error("Failed to handle music drop:", error);
        alert('處理拖放的音樂時發生錯誤。');
    }
  };
  
  const handleLrcUpload = async (file: File | null) => {
      if (!file || !file.name.toLowerCase().endsWith('.lrc')) return;
      const currentTrack = musicTracks[currentTrackIndex];
      if (!currentTrack || currentTrack.dbId <= 0) {
          alert('只能為已上傳的歌曲新增歌詞。');
          return;
      }
      
      try {
        const lrcContent = await file.text();
        await updateTrackLrcInDB(currentTrack.dbId, lrcContent);
        const parsedLrc = parseLRC(lrcContent);
        
        setMusicTracks(prev => prev.map(track => 
            track.dbId === currentTrack.dbId ? { ...track, lrc: parsedLrc } : track
        ));
        setCurrentLrc(parsedLrc);
        alert('歌詞已成功關聯！');
      } catch (error) {
        console.error("Failed to upload lyrics:", error);
        alert('上傳歌詞失敗。');
      }
  };


  const handleClearMusic = async () => {
    if (!confirm('您確定要清除所有已上傳的歌曲和播放清單嗎？這個操作無法復原。')) return;

    try {
        await clearAllTracksFromDB();
        revokeTrackUrls(musicTracks);
        setMusicTracks([]);
        setPlaylists([]);
        setActivePlaylistName('所有音樂');
        setCurrentTrackIndex(0);
        setIsPlaying(false);
        if (audioRef.current) {
            audioRef.current.src = '';
            audioRef.current.pause();
        }
        alert('已清除所有上傳的歌曲和播放清單。');
    } catch(error) {
        console.error("Failed to clear music from DB", error);
        alert('清除歌曲時發生錯誤。');
    }
  };

  const handleSwitchPlaylist = async (name: string) => {
    if (name === '所有音樂') {
        await loadAllUserTracks();
        return;
    }
    
    try {
        const storedPlaylists = await getPlaylistsFromDB();
        const playlist = storedPlaylists.find(p => p.name === name);
        if (!playlist || playlist.trackIds.length === 0) {
            alert('找不到此播放清單或清單為空。');
            setMusicTracks([]); // Clear tracks if playlist is empty
            setCurrentTrackIndex(0);
            setActivePlaylistName(name);
            return;
        }

        const tracksFromDB = await Promise.all(
            playlist.trackIds.map(id => getTrackFromDB(id))
        );

        const loadedTracks = tracksFromDB
            .filter((t): t is NonNullable<typeof t> => t != null)
            .map(t => ({
                name: t.name,
                url: URL.createObjectURL(t.file),
                dbId: t.id,
                lrc: t.lrc ? parseLRC(t.lrc) : undefined,
            }));
        
        setMusicTracks(currentTracks => {
            revokeTrackUrls(currentTracks);
            return loadedTracks;
        });
        setCurrentTrackIndex(0);
        setActivePlaylistName(name);

    } catch (error) {
        console.error("Failed to switch playlist:", error);
        alert('切換播放清單失敗。');
    }
  };

  const handleDeleteTrack = async (trackDbId: number) => {
    const trackToDelete = musicTracks.find(t => t.dbId === trackDbId);
    if (!trackToDelete) return;

    const confirmMessage = activePlaylistName === '所有音樂'
        ? `您確定要從資料庫中永久刪除 "${trackToDelete.name}" 嗎？`
        : `您確定要從播放清單 "${activePlaylistName}" 中移除 "${trackToDelete.name}" 嗎？`;
    
    if (!confirm(confirmMessage)) return;

    try {
        if (activePlaylistName === '所有音樂') {
            await deleteTrackFromDB(trackDbId);
        } else {
            await removeTrackFromPlaylistInDB(activePlaylistName, trackDbId);
        }
        
        await handleSwitchPlaylist(activePlaylistName);
        const storedPlaylists = await getPlaylistsFromDB();
        setPlaylists(storedPlaylists);

    } catch (error) {
        console.error("Failed to delete track:", error);
        alert('刪除歌曲時發生錯誤。');
    }
  };

  const handleSaveCurrentTracksAsPlaylist = async () => {
    if (musicTracks.length === 0) {
        alert('目前列表沒有歌曲可以儲存。');
        return;
    }

    const newName = prompt('請輸入新播放清單的名稱:', activePlaylistName.startsWith('我的上傳') ? activePlaylistName : '新清單');
    if (!newName || newName.trim() === '') {
        alert('播放清單名稱不能為空。');
        return;
    }

    const existingPlaylist = playlists.find(p => p.name === newName);
    if (existingPlaylist) {
        if (!confirm(`播放清單 "${newName}" 已存在。您要覆蓋它嗎？`)) {
            return;
        }
    }
    
    try {
        const trackIds = musicTracks.map(track => track.dbId);
        await savePlaylistToDB(newName, trackIds);
        
        const storedPlaylists = await getPlaylistsFromDB();
        setPlaylists(storedPlaylists);
        
        // Switch to the new/updated playlist
        await handleSwitchPlaylist(newName);
        
        alert(`播放清單 "${newName}" 已成功儲存！`);
    } catch (error) {
        console.error("Failed to save playlist:", error);
        alert('儲存播放清單時發生錯誤。');
    }
  };

  const handleExportPlaylists = async () => {
    try {
        const allTracks = await getAllTracksFromDB();
        const allPlaylists = await getPlaylistsFromDB();

        const exportedTracks: ExportedTrack[] = allTracks.map((track) => ({
            id: track.id,
            name: track.name,
            fileName: track.file.name,
            lrc: track.lrc,
        }));

        const backupData: BackupData = {
            version: 2,
            tracks: exportedTracks,
            playlists: allPlaylists,
        };

        const jsonString = JSON.stringify(backupData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `birdnest-music-backup-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        alert('已成功匯出您的音樂庫元數據！');
    } catch (error) {
        console.error("Failed to export playlists:", error);
        alert('匯出時發生錯誤。');
    }
  };

    const handleRelinkFolderSelect = (files: FileList | null) => {
        if (!files || !linkingMetadataRef.current) return;

        const relinkAndLoad = async () => {
            const backupData = linkingMetadataRef.current;
            if (!backupData) return;

            try {
                const uploadedFiles = Array.from(files);
                const tracksToLink = backupData.tracks;

                await clearAllTracksFromDB();
                
                const oldIdToNewId: Record<number, number> = {};
                
                for (const trackMeta of tracksToLink) {
                    const file = uploadedFiles.find(f => f.name === trackMeta.fileName);
                    if (file) {
                        const newId = await addTrackToDB({
                            name: trackMeta.name,
                            file: file,
                            lrc: trackMeta.lrc,
                        });
                        oldIdToNewId[trackMeta.id] = newId;
                    }
                }
                
                for (const playlistMeta of backupData.playlists) {
                    const newTrackIds = playlistMeta.trackIds
                        .map(oldId => oldIdToNewId[oldId])
                        .filter(Boolean);
                    if (newTrackIds.length > 0) {
                        await savePlaylistToDB(playlistMeta.name, newTrackIds);
                    }
                }
                
                await loadAllUserTracks();
                const storedPlaylists = await getPlaylistsFromDB();
                setPlaylists(storedPlaylists);

                const linkedCount = Object.keys(oldIdToNewId).length;
                const unlinkedCount = tracksToLink.length - linkedCount;

                if (unlinkedCount > 0) {
                    alert(`音樂庫已部分匯入！成功連結 ${linkedCount} 首歌曲，有 ${unlinkedCount} 首歌曲在所選資料夾中找不到對應檔案。`);
                } else {
                    alert('音樂庫已成功匯入並重新連結！');
                }

            } catch(e) {
                console.error("Failed to relink music library:", e);
                alert(`重新連結音樂庫時發生錯誤: ${e instanceof Error ? e.message : String(e)}`);
            } finally {
                linkingMetadataRef.current = null;
            }
        };
        relinkAndLoad();
    };

  const handleImportPlaylists = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const inputElement = event.target;
    if (!file) {
        inputElement.value = '';
        return;
    }

    if (!confirm('匯入將會覆蓋您目前的音樂庫，確定要繼續嗎？')) {
        inputElement.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const jsonString = e.target?.result as string;
            const backupData: BackupData = JSON.parse(jsonString);

            if (backupData.version === 2 && backupData.tracks && backupData.playlists) {
                // Store metadata in the ref and immediately trigger the folder selection.
                // This is more reliable as it's in the same event chain.
                linkingMetadataRef.current = backupData;
                musicUploadRefForLink.current?.click();
            } else {
                throw new Error('無效或不支援的備份檔案格式。請使用 v2 版本的備份檔。');
            }
        } catch (error) {
            console.error("Failed to import playlists:", error);
            alert(`匯入時發生錯誤: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            inputElement.value = ''; // Reset file input
        }
    };
    reader.onerror = () => {
        alert('讀取備份檔失敗。');
        inputElement.value = '';
    };
    reader.readAsText(file);
  };

  const handleReloadFromLocal = async () => {
    await loadAllUserTracks();
    alert('已從本地儲存重新載入所有音樂。');
  };

  const handleToggleShuffle = () => {
    setIsShuffle(prev => !prev);
  };

  const handleCycleRepeatMode = () => {
    setRepeatMode(prev => {
        if (prev === 'off') return 'all';
        if (prev === 'all') return 'one';
        return 'off';
    });
  };
  
  const getNextZIndex = () => {
    if (elements.length === 0) return 1;
    return Math.max(...elements.map(e => e.zIndex)) + 1;
  };
  
  const screenToCanvasCoords = (screenPoint: Point): Point => {
    return {
      x: (screenPoint.x - viewport.pan.x) / viewport.zoom,
      y: (screenPoint.y - viewport.pan.y) / viewport.zoom,
    };
  };

  const addElement: AddElementFn = (element: Omit<CanvasElement, 'id' | 'zIndex'>, sourcePrompt?: string) => {
    const newElement: CanvasElement = {
      ...element,
      id: uuidv4(),
      zIndex: getNextZIndex(),
    } as CanvasElement;
    
    setElements(prev => {
        let nextElements = [...prev];
        if (!welcomeNotesDeletedRef.current && prev.some(el => initialNoteIds.has(el.id))) {
            nextElements = nextElements.filter(el => !initialNoteIds.has(el.id));
            welcomeNotesDeletedRef.current = true;
        }
        return [...nextElements, newElement];
    });

    setSelectedElementIds([newElement.id]);
    setSinglySelectedIdInGroup(null);

    if (sourcePrompt && (newElement.type === 'image' || newElement.type === 'drawing')) {
        setPrompts(p => ({ ...p, [newElement.id]: sourcePrompt }));
    }
  };
  
  const addNote = () => {
    const center = screenToCanvasCoords({ x: canvasSize.width / 2, y: canvasSize.height / 2 });
    const content = 'New Note';
    const width = 200;
    const fontSize = 16;
    const height = calculateNoteHeight(content, width, fontSize);
    
    addElement({
      type: 'note',
      position: { x: center.x - width / 2, y: center.y - height / 2 },
      width, height, rotation: 0,
      content,
      color: RANDOM_GRADIENTS[Math.floor(Math.random() * RANDOM_GRADIENTS.length)],
      fontSize
    });
  };

  const addPlaceholder = () => {
    const center = screenToCanvasCoords({ x: canvasSize.width / 2, y: canvasSize.height / 2 });
    const width = 300;
    const height = 200;
    
    addElement({
      type: 'placeholder',
      position: { x: center.x - width / 2, y: center.y - height / 2 },
      width, height, rotation: 0,
    } as Omit<PlaceholderElement, 'id' | 'zIndex'>);
};

const addImageCompare = () => {
    const center = screenToCanvasCoords({ x: canvasSize.width / 2, y: canvasSize.height / 2 });
    const width = 600;
    const height = 400;
    
    addElement({
        type: 'imageCompare',
        position: { x: center.x - width / 2, y: center.y - height / 2 },
        width, 
        height, 
        rotation: 0,
        srcBefore: '',
        intrinsicWidthBefore: 0,
        intrinsicHeightBefore: 0,
        srcAfter: '',
        intrinsicWidthAfter: 0,
        intrinsicHeightAfter: 0,
    });
};

  const handleImageFile = async (file: File | null, position?: Point, autoInspire = false) => {
    if (!file || !file.type.startsWith('image/')) return;
    
    try {
        const dataUrl = `data:${file.type};base64,${await fileToBase64(file)}`;
        const img = new Image();
        img.onload = () => {
            const imageCenter = position ? position : screenToCanvasCoords({ x: canvasSize.width / 2, y: canvasSize.height / 2 });
            const aspectRatio = img.width / img.height;
            const width = canvasSize.width / 4 / viewport.zoom;
            const height = width / aspectRatio;
            
            const newImageElementData: Omit<ImageElement, 'id' | 'zIndex'> = {
                type: 'image',
                position: { x: imageCenter.x - width / 2, y: imageCenter.y - height / 2 },
                width, height, rotation: 0,
                src: dataUrl,
                intrinsicWidth: img.width,
                intrinsicHeight: img.height,
            };

            if (autoInspire) {
                (newImageElementData as any).meta = { autoInspire: true };
            }

            addElement(newImageElementData);
        };
        img.onerror = () => {
            console.error("Failed to load image from Data URL.");
            alert("無法載入圖片。");
        }
        img.src = dataUrl;
    } catch (error) {
        console.error("Error reading file:", error);
        alert("讀取圖片檔案時發生錯誤。");
    };
  };
  
  const handleFileUploads = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const isBulk = files.length > 1;
    const position = screenToCanvasCoords({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    const filesArray = Array.from(files);

    for (let i = 0; i < Math.min(filesArray.length, 8); i++) {
        const file = filesArray[i];
        const offsetPosition = { x: position.x + i * 50, y: position.y + i * 50 };
        // Disable auto-inspire for bulk uploads
        await handleImageFile(file, offsetPosition, !isBulk);
    }
  };

  const addImageFromUpload = () => fileInputRef.current?.click();

  const addImageFromUrl = (src: string, intrinsicWidth: number, intrinsicHeight: number, position?: Point, meta?: Record<string, any>, sourcePrompt?: string) => {
    const center = position || screenToCanvasCoords({ x: canvasSize.width / 2, y: canvasSize.height / 2 });
    const aspectRatio = intrinsicWidth / intrinsicHeight;
    const width = canvasSize.width / 4 / viewport.zoom;
    const height = width / aspectRatio;
    const finalPosition = position ? center : { x: center.x - width / 2, y: center.y - height / 2 };
    
    const newImageElementData: Omit<ImageElement, 'id' | 'zIndex'> = {
        type: 'image',
        position: finalPosition,
        width, height, rotation: 0,
        src, intrinsicWidth, intrinsicHeight,
    };

    if (meta) {
        (newImageElementData as any).meta = meta;
    }

    addElement(newImageElementData, sourcePrompt);
  };
  
  const addDrawing = (src: string, width: number, height: number) => {
      const center = screenToCanvasCoords({ x: canvasSize.width / 2, y: canvasSize.height / 2 });
      const aspectRatio = width / height;
      const newWidth = 300;
      const newHeight = newWidth / aspectRatio;
      addElement({
        type: 'drawing',
        position: { x: center.x - newWidth / 2, y: center.y - newHeight / 2 },
        width: newWidth, height: newHeight, rotation: 0,
        src,
      });
  };

  const updateElements = (updates: { id: string; data: Partial<CanvasElement> }[], addToHistory: boolean = true) => {
    const elementsMap = new Map(elements.map(e => [e.id, e]));
    const augmentedUpdates = updates.map(update => {
        const el = elementsMap.get(update.id);
        if (el?.type === 'note') {
            const noteUpdateData = update.data as Partial<NoteElement>;
            if (noteUpdateData.content !== undefined || noteUpdateData.fontSize !== undefined || noteUpdateData.width !== undefined) {
                const newContent = noteUpdateData.content ?? el.content;
                const newFontSize = noteUpdateData.fontSize ?? el.fontSize;
                const newWidth = noteUpdateData.width ?? el.width;
                const newHeight = calculateNoteHeight(newContent, newWidth, newFontSize);
                return { ...update, data: { ...update.data, height: newHeight } };
            }
        }
        return update;
    });

    setElements(
      prev => prev.map(el => {
        const update = augmentedUpdates.find(u => u.id === el.id);
        return update ? { ...el, ...update.data } as CanvasElement : el;
      }),
      { addToHistory }
    );
  };
  
  const handleCommitHistory = (updates: { id: string; data: Partial<CanvasElement> }[]) => {
      setElements(prev => prev.map(el => {
        const update = updates.find(u => u.id === el.id);
        if (update) {
            return { ...el, ...update.data } as CanvasElement;
        }
        return el;
      }), { addToHistory: true });
  }

  const handleSelectElements = (ids: string[], additive = false) => {
    const clickedElement = ids.length === 1 ? elements.find(el => el.id === ids[0]) : null;

    if (clickedElement && clickedElement.groupId && lockedGroupIds.has(clickedElement.groupId) && selectedElementIds.includes(clickedElement.id)) {
        setSinglySelectedIdInGroup(prevId => prevId === clickedElement.id ? null : clickedElement.id);
        return;
    }
    
    setSinglySelectedIdInGroup(null);
    let finalSelection = new Set<string>();
    
    const groupId = clickedElement?.groupId;
    if (groupId && lockedGroupIds.has(groupId)) {
        elements.forEach(el => {
            if (el.groupId === groupId) finalSelection.add(el.id);
        });
    } else if (additive) {
        finalSelection = new Set(selectedElementIds);
        ids.forEach(id => {
            if (finalSelection.has(id)) {
                if (selectedElementIds.length > 1) finalSelection.delete(id);
            } else {
                finalSelection.add(id);
            }
        });
    } else {
        finalSelection = new Set(ids);
    }
    setSelectedElementIds(Array.from(finalSelection));
    if (ids.length === 1) {
        setLastInteractedLayerId(ids[0]);
    }
  };

    const handleLayerSelect = (clickedId: string, e: React.MouseEvent) => {
        const isCmdCtrl = e.metaKey || e.ctrlKey;
        const isShift = e.shiftKey;

        const sortedElements = [...elements].sort((a, b) => b.zIndex - a.zIndex);
        const sortedIds = sortedElements.map(el => el.id);

        let newSelectedIds: string[];

        if (isShift && lastInteractedLayerId) {
            const lastIdx = sortedIds.indexOf(lastInteractedLayerId);
            const currentIdx = sortedIds.indexOf(clickedId);
            if (lastIdx !== -1 && currentIdx !== -1) {
                const start = Math.min(lastIdx, currentIdx);
                const end = Math.max(lastIdx, currentIdx);
                newSelectedIds = sortedIds.slice(start, end + 1);
            } else {
                newSelectedIds = [clickedId];
            }
        } else if (isCmdCtrl) {
            const newSelectionSet = new Set(selectedElementIds);
            if (newSelectionSet.has(clickedId)) {
                newSelectionSet.delete(clickedId);
            } else {
                newSelectionSet.add(clickedId);
            }
            newSelectedIds = Array.from(newSelectionSet);
        } else {
            newSelectedIds = [clickedId];
        }

        setSelectedElementIds(newSelectedIds);
        setLastInteractedLayerId(clickedId);
    };

  const deleteElements = (ids: string[]) => {
    setElements(prev => prev.filter(el => !ids.includes(el.id)));
    setSelectedElementIds(prev => prev.filter(id => !ids.includes(id)));
    setConnections(prev => prev.filter(c => !ids.includes(c.sourceId) && !ids.includes(c.targetId)));
    setSinglySelectedIdInGroup(null);
  };

  const duplicateElements = (ids: string[]) => {
    const elementsToDuplicate = elements.filter(el => ids.includes(el.id));
    if (elementsToDuplicate.length === 0) return;
    
    const newElements: CanvasElement[] = elementsToDuplicate.map(el => ({
      ...el,
      id: uuidv4(),
      position: { x: el.position.x + 20, y: el.position.y + 20 },
      zIndex: getNextZIndex(),
      groupId: undefined,
    }));
    setElements(prev => [...prev, ...newElements]);
    setSelectedElementIds(newElements.map(el => el.id));
    setSinglySelectedIdInGroup(null);
  };
  
    const handleAltDragDuplicate = (elementsToCreate: Omit<CanvasElement, 'id' | 'zIndex'>[], revertUpdates: { id: string, data: Partial<CanvasElement> }[]) => {
        const newElements: CanvasElement[] = elementsToCreate.map(el => ({
            ...el,
            id: uuidv4(),
            zIndex: getNextZIndex(),
            groupId: undefined,
        } as CanvasElement));
        
        setElements(prev => {
            const revertedPrev = prev.map(p => {
                const revertUpdate = revertUpdates.find(r => r.id === p.id);
                return revertUpdate ? { ...p, ...revertUpdate.data } as CanvasElement : p;
            });
            return [...revertedPrev, ...newElements];
        }, { addToHistory: true });
        
        setSelectedElementIds(newElements.map(el => el.id));
        setSinglySelectedIdInGroup(null);
    };
  
  const reorderElements = (direction: 'front' | 'back', ids: string[]) => {
    if (elements.length < 2 || ids.length === 0) return;
    const zIndexes = elements.map(e => e.zIndex);
    const updates: {id: string, data: Partial<CanvasElement>}[] = [];

    if (direction === 'front') {
        const maxZ = Math.max(...zIndexes);
        ids.forEach(id => updates.push({ id, data: { zIndex: maxZ + 1 } }));
    } else {
        const minZ = Math.min(...zIndexes);
        ids.forEach(id => updates.push({ id, data: { zIndex: minZ - 1 } }));
    }
    updateElements(updates);
  };
  
  const handleLayerReorder = (elementId: string, newVisualIndex: number) => {
    const sortedElements = [...elements].sort((a, b) => b.zIndex - a.zIndex);
    const targetZ = sortedElements[newVisualIndex]?.zIndex;
    const prevZ = sortedElements[newVisualIndex - 1]?.zIndex;
    
    let newZIndex: number;
    if (targetZ !== undefined && prevZ !== undefined) {
      newZIndex = (targetZ + prevZ) / 2;
    } else if (targetZ !== undefined) {
      newZIndex = targetZ - 1;
    } else if (prevZ !== undefined) {
      newZIndex = prevZ + 1;
    } else {
      newZIndex = getNextZIndex();
    }
    
    updateElements([{ id: elementId, data: { zIndex: newZIndex }}]);
  };

  const downloadImage = (src: string, filename: string) => {
    const link = document.createElement('a');
    link.href = src;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadImageElement = (elementId: string) => {
    const element = elements.find(el => el.id === elementId);
    if (element && (element.type === 'image' || element.type === 'drawing')) {
        downloadImage(element.src, `${element.type}-${element.id}.png`);
    }
  };
  
    const getRandomInspirationExamples = () => {
      const allItems = ULTIMATE_EDITING_GUIDE.flatMap(cat => cat.items);
      const shuffled = allItems.sort(() => 0.5 - Math.random());
      return shuffled.slice(0, 3).map(item => `- ${item.name}：${item.prompt}`).join('\n');
  };

  const handleRequestInspiration = async (elementId: string) => {
    const element = elements.find(el => el.id === elementId);
    if (!element || (element.type !== 'image' && element.type !== 'drawing' && element.type !== 'note')) return;

    try {
        setIsGenerating(true);
        setGenerationStatus('正在產生靈感...');

        let parts: { inlineData?: { data: string, mimeType: string }, text?: string }[] = [];
        let inspirationPrompt: string = '';

        if (element.type === 'image' || element.type === 'drawing') {
            const { base64, blob } = await dataUrlToBlob(element.src);
            parts.push({ inlineData: { data: base64, mimeType: blob.type } });
            inspirationPrompt = `你是專業的影像創意總監。請分析這張圖片，並以繁體中文提供以下內容：
1.  三個簡潔、有創意且風格各異的修改建議。這些建議應該具體且可執行。
2.  兩個簡短、富想像力且風格各異的文字提示，可用於生成相似或演變版本的圖片。`;
        } else { // Note
             if (!element.content.trim()) {
                alert("便籤內容為空，無法獲取靈感。");
                setIsGenerating(false);
                return;
            }
            inspirationPrompt = `你是專業的創意總監。請分析這段文字，並以繁體中文提供以下內容：
1.  三個簡潔、有創意且風格各異的修改建議，讓內容更豐富或有趣。
2.  兩個簡短、富想像力且風格各異的文字提示，可用於根據此靈感生成圖片。

原始文字: "${element.content}"`;
        }

        const examples = getRandomInspirationExamples();
        inspirationPrompt += `\n\n請參考以下範例格式與風格來提供建議：\n範例：\n${examples}\n\n請嚴格以 JSON 物件格式返回，不要包含任何額外的說明文字。`;
        
        parts.push({ text: inspirationPrompt });
        
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        modificationSuggestions: {
                            type: Type.ARRAY,
                            description: "An array of 3 creative and distinct suggestions for modifying the image.",
                            items: { type: Type.STRING }
                        },
                        textPrompts: {
                            type: Type.ARRAY,
                            description: "An array of 2 imaginative and distinct text prompts for generating a similar or evolved image.",
                            items: { type: Type.STRING }
                        }
                    },
                    required: ["modificationSuggestions", "textPrompts"]
                }
            }
        });
        
        const jsonText = response.text.trim();
        const inspiration = JSON.parse(jsonText);
        
        setInspirationData({
            modificationSuggestions: inspiration.modificationSuggestions || [],
            textPrompts: inspiration.textPrompts || [],
        });
        setIsInspirationModalOpen(true);

    } catch (error) {
        console.error("Inspiration Generation Error:", error);
        alert(`Failed to get inspiration: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
        setIsGenerating(false);
    }
  };

  const onOptimizeSingleElementPrompt = async (elementId: string) => {
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    try {
        setIsGenerating(true);
        setGenerationStatus('正在優化提示...');
        
        let parts: { inlineData?: { data: string, mimeType: string }, text?: string }[] = [];
        let optimizationPrompt = '';

        if (element.type === 'image' || element.type === 'drawing') {
            const currentPrompt = prompts[elementId] || '';
            if (!currentPrompt.trim()) {
                alert("請先輸入一個提示。");
                setIsGenerating(false);
                return;
            }
            const { base64, blob } = await dataUrlToBlob(element.src);
            parts.push({ inlineData: { data: base64, mimeType: blob.type } });
            optimizationPrompt = `基於這張圖片，請將以下提示改寫得更具體、更富創意，並以繁體中文返回一個優化後的單一提示句，不要添加任何額外說明文字：'${currentPrompt}'`;
        } else if (element.type === 'note') {
            if (!element.content.trim()) {
                alert("便籤內容為空，無法進行優化。");
                setIsGenerating(false);
                return;
            }
            optimizationPrompt = `You are a professional editor. Rewrite and enhance the following text to make it more vivid, detailed, and impactful. The response should be a direct replacement for the original text. Respond in Traditional Chinese. Original text: "${element.content}"`;
        } else {
             setIsGenerating(false);
             return;
        }

        parts.push({ text: optimizationPrompt });

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts },
        });
        
        const optimizedText = response.text.trim();

        if (element.type === 'note') {
            updateElements([{ id: elementId, data: { content: optimizedText } }]);
        } else {
            setPrompts(p => ({...p, [elementId]: optimizedText }));
        }

    } catch (error) {
        console.error("Optimization Error:", error);
        alert(`優化時發生錯誤: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
        setIsGenerating(false);
    }
  };

  const handleNoteInspiration = (noteId: string) => handleRequestInspiration(noteId);
  const handleNoteOptimization = (noteId: string) => onOptimizeSingleElementPrompt(noteId);
  
  const handleNoteGenerate = async (noteId: string) => {
    const element = elements.find(el => el.id === noteId) as NoteElement;
    if (!element || !element.content.trim()) {
        alert("請先在便籤中輸入提示。");
        return;
    }

    const prompt = element.content;
    const artStyle = artStyles[noteId] || '';
    const aspectRatio = aspectRatios[noteId] || 1; // Default to 1:1 if not specified
    const isNCLNote = !!element.meta?.nclCategory;
    const cinematicPrompt = "cinematic film still, shot on Kodak Vision3 500T film stock, anamorphic lens, beautiful bokeh, subtle motion blur, detailed film grain, professional cinematic color grading, hyper-detailed, 8K, UHD. 人物比例要正常（甚至美化），不要大頭小身體 --no cgi, 3d render, animation, video game, digital art, illustration, cartoon";

    try {
        setIsGenerating(true);
        
        let fullPrompt = prompt;
        if (artStyle && artStyle !== '無風格 (None)') {
            fullPrompt = `${prompt}, ${artStyle.split(' (')[0]}`;
        } else if (isNCLNote) {
            fullPrompt = `${prompt}, ${cinematicPrompt}`;
        }
        
        const parts: {inlineData?: {data: string, mimeType: string}; text?: string}[] = [];

        setGenerationStatus('正在準備長寬比參考圖...');
        const grayImageB64 = createGrayImage(aspectRatio).split(',')[1];
        parts.push({ inlineData: { data: grayImageB64, mimeType: 'image/png' } });
        fullPrompt += ' ' + ASPECT_RATIO_PROMPT;

        if (fullPrompt) {
            parts.push({ text: fullPrompt });
        } else {
             throw new Error("Prompt cannot be empty for generation.");
        }
        
        setGenerationStatus('正在呼叫 AI 模型...');
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: { parts },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });
        
        setGenerationStatus('正在處理回應中...');
        const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);

        if (imagePart?.inlineData) {
            const newBase64 = imagePart.inlineData.data;
            const newMimeType = imagePart.inlineData.mimeType;
            let newSrc = `data:${newMimeType};base64,${newBase64}`;
            
            let finalIntrinsicWidth = 512;
            let finalIntrinsicHeight = 512 / aspectRatio;
            
            setGenerationStatus('正在校正圖片比例...');
            try {
                const corrected = await correctImageAspectRatio(newSrc, aspectRatio);
                newSrc = corrected.url;
                finalIntrinsicWidth = corrected.width;
                finalIntrinsicHeight = corrected.height;
            } catch (e) {
                console.error("Could not correct aspect ratio, using original.", e);
                 const img = await new Promise<HTMLImageElement>((resolve, reject) => {
                    const i = new Image();
                    i.onload = () => resolve(i);
                    i.onerror = reject;
                    i.src = newSrc;
                });
                finalIntrinsicWidth = img.width;
                finalIntrinsicHeight = img.height;
            }
            
            downloadImage(newSrc, `ai-note-generated-${Date.now()}.png`);
            
            addImageFromUrl(newSrc, finalIntrinsicWidth, finalIntrinsicHeight, {
                x: element.position.x + element.width + 20,
                y: element.position.y
            }, undefined, prompt);
        } else {
            throw new Error("AI did not return an image.");
        }
    } catch (error) {
        console.error("Note AI Generation Error:", error);
        alert(`從便籤生成圖片時發生錯誤: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
        setIsGenerating(false);
    }
  };

  const handleAIGenerate = async (elementId: string) => {
    const element = elements.find(el => el.id === elementId) as ImageElement | DrawingElement;
    if (!element || (element.type !== 'image' && element.type !== 'drawing')) return;
    
    const prompt = prompts[elementId] || '';
    const aspectRatio = aspectRatios[elementId];
    const style = artStyles[elementId] || '';

    try {
        setIsGenerating(true);
        setGenerationStatus('準備圖片中...');
        const { blob, base64 } = await dataUrlToBlob(element.src);
        
        let fullPrompt = (style && style !== '無風格 (None)') ? (prompt ? `${prompt}, ${style.split(' (')[0]}` : style.split(' (')[0]) : prompt;
        const parts: {inlineData?: {data: string, mimeType: string}; text?: string}[] = [];

        if (aspectRatio) {
            setGenerationStatus('正在準備長寬比參考圖...');
            const grayImageB64 = createGrayImage(aspectRatio).split(',')[1];
            parts.push({ inlineData: { data: grayImageB64, mimeType: 'image/png' } });
            fullPrompt += ' ' + ASPECT_RATIO_PROMPT;
        }

        parts.push({ inlineData: { data: base64, mimeType: blob.type } });
        if (fullPrompt) {
            parts.push({ text: fullPrompt });
        }
        
        setGenerationStatus('呼叫 AI 模型...');
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: { parts },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });
        
        setGenerationStatus('處理回應中...');
        const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);

        if (imagePart?.inlineData) {
            const newBase64 = imagePart.inlineData.data;
            const newMimeType = imagePart.inlineData.mimeType;
            let newSrc = `data:${newMimeType};base64,${newBase64}`;
            
            let finalIntrinsicWidth = (element as ImageElement).intrinsicWidth || element.width;
            let finalIntrinsicHeight = (element as ImageElement).intrinsicHeight || element.height;
            
            if (aspectRatio) {
                setGenerationStatus('正在校正圖片比例...');
                try {
                    const corrected = await correctImageAspectRatio(newSrc, aspectRatio);
                    newSrc = corrected.url;
                    finalIntrinsicWidth = corrected.width;
                    finalIntrinsicHeight = corrected.height;
                } catch (e) {
                    console.error("Could not correct aspect ratio, using original.", e);
                     const img = await new Promise<HTMLImageElement>((resolve, reject) => {
                        const i = new Image();
                        i.onload = () => resolve(i);
                        i.onerror = reject;
                        i.src = newSrc;
                    });
                    finalIntrinsicWidth = img.width;
                    finalIntrinsicHeight = img.height;
                }
            }
            
            downloadImage(newSrc, `ai-generated-${Date.now()}.png`);

            const newAspectRatio = finalIntrinsicWidth > 0 && finalIntrinsicHeight > 0 ? finalIntrinsicWidth / finalIntrinsicHeight : 1;
            const newDisplayHeight = element.width / newAspectRatio;

            addElement({
                type: 'imageCompare',
                position: { x: element.position.x + 20, y: element.position.y + 20 },
                width: element.width,
                height: newDisplayHeight,
                rotation: 0,
                srcBefore: element.src,
                intrinsicWidthBefore: (element as ImageElement).intrinsicWidth || element.width,
                intrinsicHeightBefore: (element as ImageElement).intrinsicHeight || element.height,
                srcAfter: newSrc,
                intrinsicWidthAfter: finalIntrinsicWidth,
                intrinsicHeightAfter: finalIntrinsicHeight,
            }, prompt);
        } else {
            throw new Error("AI did not return an image.");
        }
    } catch (error) {
        console.error("AI Generation Error:", error);
        alert(`An error occurred during AI generation: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
        setIsGenerating(false);
    }
  };
  
  const handleAIZoomOut = async (elementId: string) => {
    const element = elements.find(el => el.id === elementId) as ImageElement | DrawingElement;
    if (!element || (element.type !== 'image' && element.type !== 'drawing')) return;

    const prompt = prompts[elementId] || '';
    const aspectRatio = aspectRatios[elementId];
    const style = artStyles[elementId] || '';
    const sourcePrompt = prompt;

    try {
        setIsGenerating(true);
        setGenerationStatus('正在執行 AI 擴展...');
        const { blob, base64 } = await dataUrlToBlob(element.src);
        
        const parts: {inlineData?: {data: string, mimeType: string}; text?: string}[] = [];
        
        const userContentPrompt = (style && style !== '無風格 (None)') 
            ? (prompt ? `${prompt}, ${style.split(' (')[0]}` : style.split(' (')[0]) 
            : prompt;

        let fullPrompt = "Zoom out from the central color image, intelligently filling the new surrounding areas to create a wider, cohesive scene. Maintain the original image's core content and style.";
        if (userContentPrompt) {
            fullPrompt += ` The new areas should incorporate these themes or styles: "${userContentPrompt}"`;
        }

        if (aspectRatio) {
            setGenerationStatus('正在準備長寬比參考圖...');
            const grayImageB64 = createGrayImage(aspectRatio).split(',')[1];
            parts.push({ inlineData: { data: grayImageB64, mimeType: 'image/png' } });
            fullPrompt += ' ' + ASPECT_RATIO_PROMPT;
        }
        
        parts.push({ inlineData: { data: base64, mimeType: blob.type } });
        parts.push({ text: fullPrompt });
        
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: { parts },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });
        
        const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);

        if (imagePart?.inlineData) {
            const newBase64 = imagePart.inlineData.data;
            const newMimeType = imagePart.inlineData.mimeType;
            const newSrc = `data:${newMimeType};base64,${newBase64}`;
            
            downloadImage(newSrc, `ai-zoom-out-${Date.now()}.png`);

            const img = await new Promise<HTMLImageElement>((resolve, reject) => {
                const i = new Image();
                i.onload = () => resolve(i);
                i.onerror = reject;
                i.src = newSrc;
            });
            
            const newIntrinsicWidth = img.width;
            const newIntrinsicHeight = img.height;

            const newDisplayWidth = element.width * 1.5;
            const finalAspectRatio = aspectRatio || (newIntrinsicWidth > 0 ? newIntrinsicWidth / newIntrinsicHeight : 1);
            const newDisplayHeight = newDisplayWidth / finalAspectRatio;
            
            const newX = element.position.x - (newDisplayWidth - element.width) / 2;
            const newY = element.position.y - (newDisplayHeight - element.height) / 2;

            addElement({
                type: 'imageCompare',
                position: { x: newX, y: newY },
                width: newDisplayWidth,
                height: newDisplayHeight,
                rotation: 0,
                srcBefore: element.src,
                intrinsicWidthBefore: (element as ImageElement).intrinsicWidth || element.width,
                intrinsicHeightBefore: (element as ImageElement).intrinsicHeight || element.height,
                srcAfter: newSrc,
                intrinsicWidthAfter: newIntrinsicWidth,
                intrinsicHeightAfter: newIntrinsicHeight,
            }, sourcePrompt);
        } else {
            throw new Error("AI did not return an image for zoom out.");
        }
    } catch (error) {
        console.error("AI Zoom Out Error:", error);
        alert(`An error occurred during AI zoom out: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
        setIsGenerating(false);
    }
  };

    const handleCameraCapture = async (dataUrl: string, bgOption: 'transparent' | 'green', placeholderId: string | null = null) => {
      try {
          setIsGenerating(true);
          setGenerationStatus('正在智慧處理中...');
          const { base64, blob } = await dataUrlToBlob(dataUrl);

          let promptText = "Perform a full tone-mapping optimization on the foreground subject. Specifically increase the subject's exposure to ensure they are well-lit and not dark, making them look natural and vibrant.";

          if (bgOption === 'green') {
              promptText += " After optimizing, perfectly remove the background and replace it with a solid green screen (#00ff00). The subject must be fully preserved with clean edges.";
          } else { // 'transparent'
              promptText += " After optimizing, perfectly remove the background and make it transparent. The final output must be a PNG with a transparent background.";
          }
          
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
          const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash-image-preview',
              contents: { parts: [
                  { inlineData: { data: base64, mimeType: blob.type } },
                  { text: promptText }
              ]},
              config: { responseModalities: [Modality.IMAGE, Modality.TEXT] }
          });

          const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
          if (!imagePart?.inlineData) {
              throw new Error("AI failed to process the camera image.");
          }
          
          const finalSrc = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
          
          const img = await new Promise<HTMLImageElement>((resolve, reject) => {
              const i = new Image();
              i.onload = () => resolve(i);
              i.onerror = reject;
              i.src = finalSrc;
          });

          if (imageCompareTarget) {
              const { elementId, side } = imageCompareTarget;
              const updates: Partial<ImageCompareElement> = side === 'before'
                  ? { srcBefore: finalSrc, intrinsicWidthBefore: img.width, intrinsicHeightBefore: img.height }
                  : { srcAfter: finalSrc, intrinsicWidthAfter: img.width, intrinsicHeightAfter: img.height };
              updateElements([{ id: elementId, data: updates }]);
          } else if (placeholderId) {
              const placeholder = elements.find(el => el.id === placeholderId);
              if (placeholder && placeholder.type === 'placeholder') {
                  const newImageElement: ImageElement = {
                      id: placeholder.id, type: 'image',
                      position: placeholder.position,
                      width: placeholder.width,
                      height: placeholder.width / (img.width / img.height),
                      rotation: placeholder.rotation, zIndex: placeholder.zIndex,
                      groupId: placeholder.groupId, src: finalSrc,
                      intrinsicWidth: img.width, intrinsicHeight: img.height,
                      meta: { autoInspire: true },
                  };
                  setElements(prev => prev.map(el => el.id === placeholderId ? newImageElement : el));
                  setSelectedElementIds([placeholderId]);
              }
          } else {
              const center = screenToCanvasCoords({ x: canvasSize.width / 2, y: canvasSize.height / 2 });
              const aspectRatio = img.width / img.height;
              const width = canvasSize.width / 4 / viewport.zoom;
              const height = width / aspectRatio;
              addElement({
                  type: 'image', src: finalSrc,
                  intrinsicWidth: img.width, intrinsicHeight: img.height,
                  meta: { autoInspire: true },
                  position: { x: center.x - width / 2, y: center.y - height / 2 },
                  width, height, rotation: 0,
              });
          }
      } catch (error) {
          console.error("Camera Processing Error:", error);
          alert(`處理攝像頭影像時發生錯誤: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
          setIsGenerating(false);
      }
  };
    
    const handleTriggerCameraForCompare = (elementId: string, side: 'before' | 'after') => {
        setImageCompareTarget({ elementId, side });
        setIsTakingPhoto(true);
    };

    const handleTriggerPasteForCompare = async (elementId: string, side: 'before' | 'after') => {
        try {
            if (!navigator.clipboard?.read) {
                alert('您的瀏覽器不支援此功能。');
                return;
            }
            const clipboardItems = await navigator.clipboard.read();
            for (const item of clipboardItems) {
                const imageType = item.types.find(type => type.startsWith('image/'));
                if (imageType) {
                    const blob = await item.getType(imageType);
                    const file = new File([blob], 'pasted_image.png', { type: imageType });
                    
                    const src = `data:${file.type};base64,${await fileToBase64(file)}`;
                    const img = new Image();
                    img.onload = () => {
                        const updates: Partial<ImageCompareElement> = side === 'before'
                            ? { srcBefore: src, intrinsicWidthBefore: img.width, intrinsicHeightBefore: img.height }
                            : { srcAfter: src, intrinsicWidthAfter: img.width, intrinsicHeightAfter: img.height };
                        updateElements([{ id: elementId, data: updates }]);
                    };
                    img.src = src;

                    return;
                }
            }
            alert('剪貼簿中沒有找到圖片。');
        } catch (err) {
            console.error('Failed to paste for compare:', err);
            alert('無法從剪貼簿貼上。這可能是瀏覽器安全限制所致。');
        }
    };


  const replacePlaceholderWithImage = async (placeholderId: string, file: File) => {
    const placeholder = elements.find(el => el.id === placeholderId);
    if (!placeholder || placeholder.type !== 'placeholder') return;

    try {
        const base64Str = await fileToBase64(file);
        const src = `data:${file.type};base64,${base64Str}`;
        const img = new Image();
        img.onload = () => {
            const newImageElement: ImageElement = {
                id: placeholder.id,
                type: 'image',
                position: placeholder.position,
                width: placeholder.width,
                height: placeholder.width / (img.width / img.height), // Maintain aspect ratio based on width
                rotation: placeholder.rotation,
                zIndex: placeholder.zIndex,
                groupId: placeholder.groupId,
                src: src,
                intrinsicWidth: img.width,
                intrinsicHeight: img.height,
                meta: { autoInspire: true },
            };

            setElements(prev => prev.map(el => el.id === placeholderId ? newImageElement : el));
            setSelectedElementIds([placeholderId]);
        };
        img.src = src;
    } catch (error) {
        console.error("Failed to load image for placeholder:", error);
        alert(`無法載入圖片: ${error instanceof Error ? error.message : String(error)}`);
    }
};

const handleFillPlaceholderFromCamera = (placeholderId: string) => {
    setPlaceholderTarget(placeholderId);
    setIsTakingPhoto(true);
};

const handleFillPlaceholderFromPaste = async (placeholderId: string) => {
    try {
        if (!navigator.clipboard?.read) {
            alert('您的瀏覽器不支援此功能。');
            return;
        }
        const clipboardItems = await navigator.clipboard.read();
        for (const item of clipboardItems) {
            const imageType = item.types.find(type => type.startsWith('image/'));
            if (imageType) {
                const blob = await item.getType(imageType);
                const file = new File([blob], 'pasted_image.png', { type: imageType });
                await replacePlaceholderWithImage(placeholderId, file);
                return;
            }
        }
        alert('剪貼簿中沒有找到圖片。');
    } catch (err) {
        console.error('Failed to paste for placeholder:', err);
        alert('無法從剪貼簿貼上。這可能是瀏覽器安全限制所致。');
    }
};

  const handleStartConnection = (sourceId: string, portSide: 'left' | 'right') => {
      const sourceElement = elements.find(el => el.id === sourceId);
      if (!sourceElement) return;

      const startCanvasPoint = {
          x: portSide === 'left' ? sourceElement.position.x : sourceElement.position.x + sourceElement.width,
          y: sourceElement.position.y + sourceElement.height / 2,
      };
      
      const startScreenPoint = {
          x: startCanvasPoint.x * viewport.zoom + viewport.pan.x,
          y: startCanvasPoint.y * viewport.zoom + viewport.pan.y,
      }
      
      setNewConnection({ sourceId: sourceId, sourceSide: portSide, startPoint: startScreenPoint, endPoint: startScreenPoint });
  };

  const handleClearConnections = (elementId: string) => {
    setConnections(prev => prev.filter(c => c.sourceId !== elementId && c.targetId !== elementId));
  };

  const handlePasteFromClipboard = async () => {
    try {
        if (!navigator.clipboard?.read) {
            alert('您的瀏覽器不支援此功能。請使用鍵盤快捷鍵 Cmd/Ctrl + V 從剪貼簿貼上圖片。');
            return;
        }
        const clipboardItems = await navigator.clipboard.read();
        for (const item of clipboardItems) {
            const imageType = item.types.find(type => type.startsWith('image/'));
            if (imageType) {
                const blob = await item.getType(imageType);
                const file = new File([blob], 'pasted_image.png', { type: imageType });
                await handleImageFile(file, undefined, true);
                return;
            }
        }
        alert('剪貼簿中沒有找到圖片。');
    } catch (err) {
        console.error('Failed to paste from clipboard:', err);
        alert('無法從剪貼簿貼上。這可能是瀏覽器安全限制所致。請改用鍵盤快捷鍵 Cmd/Ctrl + V。');
    }
  };
  
  const handleImageFileRef = useRef(handleImageFile);
  useEffect(() => {
      handleImageFileRef.current = handleImageFile;
  });

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
        const activeElement = document.activeElement;
        if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
            return;
        }

        const items = event.clipboardData?.items;
        if (!items) return;

        for (let i = 0; i < items.length; i++) {
            if (items[i].type.startsWith('image/')) {
                const file = items[i].getAsFile();
                if (file) {
                    handleImageFileRef.current(file, undefined, true);
                    event.preventDefault();
                    return;
                }
            }
        }
    };

    window.addEventListener('paste', handlePaste);
    return () => {
        window.removeEventListener('paste', handlePaste);
    };
  }, []);


  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
        if (newConnection) {
            setNewConnection(c => c ? { ...c, endPoint: { x: e.clientX, y: e.clientY } } : null);
        }
    };

    const handleMouseUp = (e: MouseEvent) => {
        if (newConnection) {
            const targetElement = (e.target as HTMLElement).closest('[data-element-id]');
            const targetId = targetElement?.getAttribute('data-element-id');
            const target = targetId ? elements.find(el => el.id === targetId) : null;
            
            if (target && targetId !== newConnection.sourceId) {
                const endCanvasPoint = screenToCanvasCoords(newConnection.endPoint);
                const targetLeftPoint = { x: target.position.x, y: target.position.y + target.height / 2 };
                const targetRightPoint = { x: target.position.x + target.width, y: target.position.y + target.height / 2 };
                
                const distSq = (p1: Point, p2: Point) => (p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2;
                const distToLeft = distSq(endCanvasPoint, targetLeftPoint);
                const distToRight = distSq(endCanvasPoint, targetRightPoint);
                const targetSide = distToLeft < distToRight ? 'left' : 'right';

                if (!connections.some(c => c.sourceId === newConnection.sourceId && c.targetId === targetId)) {
                    setConnections(prev => [...prev, { 
                        id: uuidv4(), 
                        sourceId: newConnection.sourceId, 
                        sourceSide: newConnection.sourceSide, 
                        targetId: targetId, 
                        targetSide 
                    }]);
                }
            }
            setNewConnection(null);
        }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [newConnection, connections, elements, screenToCanvasCoords]);

  const handleAutoInspiration = async (element: CanvasElement) => {
    updateElements([{ id: element.id, data: { meta: undefined } }], false);

    if (element.type !== 'image' && element.type !== 'drawing') return;

    try {
        setIsGenerating(true);
        setGenerationStatus('正在自動分析圖片...');
        
        const { base64, blob } = await dataUrlToBlob((element as ImageElement).src);
        
        const inspirationPrompt = `你是專業的影像創意總監。請分析這張圖片，並以繁體中文提供以下內容：
1.  三個簡潔、有創意且風格各異的修改建議。這些建議應該具體且可執行。
2.  兩個簡短、富想像力且風格各異的文字提示，可用於生成相似或演變版本的圖片。
\n\n請參考以下範例格式與風格來提供建議：\n範例：\n${getRandomInspirationExamples()}\n\n請嚴格以 JSON 物件格式返回，不要包含任何額外的說明文字。`;
        
        const parts = [
            { inlineData: { data: base64, mimeType: blob.type } },
            { text: inspirationPrompt }
        ];

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        modificationSuggestions: {
                            type: Type.ARRAY,
                            description: "An array of 3 creative and distinct suggestions for modifying the image.",
                            items: { type: Type.STRING }
                        },
                        textPrompts: {
                            type: Type.ARRAY,
                            description: "An array of 2 imaginative and distinct text prompts for generating a similar or evolved image.",
                            items: { type: Type.STRING }
                        }
                    },
                    required: ["modificationSuggestions", "textPrompts"]
                }
            }
        });
        
        const jsonText = response.text.trim();
        const inspiration = JSON.parse(jsonText);
        
        setInspirationData({
            modificationSuggestions: inspiration.modificationSuggestions || [],
            textPrompts: inspiration.textPrompts || [],
        });
        setIsInspirationModalOpen(true);

    } catch (error) {
        console.error("Auto Inspiration Error:", error);
        alert(`自動分析圖片時發生錯誤: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
        setIsGenerating(false);
    }
  };
  
  const handleInspirationConfirm = (analyze: boolean) => {
    if (!inspirationConfirm) return;

    const element = elements.find(el => el.id === inspirationConfirm.elementId);
    if (!element) {
        setInspirationConfirm(null);
        return;
    }

    if (analyze) {
        handleAutoInspiration(element);
    } else {
        updateElements([{ id: element.id, data: { meta: undefined } }], false);
    }
    
    setInspirationConfirm(null);
  };

  useEffect(() => {
    const elementToInspire = elements.find(el => el.meta?.autoInspire);
    if (elementToInspire) {
      setInspirationConfirm({ elementId: elementToInspire.id });
    }
  }, [elements]);
  
  const onOptimizeGroupPrompt = async (groupId: string) => {
        const currentPrompt = prompts[groupId] || '';
        if (!currentPrompt.trim()) {
            alert("請先輸入一個提示。");
            return;
        }
        try {
            setIsGenerating(true);
            setGenerationStatus('正在優化提示...');
            const { base64, blob } = await captureGroupToBlob(groupId);

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: {
                    parts: [
                        { inlineData: { data: base64, mimeType: blob.type } },
                        { text: `基於這張圖片，請將以下提示改寫得更具體、更富創意，並以繁體中文返回一個優化後的單一提示句，不要添加任何額外說明文字：'${currentPrompt}'` }
                    ],
                },
            });
            
            const optimizedPrompt = response.text.trim();
            setPrompts(p => ({...p, [groupId]: optimizedPrompt }));

        } catch (error) {
            console.error("Prompt Optimization Error:", error);
            alert(`優化提示時發生錯誤: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setIsGenerating(false);
        }
    };

    const onRequestGroupInspiration = async (groupId: string) => {
        try {
            setIsGenerating(true);
            setGenerationStatus('正在為群組產生靈感...');
            const { base64, blob } = await captureGroupToBlob(groupId);
            
            const inspirationPrompt = `分析此圖片組合，並以繁體中文提供：1. 三個簡潔、有創意且風格各異的修改建議。2. 兩個簡短、富想像力且風格各異的文字提示。請參考以下範例格式與風格來提供建議：\n範例：\n${getRandomInspirationExamples()}\n\n請嚴格以 JSON 物件格式返回，不要包含任何額外的說明文字。`;

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: {
                    parts: [
                        { inlineData: { data: base64, mimeType: blob.type } },
                        { text: inspirationPrompt }
                    ],
                },
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            modificationSuggestions: {
                                type: Type.ARRAY,
                                description: "An array of 3 creative and distinct suggestions for modifying the image.",
                                items: { type: Type.STRING }
                            },
                            textPrompts: {
                                type: Type.ARRAY,
                                description: "An array of 2 imaginative and distinct text prompts for generating a similar or evolved image.",
                                items: { type: Type.STRING }
                            }
                        },
                        required: ["modificationSuggestions", "textPrompts"]
                    }
                }
            });
            
            const jsonText = response.text.trim();
            const inspiration = JSON.parse(jsonText);
            
            setInspirationData({
                modificationSuggestions: inspiration.modificationSuggestions || [],
                textPrompts: inspiration.textPrompts || [],
            });
            setIsInspirationModalOpen(true);

        } catch (error) {
            console.error("Group Inspiration Generation Error:", error);
            alert(`取得群組靈感時發生錯誤: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setIsGenerating(false);
        }
    };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        const isEditing = document.activeElement instanceof HTMLTextAreaElement || document.activeElement instanceof HTMLInputElement;
        if (isEditing) return;

        if (e.key === 'Tab') {
            e.preventDefault();
            const areAnyPanelsOpen = isInspirationPanelOpen || isLayersPanelOpen || isToolbarOpen;
            const shouldOpen = !areAnyPanelsOpen;
            setIsInspirationPanelOpen(shouldOpen);
            setIsLayersPanelOpen(shouldOpen);
            setIsToolbarOpen(shouldOpen);
        }

        if (e.key === ' ' && activeTool !== 'pan') {
            e.preventDefault();
            setPreviousTool(activeTool);
            setActiveTool('pan');
            return;
        }

        const isCtrlCmd = e.metaKey || e.ctrlKey;
        const singleSelected = selectedElements.length === 1 ? selectedElements[0] : null;
        const isLockedGroup = selectedElements.length > 0 && selectedElements[0].groupId && lockedGroupIds.has(selectedElements[0].groupId);
        const groupId = isLockedGroup ? selectedElements[0].groupId : undefined;

        if (isCtrlCmd && e.key === 'z') {
            e.preventDefault();
            if (e.shiftKey) redo(); else undo();
        } else if (isCtrlCmd && e.key === 'd') {
            e.preventDefault();
            duplicateElements(selectedElementIds);
        } else if (isCtrlCmd && e.key === ']') {
            e.preventDefault();
            reorderElements('front', selectedElementIds);
        } else if (isCtrlCmd && e.key === '[') {
            e.preventDefault();
            reorderElements('back', selectedElementIds);
        } else if (e.altKey && e.key === 'c' && singleSelected) {
            if (singleSelected.type === 'image' || singleSelected.type === 'drawing') {
                e.preventDefault();
                setCroppingElement(singleSelected);
            }
        } else if (e.altKey && e.key === 'e' && singleSelected) {
            if (singleSelected.type === 'drawing') {
                e.preventDefault();
                setDrawingToEdit(singleSelected as DrawingElement);
            }
        } else if (e.altKey && e.key.toLowerCase() === 'i') {
            e.preventDefault();
            const idToInspire = singleSelected?.id || groupId;
            if (idToInspire) {
                if (groupId) {
                    onRequestGroupInspiration(groupId);
                } else if (singleSelected) {
                    handleRequestInspiration(singleSelected.id);
                }
            }
        } else if (e.altKey && e.key.toLowerCase() === 'o') {
            e.preventDefault();
            const idToOptimize = singleSelected?.id || groupId;
             if (idToOptimize) {
                if (groupId) {
                    onOptimizeGroupPrompt(groupId);
                } else if (singleSelected) {
                    onOptimizeSingleElementPrompt(singleSelected.id);
                }
            }
        } else if (e.key === 'Backspace' || e.key === 'Delete') {
            deleteElements(selectedElementIds);
        } else if (e.key === 'v') {
            setActiveTool('select');
        } else if (e.key === 'h') {
            setActiveTool('pan');
        } else if (e.key === 'n') {
            addNote();
        } else if (e.key === 'p') {
            addPlaceholder();
        } else if (e.key === 'i') {
            addImageFromUpload();
        } else if (e.key === 'd') {
            setIsDrawing(true);
        } else if (e.key === 'c') {
            setIsTakingPhoto(true);
        } else if (e.key.toLowerCase() === 'x') {
            addImageCompare();
        } else if (e.key === 'a') {
            setActiveTool('arrow');
        }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
        if (e.key === ' ') {
            e.preventDefault();
            setActiveTool(previousTool);
        }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
    };
  }, [undo, redo, selectedElementIds, elements, selectedElements, activeTool, previousTool, lockedGroupIds, isInspirationPanelOpen, isLayersPanelOpen, isToolbarOpen]);

  const handleOpenContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu(null); 
    
    const clickedElementId = (e.target as HTMLElement).closest('[data-element-id]')?.getAttribute('data-element-id');
    const clickedElement = clickedElementId ? elements.find(el => el.id === clickedElementId) : null;
    
    const items: ContextMenuItem[] = [
        { label: '新增便籤', action: addNote },
        { label: '新增箭頭', action: () => setActiveTool('arrow')},
        { label: '新增圖片...', action: addImageFromUpload },
        { label: '新增空圖層', action: addPlaceholder },
        { label: '從剪貼簿貼上 (Cmd+V)', action: handlePasteFromClipboard },
        { label: '繪圖...', action: () => setIsDrawing(true) },
        { label: '攝像頭...', action: () => setIsTakingPhoto(true) },
        { type: 'separator' },
        { label: '復原', action: undo, disabled: !canUndo },
        { label: '重做', action: redo, disabled: !canRedo },
    ];

    if (clickedElement && (clickedElement.type === 'image' || clickedElement.type === 'drawing')) {
        items.unshift({ type: 'separator' });
        items.unshift({ label: '下載圖片', action: () => downloadImageElement(clickedElement.id) });
    }
    setContextMenu({ x: e.clientX, y: e.clientY, items });
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
     if (!e.dataTransfer.types.includes('application/x-birdnest-layer')) {
        setIsDraggingOver(true);
    }
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.types.includes('application/x-birdnest-layer')) {
        return;
    }
    if (e.dataTransfer.files?.length) {
        const files = Array.from(e.dataTransfer.files);
        const isBulk = files.length > 1;
        const dropPoint = screenToCanvasCoords({ x: e.clientX, y: e.clientY });
        for (let i = 0; i < Math.min(files.length, 8); i++) {
            const file = files[i];
            const offsetPosition = { x: dropPoint.x + i * 50, y: dropPoint.y + i * 50 };
            handleImageFile(file, offsetPosition, !isBulk);
        }
    }
  };

  const fitScreenToElements = (elementsToFit: CanvasElement[]) => {
    if (elementsToFit.length === 0) return;
    const bounds = getElementsBounds(elementsToFit);
    const contentWidth = bounds.maxX - bounds.minX;
    const contentHeight = bounds.maxY - bounds.minY;
    if (contentWidth === 0 || contentHeight === 0) return;

    const padding = 100;
    const viewWidth = canvasSize.width - padding * 2;
    const viewHeight = canvasSize.height - padding * 2;
    const zoomX = viewWidth / contentWidth;
    const zoomY = viewHeight / contentHeight;
    const newZoom = Math.min(zoomX, zoomY, 2);

    const newPanX = (canvasSize.width / 2) - ((bounds.minX + contentWidth / 2) * newZoom);
    const newPanY = (canvasSize.height / 2) - ((bounds.minY + contentHeight / 2) * newZoom);

    setViewport({ pan: { x: newPanX, y: newPanY }, zoom: newZoom });
  };

  const handleFitScreen = () => {
    fitScreenToElements(elements);
  };

  const handleCenterView = () => {
    if (elements.length === 0) return;
    const bounds = getElementsBounds(elements);
    const contentWidth = bounds.maxX - bounds.minX;
    const contentHeight = bounds.maxY - bounds.minY;
    
    const newPanX = (canvasSize.width / 2) - ((bounds.minX + contentWidth / 2) * viewport.zoom);
    const newPanY = (canvasSize.height / 2) - ((bounds.minY + contentHeight / 2) * viewport.zoom);

    setViewport(v => ({ ...v, pan: { x: newPanX, y: newPanY } }));
  }

  const distSq = (p1: Point, p2: Point) => (p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2;
  
    const handleToggleGroupLock = (groupId?: string) => {
        if (groupId) {
            setSinglySelectedIdInGroup(null);
            setLockedGroupIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(groupId);
                return newSet;
            });
            const updates = elements
                .filter(el => el.groupId === groupId)
                .map(el => ({ id: el.id, data: { groupId: undefined } }));
            updateElements(updates);
        } else {
            const newGroupId = uuidv4();
            setLockedGroupIds(prev => new Set(prev).add(newGroupId));
            const updates = selectedElementIds.map(id => ({ id, data: { groupId: newGroupId } }));
            
            const elementsToLock = elements.filter(el => selectedElementIds.includes(el.id));
            const allPrompts = elementsToLock
                .map(el => {
                    if (el.type === 'note') {
                        return el.content.trim();
                    }
                    if (el.type === 'image' || el.type === 'drawing') {
                        return (prompts[el.id] || '').trim();
                    }
                    return '';
                })
                .filter(prompt => prompt);

            const combinedPrompt = allPrompts.join(', ');
            
            updateElements(updates, true);

            if (combinedPrompt) {
                setPrompts(p => ({ ...p, [newGroupId]: combinedPrompt }));
            }
        }
    };
    
    const captureGroupToBlob = async (groupId: string, targetAspectRatio?: number | null): Promise<{ base64: string, blob: Blob }> => {
        const groupElements = elements.filter(el => el.groupId === groupId && el.type !== 'note');
        if (groupElements.length === 0 || !canvasWrapperRef.current) throw new Error("Group not found or canvas not ready");

        let bounds = getElementsBounds(groupElements);
        
        if (targetAspectRatio) {
            const currentWidth = bounds.maxX - bounds.minX;
            const currentHeight = bounds.maxY - bounds.minY;
            const currentAspect = currentWidth / currentHeight;

            let newWidth = currentWidth;
            let newHeight = currentHeight;

            if (currentAspect > targetAspectRatio) {
                // Current is wider, need to increase height
                newHeight = currentWidth / targetAspectRatio;
            } else {
                // Current is taller, need to increase width
                newWidth = currentHeight * targetAspectRatio;
            }
            
            const dx = (newWidth - currentWidth) / 2;
            const dy = (newHeight - currentHeight) / 2;

            bounds = {
                minX: bounds.minX - dx,
                minY: bounds.minY - dy,
                maxX: bounds.maxX + dx,
                maxY: bounds.maxY + dy,
            }
        }

        const captureCanvas = await html2canvas(canvasWrapperRef.current, {
            backgroundColor: null, // Transparent background for padding
            width: bounds.maxX - bounds.minX,
            height: bounds.maxY - bounds.minY,
            x: bounds.minX,
            y: bounds.minY,
            scale: 1,
        });
        const dataUrl = captureCanvas.toDataURL('image/png');
        return dataUrlToBlob(dataUrl);
    };

    const handleAIGroupGenerate = async (groupId: string) => {
        const groupElements = elements.filter(el => el.groupId === groupId);
        const notes = groupElements.filter(el => el.type === 'note') as NoteElement[];
        
        const groupPrompt = prompts[groupId] || '';
        const aspectRatio = aspectRatios[groupId];
        const style = artStyles[groupId] || '';

        const isAnyNCLNoteInGroup = notes.some(note => !!note.meta?.nclCategory);
        const cinematicPrompt = "cinematic film still, shot on Kodak Vision3 500T film stock, anamorphic lens, beautiful bokeh, subtle motion blur, detailed film grain, professional cinematic color grading, hyper-detailed, 8K, UHD. 人物比例要正常（甚至美化），不要大頭小身體 --no cgi, 3d render, animation, video game, digital art, illustration, cartoon";

        try {
            setIsGenerating(true);
            setGenerationStatus('正在準備群組元素...');
            
            const parts: {inlineData?: {data: string, mimeType: string}; text?: string}[] = [];

            // Capture the entire group respecting the aspect ratio
            const { base64, blob } = await captureGroupToBlob(groupId, aspectRatio);
            parts.push({ inlineData: { data: base64, mimeType: blob.type } });

            const notesPrompt = notes.map(n => n.content.trim()).filter(Boolean).join('. ');
            let userPrompt = [notesPrompt, groupPrompt].filter(Boolean).join('. ');

            if (style && style !== '無風格 (None)') {
                userPrompt += `, ${style.split(' (')[0]}`;
            } else if (isAnyNCLNoteInGroup) {
                userPrompt += `, ${cinematicPrompt}`;
            }
            
            let finalPrompt = `
**MISSION BRIEFING**
You are an expert AI image editor. Your mission is to generate a new image by intelligently interpreting a user's request, which consists of a primary image containing various elements and a text prompt.

**CORE DIRECTIVES:**
1.  **Analyze the Entire Frame:** The provided image is the canvas. It contains one or more key subjects and may have transparent areas. Your task is to create a complete, cohesive scene that fills the entire frame.

2.  **Prioritize Instructions over Descriptions:** The user's text prompt may contain both descriptive elements and direct editing instructions (e.g., "change the shirt to red," "add a cat"). You MUST prioritize executing the editing instructions. Treat them as commands.

3.  **Seamless Integration and Outpainting:**
    *   **Character/Subject Integration:** Faithfully use the appearance of any people or key subjects from the provided image. If the prompt describes a scene, "cast" these subjects into that scene.
    *   **Outpainting:** Intelligently fill any transparent (empty) areas of the canvas. The newly generated background and elements must seamlessly blend with the existing subjects in terms of style, lighting, shadows, and perspective.
${isAnyNCLNoteInGroup ? `
4.  **Night City Scenario Integration (HIGHEST PRIORITY):** The prompt describes a 'Night City' cyberpunk scenario. Your primary goal is to "cast" the person from the reference image as the main character in that scene. This involves a 'face swap' or 'character insertion' operation. Ensure their appearance, pose, and clothing are seamlessly integrated into the described environment and action, matching the cyberpunk aesthetic.
` : `
4.  **Task Analysis (Inspired by Professional Editing):** Analyze the user's prompt to identify the type of editing task. Common tasks include:
    *   **Modification:** Changing an object's appearance, style, or clothing.
    *   **Replacement:** Swapping one element for another.
    *   **Addition/Subtraction:** Adding or removing objects/characters from the scene.
    *   **Style Transfer:** Converting the image to a different artistic style (e.g., cartoon, sketch).
    *   **Scene Manipulation:** Changing the background, weather, or time of day.
    Your final output must reflect the successful execution of this inferred task.
`}
5.  **Cohesive Composition:** Combine all elements—the edited subject, the background, the style, and any other instructions—into a single, high-quality, cohesive image.
6.  **Photorealistic Integration for Composites:** For composite images, it is CRITICAL to ensure seamless integration. Meticulously analyze and harmonize the lighting, shadows, reflections, and perspective between the original subjects and the newly generated background.

**USER REQUEST:**
${userPrompt}
`;

            parts.push({ text: finalPrompt });

            setGenerationStatus('正在呼叫 AI 模型...');
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image-preview',
                contents: { parts },
                config: {
                    responseModalities: [Modality.IMAGE, Modality.TEXT],
                },
            });

            setGenerationStatus('正在處理回應中...');
            const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);

            if (imagePart?.inlineData) {
                const newBase64 = imagePart.inlineData.data;
                const newMimeType = imagePart.inlineData.mimeType;
                let newSrc = `data:${newMimeType};base64,${newBase64}`;

                const img = await new Promise<HTMLImageElement>((resolve, reject) => {
                    const i = new Image();
                    i.onload = () => resolve(i);
                    i.onerror = reject;
                    i.src = newSrc;
                });
                const finalIntrinsicWidth = img.width;
                const finalIntrinsicHeight = img.height;
                
                downloadImage(newSrc, `ai-group-generated-${Date.now()}.png`);

                const bounds = getElementsBounds(groupElements);
                const newPosition = {
                    x: bounds.maxX + 20,
                    y: bounds.minY
                };
                
                const finalAspectRatio = aspectRatio || (finalIntrinsicWidth > 0 ? finalIntrinsicWidth / finalIntrinsicHeight : 1);
                const displayWidth = Math.max(...groupElements.map(el => el.width));
                const displayHeight = displayWidth / finalAspectRatio;

                addImageFromUrl(newSrc, finalIntrinsicWidth, finalIntrinsicHeight, newPosition, undefined, userPrompt);
            } else {
                throw new Error("AI did not return an image from the group generation.");
            }

        } catch (error) {
            console.error("AI Group Generation Error:", error);
            alert(`群組生成時發生錯誤: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleConvertToComparison = (elementId: string) => {
        const element = elements.find(el => el.id === elementId);
        if (!element || (element.type !== 'image' && element.type !== 'drawing')) return;

        const newCompareElement: ImageCompareElement = {
            id: element.id,
            type: 'imageCompare',
            position: element.position,
            width: element.width,
            height: element.height,
            rotation: element.rotation,
            zIndex: element.zIndex,
            groupId: element.groupId,
            srcBefore: element.src,
            intrinsicWidthBefore: (element as ImageElement).intrinsicWidth || element.width,
            intrinsicHeightBefore: (element as ImageElement).intrinsicHeight || element.height,
            srcAfter: '',
            intrinsicWidthAfter: 0,
            intrinsicHeightAfter: 0,
        };

        setElements(prev => prev.map(el => el.id === elementId ? newCompareElement : el), { addToHistory: true });
        setSelectedElementIds([elementId]);
    };
    
    const handleCreateComparisonFromGroup = (groupId: string) => {
        const groupImages = elements.filter(el => el.groupId === groupId && (el.type === 'image' || el.type === 'drawing')) as (ImageElement | DrawingElement)[];
        if (groupImages.length !== 2) return;
    
        const sortedImages = [...groupImages].sort((a, b) => a.position.x - b.position.x);
        const [beforeImg, afterImg] = sortedImages;
        const bounds = getElementsBounds(groupImages);
    
        const newCompareElement: ImageCompareElement = {
            id: uuidv4(),
            zIndex: getNextZIndex(),
            type: 'imageCompare',
            position: { x: bounds.maxX + 20, y: bounds.minY },
            width: afterImg.width,
            height: afterImg.height,
            rotation: 0,
            srcBefore: beforeImg.src,
            intrinsicWidthBefore: (beforeImg as ImageElement).intrinsicWidth || beforeImg.width,
            intrinsicHeightBefore: (beforeImg as ImageElement).intrinsicHeight || beforeImg.height,
            srcAfter: afterImg.src,
            intrinsicWidthAfter: (afterImg as ImageElement).intrinsicWidth || afterImg.width,
            intrinsicHeightAfter: (afterImg as ImageElement).intrinsicHeight || afterImg.height,
        };
    
        setElements(prev => [ ...prev, newCompareElement ], { addToHistory: true });
        setSelectedElementIds([newCompareElement.id]);
    };

    const handleUnpackComparison = (elementId: string) => {
        const element = elements.find(el => el.id === elementId) as ImageCompareElement;
        if (!element || element.type !== 'imageCompare') return;

        const { 
            srcBefore, intrinsicWidthBefore, intrinsicHeightBefore,
            srcAfter, intrinsicWidthAfter, intrinsicHeightAfter,
            position, width, rotation
        } = element;

        if (!srcBefore || !srcAfter) {
            alert("比較物件中缺少圖片，無法解開。");
            return;
        }

        const baseWidth = width / 2.1; // Make them slightly smaller than half to fit with spacing

        const beforeAspectRatio = intrinsicWidthBefore > 0 ? intrinsicWidthBefore / intrinsicHeightBefore : 1;
        const newImageBefore: ImageElement = {
            id: uuidv4(),
            type: 'image',
            zIndex: getNextZIndex(),
            position: { x: position.x, y: position.y },
            width: baseWidth,
            height: baseWidth / beforeAspectRatio,
            rotation: rotation,
            src: srcBefore,
            intrinsicWidth: intrinsicWidthBefore,
            intrinsicHeight: intrinsicHeightBefore,
        };

        const afterAspectRatio = intrinsicWidthAfter > 0 ? intrinsicWidthAfter / intrinsicHeightAfter : 1;
        const newImageAfter: ImageElement = {
            id: uuidv4(),
            type: 'image',
            zIndex: getNextZIndex() + 1,
            position: { x: position.x + baseWidth + 10, y: position.y },
            width: baseWidth,
            height: baseWidth / afterAspectRatio,
            rotation: rotation,
            src: srcAfter,
            intrinsicWidth: intrinsicWidthAfter,
            intrinsicHeight: intrinsicHeightAfter,
        };

        setElements(prev => [
            ...prev.filter(el => el.id !== elementId),
            newImageBefore,
            newImageAfter
        ], { addToHistory: true });

        setSelectedElementIds([newImageBefore.id, newImageAfter.id]);
    };

    const handleContextualGeneration = (directive: string) => {
        // This is a placeholder for a more complex implementation.
        // It could capture the selected elements, their prompts, and send them to the model
        // with the user's directive.
        console.log("Contextual generation requested with directive:", directive);
        alert(`情境生成：${directive}\n(此功能仍在開發中)`);
    };

  return (
    <div 
        className="w-screen h-screen bg-black text-white cyber-grid-background canvas-glow-container"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onContextMenu={handleOpenContextMenu}
    >
      <InfiniteCanvas
        ref={canvasWrapperRef}
        elements={elements}
        viewport={viewport}
        onViewportChange={setViewport}
        onUpdateElements={(updates) => updateElements(updates, false)}
        onCommitHistory={handleCommitHistory}
        onAddElement={(el) => addElement(el as any)}
        onAltDragDuplicate={handleAltDragDuplicate}
        onReplacePlaceholder={replacePlaceholderWithImage}
        selectedElementIds={selectedElementIds}
        onSelectElements={handleSelectElements}
        onDoubleClickElement={(id) => {
            const el = elements.find(e => e.id === id);
            if (el?.type === 'drawing') setDrawingToEdit(el);
            if (el?.type === 'image') setCroppingElement(el);
        }}
        activeTool={activeTool}
        onToolChange={setActiveTool}
        isDraggingOver={isDraggingOver}
        isConnecting={!!newConnection}
        drawingArrow={drawingArrow}
        onDrawingArrowChange={setDrawingArrow}
        lockedGroupIds={lockedGroupIds}
        singlySelectedIdInGroup={singlySelectedIdInGroup}
        isAnimationActive={isAnimationActive}
        onTriggerCameraForCompare={handleTriggerCameraForCompare}
        onTriggerPasteForCompare={handleTriggerPasteForCompare}
        ghostElements={ghostElements}
        onStartAltDrag={(els) => setGhostElements(els)}
        onEndAltDrag={() => setGhostElements(null)}
      />
      {/* UI Panels */}
      <InspirationPanel
        isOpen={isInspirationPanelOpen}
        setIsOpen={setIsInspirationPanelOpen}
        selectedElements={selectedElements}
        lockedGroupIds={lockedGroupIds}
        prompts={prompts}
        onPromptsChange={setPrompts}
        addElement={addElement}
        screenToCanvas={screenToCanvasCoords}
        canvasSize={canvasSize}
        elements={elements}
        updateElements={updateElements}
        onContextualGeneration={handleContextualGeneration}
      />
      <LayersPanel 
        isOpen={isLayersPanelOpen}
        setIsOpen={setIsLayersPanelOpen}
        elements={elements} 
        selectedElementIds={selectedElementIds}
        onLayerSelect={handleLayerSelect}
        onGroupLayerSelect={(groupId) => {
            const ids = elements.filter(el => el.groupId === groupId).map(el => el.id);
            handleSelectElements(ids);
        }}
        lockedGroupIds={lockedGroupIds}
        onDelete={deleteElements}
        onReorder={handleLayerReorder}
        isAnimationActive={isAnimationActive}
        onAnimationToggle={() => setIsAnimationActive(prev => !prev)}
        isMusicPlayerVisible={isMusicPlayerVisible}
        onMusicPlayerToggle={() => setIsMusicPlayerVisible(prev => !prev)}
      />
      <Toolbar 
        isOpen={isToolbarOpen}
        setIsOpen={setIsToolbarOpen}
        activeTool={activeTool} onToolChange={setActiveTool}
        onAddNote={addNote} onAddImage={addImageFromUpload}
        onAddPlaceholder={addPlaceholder}
        onAddImageCompare={addImageCompare}
        onPaste={handlePasteFromClipboard}
        onDraw={() => setIsDrawing(true)} onCamera={() => setIsTakingPhoto(true)}
        canUndo={canUndo} onUndo={undo} canRedo={canRedo} onRedo={redo}
        zoom={viewport.zoom} onZoomChange={(newZoom) => setViewport({ ...viewport, zoom: newZoom })}
        onFitScreen={handleFitScreen} onCenterView={handleCenterView}
      />
      {selectedElements.length > 0 && (
          <FloatingToolbar 
            elements={elements}
            selectedElements={selectedElements} 
            viewport={viewport} 
            prompts={prompts} onPromptsChange={setPrompts}
            aspectRatios={aspectRatios} onAspectRatiosChange={setAspectRatios as any}
            artStyles={artStyles} onArtStylesChange={setArtStyles}
            onDelete={() => deleteElements(selectedElementIds)}
            onDuplicate={() => duplicateElements(selectedElementIds)}
            onBringToFront={() => reorderElements('front', selectedElementIds)}
            onSendToBack={() => reorderElements('back', selectedElementIds)}
            onUpdateElements={(updates, addToHistory) => updateElements(updates, addToHistory)}
            onCommitHistory={handleCommitHistory}
            onCrop={() => setCroppingElement(selectedElements[0] as ImageElement | DrawingElement)}
            onEditDrawing={() => setDrawingToEdit(selectedElements[0] as DrawingElement)}
            onDownload={downloadImageElement}
            onAIGenerate={handleAIGenerate}
            onAIZoomOut={handleAIZoomOut}
            onAIGroupGenerate={handleAIGroupGenerate}
            onRequestInspiration={handleRequestInspiration}
            onRequestGroupInspiration={onRequestGroupInspiration}
            onOptimizeGroupPrompt={onOptimizeGroupPrompt}
            onOptimizeSingleElementPrompt={onOptimizeSingleElementPrompt}
            onNoteInspiration={handleNoteInspiration}
            onNoteOptimization={handleNoteOptimization}
            onNoteGenerate={handleNoteGenerate}
            onCreateComparison={handleCreateComparisonFromGroup}
            onConvertToComparison={handleConvertToComparison}
            onUnpackComparison={handleUnpackComparison}
            isGenerating={isGenerating}
            onStartConnection={handleStartConnection}
            onToggleGroupLock={handleToggleGroupLock}
            lockedGroupIds={lockedGroupIds}
            onClearConnections={handleClearConnections}
            onFillPlaceholderFromCamera={handleFillPlaceholderFromCamera}
            onFillPlaceholderFromPaste={handleFillPlaceholderFromPaste}
          />
      )}
      <ShortcutHints />
      {/* File Inputs */}
      <input type="file" ref={fileInputRef} onChange={e => handleFileUploads(e.target.files)} className="hidden" accept="image/*" multiple />
      {/* FIX: Use spread attributes to allow non-standard directory and webkitdirectory attributes for folder upload. */}
      <input type="file" ref={musicUploadRefForLink} onChange={e => { handleRelinkFolderSelect(e.target.files); e.target.value = ''; }} className="hidden" multiple {...{ webkitdirectory: "", directory: "" }} />

      {/* Overlays and Modals */}
      {isMusicPlayerVisible && (
        <MusicPlayer
            isPlaying={isPlaying}
            currentTrackName={musicTracks[currentTrackIndex]?.name || '未選擇歌曲'}
            isLibraryEmpty={musicTracks.length === 0}
            musicTracks={musicTracks}
            currentTrackIndex={currentTrackIndex}
            onPlayPause={handlePlayPause}
            onStop={handleStop}
            onNext={handleNextTrack}
            onPrev={handlePrevTrack}
            onSelectTrack={handleSelectTrack}
            onFolderUpload={handleFolderUpload}
            onDrop={handleMusicDrop}
            onLrcUpload={handleLrcUpload}
            onClear={handleClearMusic}
            onReloadFromLocal={handleReloadFromLocal}
            repeatMode={repeatMode}
            isShuffle={isShuffle}
            onCycleRepeatMode={handleCycleRepeatMode}
            onToggleShuffle={handleToggleShuffle}
            playlists={playlists}
            activePlaylistName={activePlaylistName}
            onSwitchPlaylist={handleSwitchPlaylist}
            onDeleteTrack={handleDeleteTrack}
            onSaveCurrentTracksAsPlaylist={handleSaveCurrentTracksAsPlaylist}
            onExportPlaylists={handleExportPlaylists}
            onImportPlaylists={handleImportPlaylists}
            currentTime={currentTime}
            duration={duration}
            onSeek={handleSeek}
            currentLyric={currentLyric}
        />
      )}
      {isMusicPlayerVisible && <LyricsDisplay lyric={currentLyric || ''} />}
      {contextMenu && <ContextMenu {...contextMenu} onClose={() => setContextMenu(null)} />}
      {isDrawing && <DrawingModal onSave={addDrawing} onClose={() => setIsDrawing(false)} />}
      {drawingToEdit && <DrawingModal onSave={(src) => {
          updateElements([{ id: drawingToEdit.id, data: { src } }]);
          setDrawingToEdit(null);
      }} onClose={() => setDrawingToEdit(null)} initialDrawing={drawingToEdit.src} />}
      {croppingElement && <CroppingModal element={croppingElement} onClose={() => setCroppingElement(null)} onSave={(src, width, height) => {
        updateElements([{ id: croppingElement.id, data: { src, intrinsicWidth: width, intrinsicHeight: height, width, height } }]);
        setCroppingElement(null);
      }} />}
      {isTakingPhoto && (
        <CameraModal
            onClose={() => { setIsTakingPhoto(false); setPlaceholderTarget(null); setImageCompareTarget(null); }}
            onCapture={(dataUrl, bgOption) => {
                handleCameraCapture(dataUrl, bgOption, placeholderTarget);
                setIsTakingPhoto(false);
                setPlaceholderTarget(null);
                setImageCompareTarget(null);
            }}
        />
      )}
       {isGenerating && (
         <div className="fixed inset-0 bg-black/70 z-[9998] flex items-center justify-center backdrop-blur-sm">
           <div className="text-center">
             <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[var(--cyber-cyan)] mx-auto"></div>
             <p className="mt-4 text-lg text-white">{generationStatus}</p>
           </div>
         </div>
       )}
       {newConnection && (
            <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-50" style={{ transform: 'translateZ(0)' }}>
                <line
                    x1={newConnection.startPoint.x} y1={newConnection.startPoint.y}
                    x2={newConnection.endPoint.x} y2={newConnection.endPoint.y}
                    stroke="var(--cyber-cyan)" strokeWidth="3" strokeDasharray="5,5"
                    style={{ filter: 'drop-shadow(0 0 5px var(--cyber-glow-cyan))' }}
                />
            </svg>
        )}
        {drawingArrow && (
            <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-30" style={{ transform: 'translateZ(0)' }}>
                <line
                    x1={drawingArrow.start.x * viewport.zoom + viewport.pan.x}
                    y1={drawingArrow.start.y * viewport.zoom + viewport.pan.y}
                    x2={drawingArrow.end.x * viewport.zoom + viewport.pan.x}
                    y2={drawingArrow.end.y * viewport.zoom + viewport.pan.y}
                    stroke="#f43f5e" strokeWidth="4" strokeDasharray="8,8"
                    style={{ filter: 'drop-shadow(0 0 5px #f43f5e)' }}
                />
            </svg>
        )}
        {connections.map(c => {
             const source = elements.find(el => el.id === c.sourceId);
             const target = elements.find(el => el.id === c.targetId);
             if (!source || !target) return null;
             
            const startPoint = { 
                x: c.sourceSide === 'left' ? source.position.x : source.position.x + source.width,
                y: source.position.y + source.height / 2 
            };
            const endPoint = {
                x: c.targetSide === 'left' ? target.position.x : target.position.x + target.width,
                y: target.position.y + target.height / 2
            };
            
             return (
                 <svg key={c.id} className="absolute top-0 left-0 w-full h-full pointer-events-none z-0" 
                      style={{ transform: `translate(${viewport.pan.x}px, ${viewport.pan.y}px) scale(${viewport.zoom})`, transformOrigin: '0 0' }}>
                     <path d={`M ${startPoint.x} ${startPoint.y} C ${startPoint.x + 100 * (c.sourceSide === 'left' ? -1 : 1)} ${startPoint.y}, ${endPoint.x + 100 * (c.targetSide === 'left' ? -1 : 1)} ${endPoint.y}, ${endPoint.x} ${endPoint.y}`}
                           stroke="var(--cyber-cyan)" strokeWidth="2" fill="none"
                           style={{ filter: 'drop-shadow(0 0 3px var(--cyber-glow-cyan))' }}/>
                 </svg>
             );
        })}
        {inspirationConfirm && (
            <div className="fixed inset-0 bg-black/70 z-[9998] flex items-center justify-center backdrop-blur-sm">
                 <div className="bg-[var(--cyber-bg)] border border-[var(--cyber-border)] p-6 rounded-xl shadow-2xl flex flex-col gap-4">
                     <h2 className="text-lg font-bold text-white">新圖片已加入！</h2>
                     <p className="text-gray-300">是否要自動分析此圖片以獲取改圖靈感？</p>
                     <div className="flex justify-end gap-3 mt-2">
                        <button onClick={() => handleInspirationConfirm(false)} className="px-4 py-2 bg-slate-700 text-gray-200 rounded-md hover:bg-slate-600">不用了</button>
                        <button onClick={() => handleInspirationConfirm(true)} className="px-4 py-2 bg-[var(--cyber-cyan)] text-black font-bold rounded-md hover:bg-cyan-300">是，分析它</button>
                     </div>
                 </div>
            </div>
        )}
        {inspirationData && (
            <InspirationModal 
                suggestions={inspirationData.modificationSuggestions}
                prompts={inspirationData.textPrompts}
                onClose={() => setInspirationData(null)}
                onApply={(suggestions, prompt) => {
                    const selectedId = selectedElements[0]?.id || selectedElements[0]?.groupId;
                    const isGroup = !!selectedElements[0]?.groupId;
                    
                    if (selectedId) {
                        const newPrompt = [
                            (isGroup ? prompts[selectedId] : prompts[selectedId]) || '',
                            ...suggestions,
                            prompt || ''
                        ].filter(Boolean).join(', ');
                        
                        setPrompts(p => ({ ...p, [selectedId]: newPrompt }));
                    }
                    
                    setInspirationData(null);
                }}
            />
        )}
        {selectedElements.length === 1 && (
            <div className="absolute bottom-4 left-4 z-30 p-2 bg-slate-900/80 backdrop-blur-md rounded-lg text-xs font-mono text-gray-400 pointer-events-none">
                X: {Math.round(selectedElements[0].position.x)}, Y: {Math.round(selectedElements[0].position.y)}
            </div>
        )}
    </div>
  );
};