import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface ImageCropperProps {
  image: string;
  onCropComplete: (croppedImage: Blob) => void;
  onCancel: () => void;
}

export const ImageCropper: React.FC<ImageCropperProps> = ({ image, onCropComplete, onCancel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState([1]);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imgRef = useRef<HTMLImageElement>(new Image());

  useEffect(() => {
    imgRef.current.src = image;
    imgRef.current.onload = () => drawCanvas();
  }, [image]);

  useEffect(() => {
    drawCanvas();
  }, [zoom, position]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imgRef.current;
    ctx.clearRect(0, 0, 400, 400);
    
    const scale = zoom[0];
    const w = img.width * scale;
    const h = img.height * scale;
    
    ctx.drawImage(img, position.x, position.y, w, h);
  };

  const handleCrop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.toBlob((blob) => {
      if (blob) onCropComplete(blob);
    }, 'image/jpeg', 0.9);
  };

  return (
    <div className="space-y-4">
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        className="border rounded-lg cursor-move mx-auto"
        onMouseDown={(e) => {
          setIsDragging(true);
          setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
        }}
        onMouseMove={(e) => {
          if (isDragging) {
            setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
          }
        }}
        onMouseUp={() => setIsDragging(false)}
      />
      <div className="space-y-2">
        <label className="text-sm font-medium">Zoom</label>
        <Slider value={zoom} onValueChange={setZoom} min={0.5} max={3} step={0.1} />
      </div>
      <div className="flex gap-2">
        <Button onClick={handleCrop} className="flex-1">Apply Crop</Button>
        <Button onClick={onCancel} variant="outline" className="flex-1">Cancel</Button>
      </div>
    </div>
  );
};
