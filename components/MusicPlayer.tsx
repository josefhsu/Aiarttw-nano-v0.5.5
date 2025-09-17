import React, { useRef, useState, useCallback } from 'react';
import { Play, Pause, StopCircle, SkipBack, SkipForward, FolderUp, Trash2, Shuffle, Repeat, Repeat1, ListMusic, FileText, RefreshCw, Square, Download, Upload, Save } from 'lucide-react';

interface MusicPlayerProps {
  isPlaying: boolean;
  currentTrackName: string;
  isLibraryEmpty: boolean;
  musicTracks: { dbId: number; name: string }[];
  currentTrackIndex: number;
  onPlayPause: () => void;
  onStop: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSelectTrack: (index: number) => void;
  onFolderUpload: (files: FileList | null) => void;
  onDrop: (items: DataTransferItemList) => void;
  onLrcUpload: (file: File | null) => void;
  onClear: () => void;
  onReloadFromLocal: () => void;
  repeatMode: 'off' | 'all' | 'one';
  isShuffle: boolean;
  onCycleRepeatMode: () => void;
  onToggleShuffle: () => void;
  playlists: { name: string }[];
  activePlaylistName: string;
  onSwitchPlaylist: (name: string) => void;
  onDeleteTrack: (trackDbId: number) => void;
  onSaveCurrentTracksAsPlaylist: () => void;
  onExportPlaylists: () => void;
  onImportPlaylists: (event: React.ChangeEvent<HTMLInputElement>) => void;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  currentLyric: string | null;
}

const IconButton: React.FC<{ active?: boolean, onClick: (e: React.MouseEvent) => void, children: React.ReactNode, title: string, disabled?: boolean, className?: string }> = 
  ({ active, onClick, children, title, disabled, className = '' }) => (
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`p-2 rounded-lg transition-colors ${
        active ? 'bg-[var(--cyber-pink)] text-black' : 'hover:bg-slate-700'
      } disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
);

const PlaylistManager: React.FC<{
    musicTracks: { dbId: number; name: string }[];
    currentTrackIndex: number;
    playlists: { name: string }[];
    activePlaylistName: string;
    onSwitchPlaylist: (name: string) => void;
    onDeleteTrack: (trackDbId: number) => void;
    onSelectTrack: (index: number) => void;
    onSaveCurrentTracksAsPlaylist: () => void;
    onExportPlaylists: () => void;
    onImportPlaylists: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onClose: () => void;
}> = ({ musicTracks, currentTrackIndex, playlists, activePlaylistName, onSwitchPlaylist, onDeleteTrack, onSelectTrack, onSaveCurrentTracksAsPlaylist, onExportPlaylists, onImportPlaylists, onClose }) => {
    const managerRef = useRef<HTMLDivElement>(null);
    const importRef = useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (managerRef.current && !managerRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    return (
        <div ref={managerRef} className="absolute top-full mt-2 right-0 bg-slate-900/90 backdrop-blur-md rounded-lg shadow-2xl border border-[var(--cyber-pink)] p-3 flex flex-col gap-3 w-72">
            <h4 className="text-sm font-bold text-center text-gray-200 border-b border-slate-700 pb-2">快速選單</h4>
            
            <div className="flex items-center gap-2">
                <select
                    value={activePlaylistName}
                    onChange={(e) => onSwitchPlaylist(e.target.value)}
                    className="flex-grow bg-slate-800 p-1.5 rounded-md text-sm text-gray-200 focus:ring-1 focus:ring-[var(--cyber-cyan)] outline-none"
                >
                    <option value="所有音樂">所有音樂</option>
                    {playlists.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                </select>
                {/* FIX: Added a button to allow saving the current track list as a playlist. */}
                <button onClick={onSaveCurrentTracksAsPlaylist} title="將目前列表儲存為播放清單" className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-md"><Save size={16}/></button>
                <button onClick={onExportPlaylists} title="匯出音樂庫" className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-md"><Download size={16}/></button>
                <button onClick={() => importRef.current?.click()} title="匯入音樂庫" className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-md"><Upload size={16}/></button>
                <input type="file" ref={importRef} onChange={onImportPlaylists} className="hidden" accept=".json" />
            </div>

            <div className="bg-slate-800/50 p-2 rounded-md h-48 flex flex-col">
                <p className="text-xs text-gray-400 mb-1 pl-1">"{activePlaylistName}" 中的歌曲:</p>
                <div className="overflow-y-auto pr-1 flex-grow">
                    {musicTracks.length > 0 ? musicTracks.map((track, index) => {
                        const isCurrentTrack = index === currentTrackIndex;
                        return (
                            <div key={track.dbId} className={`flex items-center justify-between group text-sm p-1 rounded transition-colors ${isCurrentTrack ? 'bg-[var(--cyber-pink)]/30' : ''}`}>
                                <button onClick={() => onSelectTrack(index)} title={track.name} className={`flex items-center gap-2 text-left flex-grow truncate transition-colors ${isCurrentTrack ? 'text-white' : 'text-gray-300 hover:text-white'}`}>
                                    {isCurrentTrack && <Play size={12} className="text-pink-400 flex-shrink-0" />}
                                    <span className="truncate">{track.name}</span>
                                </button>
                                <button onClick={() => onDeleteTrack(track.dbId)} title="刪除歌曲" className="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-300 flex-shrink-0 ml-2">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        )
                    }) : (
                        <p className="text-xs text-gray-500 text-center pt-4">此播放清單為空。</p>
                    )}
                </div>
            </div>
        </div>
    );
};

const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const floorSeconds = Math.floor(seconds);
    const min = Math.floor(floorSeconds / 60);
    const sec = floorSeconds % 60;
    return `${min < 10 ? '0' : ''}${min}:${sec < 10 ? '0' : ''}${sec}`;
};

export const MusicPlayer: React.FC<MusicPlayerProps> = ({
  isPlaying,
  currentTrackName,
  isLibraryEmpty,
  musicTracks,
  currentTrackIndex,
  onPlayPause,
  onStop,
  onNext,
  onPrev,
  onSelectTrack,
  onFolderUpload,
  onDrop,
  onLrcUpload,
  onClear,
  onReloadFromLocal,
  repeatMode,
  isShuffle,
  onCycleRepeatMode,
  onToggleShuffle,
  playlists,
  activePlaylistName,
  onSwitchPlaylist,
  onDeleteTrack,
  onSaveCurrentTracksAsPlaylist,
  onExportPlaylists,
  onImportPlaylists,
  currentTime,
  duration,
  onSeek,
  currentLyric,
}) => {
  const musicUploadRef = useRef<HTMLInputElement>(null);
  const lrcUploadRef = useRef<HTMLInputElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [isPlaylistManagerOpen, setIsPlaylistManagerOpen] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  
  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDraggingOver(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDraggingOver(false);
  };
  const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDraggingOver(false);
      if (e.dataTransfer.items?.length) {
          onDrop(e.dataTransfer.items);
      }
  };
  
  const handleProgressSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !duration) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(duration * percentage);
  }, [duration, onSeek]);
  
  const handleProgressMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    handleProgressSeek(e); // Allow click to seek

    const handleMouseMove = (moveEvent: MouseEvent) => {
      // Create a synthetic event to pass to the seek handler
      handleProgressSeek(moveEvent as any);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp, { once: true });
  }, [handleProgressSeek]);

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-slate-900/80 backdrop-blur-md rounded-xl shadow-2xl border border-[var(--cyber-pink)] p-2 flex items-center gap-2">
      <div className="flex items-center gap-1 p-1 bg-slate-800/50 rounded-lg">
        <IconButton title="上一首" onClick={onPrev}><SkipBack size={20} /></IconButton>
        <IconButton title={isPlaying ? '暫停' : '播放'} onClick={onPlayPause} active={isPlaying}>
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </IconButton>
        <IconButton title="停止" onClick={onStop}><Square size={20} /></IconButton>
        <IconButton title="下一首" onClick={onNext}><SkipForward size={20} /></IconButton>
      </div>
      <div 
        className={`relative text-sm w-72 h-10 flex items-center justify-center overflow-hidden p-2 rounded-lg transition-all ${isDraggingOver ? 'ring-2 ring-offset-2 ring-offset-slate-900 ring-[var(--cyber-cyan)]' : ''}`}
        title={currentTrackName}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        ref={progressBarRef}
        onMouseDown={handleProgressMouseDown}
      >
        <div className="absolute inset-0 track-display-marquee-bg rounded-lg opacity-30" />
        <div className="absolute inset-0 h-full bg-slate-700/50 rounded-lg" />
        <div className="absolute left-0 top-0 h-full bg-[var(--cyber-pink)] rounded-lg opacity-60" style={{ width: `${progressPercentage}%`}} />
        <div className="absolute top-0 h-full -translate-x-1/2 progress-cti" style={{ left: `${progressPercentage}%` }}/>
        
        <div className="relative text-white z-10 w-full text-center" style={{textShadow: '1px 1px 2px #000'}}>
          {isDraggingOver ? '將資料夾拖放到此' : isLibraryEmpty ? (
            <div className="lyrics-marquee-container scrolling">
              請上傳音樂，偵測同檔案夾「同名稱LRC歌詞檔」
            </div>
          ) : (
            currentLyric ? (
              <div className={`lyrics-marquee-container text-lg ${!isPlaying ? 'scrolling' : 'whitespace-normal'}`}>
                {currentLyric}
              </div>
            ) : <span className="truncate">{currentTrackName}</span>
          )}
        </div>
        <span className="absolute left-2 bottom-0 text-xs text-gray-300 font-mono z-10 pointer-events-none">
          {formatTime(currentTime)}
        </span>
        <span className="absolute right-2 bottom-0 text-xs text-gray-300 font-mono z-10 pointer-events-none">
          {formatTime(duration)}
        </span>
      </div>
       <div className="flex items-center gap-1 p-1 bg-slate-800/50 rounded-lg">
        <IconButton title="隨機播放" active={isShuffle} onClick={onToggleShuffle}>
            <Shuffle size={20} />
        </IconButton>
        <IconButton title={`重複模式: ${repeatMode}`} active={repeatMode !== 'off'} onClick={onCycleRepeatMode}>
            {repeatMode === 'one' ? <Repeat1 size={20} /> : <Repeat size={20} />}
        </IconButton>
      </div>
      <div className="border-l border-slate-700 h-8 mx-1" />
      <div className="flex items-center gap-1">
        <IconButton title="上傳音樂資料夾" onClick={() => musicUploadRef.current?.click()} className={isLibraryEmpty ? 'upload-reminder-glow' : ''}>
            <FolderUp size={20} />
        </IconButton>
         <IconButton title="上傳歌詞 (.lrc)" onClick={() => lrcUploadRef.current?.click()}>
            <FileText size={20} />
        </IconButton>
        <div className="relative">
            <IconButton title="播放清單" onClick={() => setIsPlaylistManagerOpen(prev => !prev)}>
                <ListMusic size={20} />
            </IconButton>
            {isPlaylistManagerOpen && (
                <PlaylistManager
                    musicTracks={musicTracks}
                    currentTrackIndex={currentTrackIndex}
                    playlists={playlists}
                    activePlaylistName={activePlaylistName}
                    onSwitchPlaylist={onSwitchPlaylist}
                    onDeleteTrack={onDeleteTrack}
                    onSelectTrack={onSelectTrack}
                    onSaveCurrentTracksAsPlaylist={onSaveCurrentTracksAsPlaylist}
                    onExportPlaylists={onExportPlaylists}
                    onImportPlaylists={onImportPlaylists}
                    onClose={() => setIsPlaylistManagerOpen(false)}
                />
            )}
        </div>
        <IconButton title="重新載入本地音樂" onClick={onReloadFromLocal}>
            <RefreshCw size={20} />
        </IconButton>
        <IconButton title="清除所有已上傳的音樂和播放清單" onClick={onClear}>
            <Trash2 size={20} />
        </IconButton>
      </div>
      <input
        type="file"
        ref={musicUploadRef}
        onChange={(e) => { onFolderUpload(e.target.files); e.target.value = ''; }}
        className="hidden"
        // @ts-ignore
        webkitdirectory="true"
        directory="true"
        multiple
      />
      <input
        type="file"
        ref={lrcUploadRef}
        onChange={(e) => { onLrcUpload(e.target.files?.[0] || null); e.target.value = ''; }}
        className="hidden"
        accept=".lrc"
      />
    </div>
  );
};