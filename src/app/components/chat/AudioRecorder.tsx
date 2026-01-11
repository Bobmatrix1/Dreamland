import { useState, useEffect, useRef } from "react";
import { X, Send } from "lucide-react";
import { motion } from "motion/react";
import { GlassCard } from "../ui/glass/GlassCard";
import { GlassButton } from "../ui/glass/GlassButton";

interface AudioRecorderProps {
  onSend: (audioBlob: Blob) => void;
  onCancel: () => void;
}

export function AudioRecorder({ onSend, onCancel }: AudioRecorderProps) {
  const [duration, setDuration] = useState(0);
  const [audioData, setAudioData] = useState<number[]>(new Array(50).fill(0));
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const animationFrameRef = useRef<number>();
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    startRecording();
    return () => {
      stopRecording();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      // Setup audio analysis
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 128;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Visualize audio
      const visualize = () => {
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        
        // Normalize and create wave data
        const wave = Array.from(dataArray.slice(0, 50)).map(v => v / 255);
        setAudioData(wave);
        
        animationFrameRef.current = requestAnimationFrame(visualize);
      };
      visualize();

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.start();

      // Timer
      const interval = setInterval(() => {
        setDuration(d => d + 1);
      }, 1000);

      return () => clearInterval(interval);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      onCancel();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleSend = () => {
    stopRecording();
    if (audioChunksRef.current.length > 0) {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      onSend(audioBlob);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <GlassCard className="p-6">
          <div className="text-center mb-6">
            <div className="text-2xl mb-2">{formatDuration(duration)}</div>
            <div className="text-sm text-muted-foreground">Recording...</div>
          </div>

          {/* Rainbow Audio Visualizer */}
          <div className="h-32 flex items-center justify-center gap-1 mb-6 px-4">
            {audioData.map((value, index) => {
              const hue = (index / audioData.length) * 360;
              const height = Math.max(value * 100, 4);
              
              return (
                <motion.div
                  key={index}
                  className="flex-1 rounded-full"
                  style={{
                    background: `linear-gradient(to top, hsl(${hue}, 100%, 50%), hsl(${hue + 60}, 100%, 60%))`,
                    height: `${height}%`,
                    minHeight: '4px'
                  }}
                  animate={{ height: `${height}%` }}
                  transition={{ duration: 0.1 }}
                />
              );
            })}
          </div>

          <div className="flex gap-3">
            <GlassButton
              variant="secondary"
              onClick={() => {
                stopRecording();
                onCancel();
              }}
              className="flex-1"
            >
              <X size={20} className="mr-2" />
              Cancel
            </GlassButton>
            <GlassButton onClick={handleSend} className="flex-1">
              <Send size={20} className="mr-2" />
              Send
            </GlassButton>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
