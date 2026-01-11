import { useState } from "react";
import { Palette } from "lucide-react";
import { GlassCard } from "../ui/glass/GlassCard";
import { GlassButton } from "../ui/glass/GlassButton";

const backgrounds = [
  { id: 'default', name: 'Default', gradient: 'bg-transparent' },
  { id: 'sunset', name: 'Sunset', gradient: 'bg-gradient-to-br from-orange-400/20 via-pink-400/20 to-purple-400/20' },
  { id: 'ocean', name: 'Ocean', gradient: 'bg-gradient-to-br from-blue-400/20 via-cyan-400/20 to-teal-400/20' },
  { id: 'forest', name: 'Forest', gradient: 'bg-gradient-to-br from-green-400/20 via-emerald-400/20 to-lime-400/20' },
  { id: 'galaxy', name: 'Galaxy', gradient: 'bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-pink-900/20' },
  { id: 'candy', name: 'Candy', gradient: 'bg-gradient-to-br from-pink-400/20 via-purple-400/20 to-blue-400/20' },
];

interface ChatCustomizationProps {
  currentBackground: string;
  onBackgroundChange: (bg: string) => void;
  onClose: () => void;
}

export function ChatCustomization({ currentBackground, onBackgroundChange, onClose }: ChatCustomizationProps) {
  return (
    <GlassCard className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Palette size={20} />
        <h3>Chat Background</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-4">
        {backgrounds.map((bg) => (
          <button
            key={bg.id}
            onClick={() => onBackgroundChange(bg.gradient)}
            className={`p-4 rounded-xl transition-all ${bg.gradient} ${
              currentBackground === bg.gradient
                ? 'ring-2 ring-purple-500'
                : 'hover:scale-105'
            }`}
          >
            <div className="h-12 rounded-lg bg-white/10 backdrop-blur-sm mb-2" />
            <p className="text-sm">{bg.name}</p>
          </button>
        ))}
      </div>

      <GlassButton onClick={onClose} className="w-full">
        Close
      </GlassButton>
    </GlassCard>
  );
}
