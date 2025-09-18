import React, { useRef, useState } from 'react';

interface ImageActionPlaceholderProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onImageSet: (file: File) => void;
}

export const ImageActionPlaceholder: React.FC<ImageActionPlaceholderProps> = ({ icon, title, description, onImageSet }) => {
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
        if (e.dataTransfer.files?.length) {
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                onImageSet(file);
            }
        }
    };
    
    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onImageSet(file);
        }
    };

    return (
        <div 
            className={`w-full h-full border-2 border-dashed rounded-lg flex items-center justify-center text-gray-500 transition-colors cursor-pointer ${isDraggingOver ? 'border-cyan-400 bg-cyan-900/30' : 'border-gray-600 hover:border-gray-400'}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
            onMouseDown={(e) => e.stopPropagation()}
        >
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange}
            />
            <div className="text-center pointer-events-none p-2">
                <div className="mx-auto mb-2 w-max">{icon}</div>
                <p className="font-semibold">{title}</p>
                <p className="text-xs mt-1">{description}</p>
            </div>
        </div>
    );
};
