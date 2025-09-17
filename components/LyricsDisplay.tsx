import React from 'react';

interface LyricsDisplayProps {
  lyric: string;
}

export const LyricsDisplay: React.FC<LyricsDisplayProps> = ({ lyric }) => {
  if (!lyric) {
    return null;
  }

  return (
    <div 
      className="fixed top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none text-center max-w-[80vw]"
      style={{
        textShadow: `
          0 0 5px var(--cyber-cyan), 
          0 0 10px var(--cyber-cyan), 
          0 0 20px var(--cyber-cyan), 
          0 0 30px var(--cyber-pink), 
          0 0 40px var(--cyber-pink)
        `,
        WebkitTextStroke: '0.5px rgba(0,0,0,0.7)',
        paintOrder: 'stroke fill',
      }}
    >
      <p className="text-2xl font-bold text-white whitespace-normal">
        {lyric}
      </p>
    </div>
  );
};
