import { motion } from "motion/react";
import { GlassCard } from "../ui/glass/GlassCard";

const emojis = ['❤️', '😂', '😮', '😢', '😡', '👍'];

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  position?: { x: number; y: number };
  onClose?: () => void;
}

export function EmojiPicker({ onSelect, position, onClose }: EmojiPickerProps) {
  // WhatsApp style: Absolute positioning relative to the message container
  // We expect 'position' to be null now, as we'll rely on parent relative positioning
  // or we pass explicit coordinates if using a portal.
  // Assuming this is rendered inside the ChatView relative container or fixed overlay.
  
  const style: React.CSSProperties = position ? {
    position: 'fixed',
    left: position.x,
    top: position.y,
    zIndex: 60,
  } : {};

  return (
    <>
      <div 
        className="fixed inset-0 z-50" 
        onClick={onClose}
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.5, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.5, y: 10 }}
        style={style}
        className="z-60 max-w-[90vw]"
      >
        <div className="bg-white dark:bg-zinc-800 rounded-full shadow-xl border border-gray-200 dark:border-gray-700 p-1 flex gap-1 items-center overflow-x-auto no-scrollbar">
          {emojis.map((emoji) => (
            <motion.button
              key={emoji}
              onClick={() => onSelect(emoji)}
              className="text-xl hover:scale-125 transition-transform p-1 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-700 leading-none"
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            >
              {emoji}
            </motion.button>
          ))}
          <button className="w-7 h-7 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-700 flex items-center justify-center text-gray-500 text-sm">
            +
          </button>
        </div>
      </motion.div>
    </>
  );
}
