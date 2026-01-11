import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2 } from "lucide-react";
import { motion } from "motion/react";

interface AudioMessageProps {
  src: string;
  isOwn?: boolean;
}

export function AudioMessage({ src, isOwn = false }: AudioMessageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const currentProgress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(currentProgress);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`flex items-center gap-3 min-w-[200px] max-w-[280px] px-3 py-1`}>
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />
      
      <button
        onClick={togglePlay}
        className={`
          w-8 h-8 rounded-full flex items-center justify-center shrink-0
          transition-all duration-200 active:scale-95
          ${isOwn 
            ? 'bg-white/20 text-white hover:bg-white/30' 
            : 'bg-purple-500 text-white hover:bg-purple-600 shadow-lg'
          }
        `}
      >
        {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
      </button>

      <div className="flex-1 flex flex-col gap-1.5">
        <div className="relative h-1 w-full bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className={`absolute inset-y-0 left-0 rounded-full ${isOwn ? 'bg-white' : 'bg-gradient-to-r from-purple-500 to-pink-500'}`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", bounce: 0, duration: 0.2 }}
          />
        </div>
        
        <div className={`flex justify-between items-center text-[10px] ${isOwn ? 'text-white/70' : 'text-muted-foreground'}`}>
          <span>{formatTime(audioRef.current?.currentTime || 0)}</span>
          <div className="flex items-center gap-1">
            <Volume2 size={10} />
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
