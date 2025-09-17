import React, { useRef, useEffect, useState, useCallback } from 'react';

interface CameraModalProps {
  onClose: () => void;
  onCapture: (dataUrl: string, bgOption: 'transparent' | 'green') => void;
}

const aspectRatios = [
    { value: 1 / 1, text: '1:1' },
    { value: 16 / 9, text: '16:9' },
    { value: 3 / 2, text: '3:2' },
    { value: 2 / 3, text: '2:3' },
    { value: 9 / 16, text: '9:16' },
];

export const CameraModal: React.FC<CameraModalProps> = ({ onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState(aspectRatios[1].value);
  const [captureBox, setCaptureBox] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [bgOption, setBgOption] = useState<'transparent' | 'green'>('transparent');

  const updateCaptureBox = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.readyState < 1 || video.videoWidth === 0) return;

    const videoWidth = video.offsetWidth;
    const videoHeight = video.offsetHeight;
    
    let boxWidth, boxHeight;

    if (videoWidth / videoHeight > aspectRatio) {
      boxHeight = videoHeight;
      boxWidth = boxHeight * aspectRatio;
    } else {
      boxWidth = videoWidth;
      boxHeight = boxWidth / aspectRatio;
    }

    setCaptureBox({
      width: boxWidth,
      height: boxHeight,
      x: (videoWidth - boxWidth) / 2,
      y: (videoHeight - boxHeight) / 2,
    });
  }, [aspectRatio]);

  const handleCapture = useCallback(() => {
    if (error) return;
    const video = videoRef.current;
    if (video) {
      const canvas = document.createElement('canvas');

      const scaleX = video.videoWidth / video.offsetWidth;
      const scaleY = video.videoHeight / video.offsetHeight;

      const sourceX = captureBox.x * scaleX;
      const sourceY = captureBox.y * scaleY;
      const sourceWidth = captureBox.width * scaleX;
      const sourceHeight = captureBox.height * scaleY;

      canvas.width = sourceWidth;
      canvas.height = sourceHeight;
      
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, sourceWidth, sourceHeight);
      onCapture(canvas.toDataURL('image/png'), bgOption);
    }
  }, [captureBox, onCapture, error, bgOption]);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let isMounted = true;
    const startCamera = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error("此瀏覽器不支援相機 API。");
        }
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (isMounted && videoRef.current) {
          videoRef.current.srcObject = stream;
        } else {
            stream?.getTracks().forEach(track => track.stop());
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        if (isMounted) setError("無法存取相機。請檢查權限。");
      }
    };

    startCamera();

    return () => {
      isMounted = false;
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const handleResize = () => updateCaptureBox();
    
    if (video) {
        video.addEventListener('playing', handleResize);
        window.addEventListener('resize', handleResize);
        
        if (!video.paused) {
            handleResize();
        }
    }
    
    return () => {
      if (video) {
        video.removeEventListener('playing', handleResize);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [updateCaptureBox]);


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === ' ') {
            e.preventDefault();
            handleCapture();
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleCapture]);


  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center backdrop-blur-sm" onMouseDown={onClose}>
      <div className="bg-[var(--cyber-bg)] border border-[var(--cyber-border)] p-6 rounded-xl shadow-2xl flex flex-col gap-4 w-auto max-w-[90vw] max-h-[90vh]" onMouseDown={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-[var(--cyber-cyan)]">攝像頭擷取</h2>
        {error ? (
          <div className="text-rose-400 bg-rose-900/50 p-4 rounded-lg">{error}</div>
        ) : (
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              <video ref={videoRef} autoPlay playsInline className="max-w-full max-h-full h-auto w-auto rounded-lg bg-slate-800" />
              <div 
                className="absolute border-2 border-dashed border-white/80 pointer-events-none"
                style={{
                    left: captureBox.x,
                    top: captureBox.y,
                    width: captureBox.width,
                    height: captureBox.height,
                }}
              />
            </div>
        )}
        <div className="flex justify-between items-center gap-4 mt-2">
            <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">比例:</span>
                    {aspectRatios.map(ratio => (
                        <button key={ratio.text} onClick={() => setAspectRatio(ratio.value)} className={`px-3 py-1 text-xs rounded-md ${aspectRatio.toFixed(2) === ratio.value.toFixed(2) ? 'bg-[var(--cyber-cyan)] text-black' : 'bg-slate-700 text-gray-300'}`}>
                            {ratio.text}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                      <input
                          type="radio"
                          id="bg-transparent"
                          name="bg-option"
                          value="transparent"
                          checked={bgOption === 'transparent'}
                          onChange={() => setBgOption('transparent')}
                          className="w-4 h-4 text-cyan-500 bg-gray-700 border-gray-600 focus:ring-cyan-600 ring-offset-gray-800"
                      />
                      <label htmlFor="bg-transparent" className="text-sm text-gray-300">去背(透明)</label>
                  </div>
                  <div className="flex items-center gap-2">
                      <input
                          type="radio"
                          id="bg-green"
                          name="bg-option"
                          value="green"
                          checked={bgOption === 'green'}
                          onChange={() => setBgOption('green')}
                          className="w-4 h-4 text-cyan-500 bg-gray-700 border-gray-600 focus:ring-cyan-600 ring-offset-gray-800"
                      />
                      <label htmlFor="bg-green" className="text-sm text-gray-300">去背+綠幕</label>
                  </div>
                </div>
            </div>
            <div className="flex justify-end gap-2">
                <button onClick={onClose} className="px-4 py-2 bg-slate-700 text-gray-200 rounded-md hover:bg-slate-600">關閉</button>
                <button onClick={handleCapture} disabled={!!error} className="px-4 py-2 bg-[var(--cyber-cyan)] text-black font-bold rounded-md hover:bg-cyan-300 disabled:bg-slate-600 disabled:cursor-not-allowed">拍攝 (Space)</button>
            </div>
        </div>
      </div>
    </div>
  );
};