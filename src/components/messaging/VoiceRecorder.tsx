import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VoiceRecorderProps {
  onSend: (audioBlob: Blob, duration: number) => void;
  onCancel: () => void;
}

export function VoiceRecorder({ onSend, onCancel }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [waveform, setWaveform] = useState<number[]>(Array(40).fill(0));
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Setup audio analysis for waveform
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const updateWaveform = () => {
        if (!analyserRef.current) return;
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        
        const bars = 40;
        const step = Math.floor(dataArray.length / bars);
        const newWaveform = Array.from({ length: bars }, (_, i) => 
          Math.min(100, (dataArray[i * step] / 255) * 100)
        );
        setWaveform(newWaveform);
        animationRef.current = requestAnimationFrame(updateWaveform);
      };
      updateWaveform();

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      timerRef.current = setInterval(() => {
        setDuration(prev => {
          if (prev >= 120) {
            stopRecording();
            return 120;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleSend = () => {
    if (audioBlob) {
      onSend(audioBlob, duration);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    startRecording();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <div className="flex items-center gap-3 p-4 bg-purple-50 border-t">
      <div className="flex-1 flex items-center gap-3">
        <div className="flex items-center gap-2">
          {isRecording ? (
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          ) : (
            <Mic className="w-5 h-5 text-purple-600" />
          )}
          <span className="text-sm font-medium text-gray-700">
            {formatTime(duration)}
          </span>
        </div>
        
        <div className="flex-1 flex items-center gap-0.5 h-12">
          {waveform.map((height, i) => (
            <div
              key={i}
              className="flex-1 bg-purple-500 rounded-full transition-all duration-100"
              style={{ height: `${Math.max(4, height)}%` }}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        {isRecording ? (
          <Button size="sm" onClick={stopRecording} variant="outline">
            <Square className="w-4 h-4" />
          </Button>
        ) : (
          <>
            <Button size="sm" onClick={onCancel} variant="outline">
              <X className="w-4 h-4" />
            </Button>
            <Button size="sm" onClick={handleSend} className="bg-purple-600">
              <Send className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
