import { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VoiceMessagePlayerProps {
  audioUrl: string;
  duration: number;
}

export function VoiceMessagePlayer({ audioUrl, duration }: VoiceMessagePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [waveform] = useState<number[]>(
    Array.from({ length: 30 }, () => Math.random() * 60 + 20)
  );
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
    });

    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setCurrentTime(0);
    });

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex items-center gap-3 min-w-[250px]">
      <Button
        size="sm"
        onClick={togglePlay}
        className="rounded-full w-8 h-8 p-0 bg-purple-600 hover:bg-purple-700"
      >
        {isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4 ml-0.5" />
        )}
      </Button>

      <div className="flex-1 relative">
        <div className="flex items-center gap-0.5 h-8">
          {waveform.map((height, i) => {
            const barProgress = (i / waveform.length) * 100;
            const isActive = barProgress <= progress;
            return (
              <div
                key={i}
                className={`flex-1 rounded-full transition-colors ${
                  isActive ? 'bg-purple-600' : 'bg-gray-300'
                }`}
                style={{ height: `${height}%` }}
              />
            );
          })}
        </div>
      </div>

      <span className="text-xs text-gray-600 min-w-[40px]">
        {formatTime(isPlaying ? currentTime : duration)}
      </span>
    </div>
  );
}
