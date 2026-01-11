import { motion } from "motion/react";
import { GlassCard } from "../ui/glass/GlassCard";
import { Clock, Smile, Heart, Leaf } from "lucide-react";
import { useState } from "react";

interface FullEmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  onClose: () => void;
}

const emojiCategories = [
  {
    name: "Smileys & People",
    icon: <Smile size={18} />,
    emojis: ["😀", "😂", "😊", "😍", "🤔", "🤩", "😎", "😏", "😭", "😠", "👍", "👎", "👋", "🙏", "❤️"],
  },
  {
    name: "Animals & Nature",
    icon: <Leaf size={18} />,
    emojis: ["🐶", "🐱", "🐭", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐸", "🐵", "🐔"],
  },
  {
    name: "Food & Drink",
    icon: <Heart size={18} />, // No perfect icon, using heart for 'likes'
    emojis: ["🍏", "🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🍈", "🍒", "🍑", "🍍", "🥝", "🍅"],
  },
];

export function FullEmojiPicker({ onEmojiSelect, onClose }: FullEmojiPickerProps) {
  const [activeCategory, setActiveCategory] = useState(emojiCategories[0].name);

  return (
    <>
        <div className="fixed inset-0 z-30" onClick={onClose} />
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full right-0 mb-2 z-40 w-[300px] h-[350px]"
        >
            <GlassCard className="w-full h-full flex flex-col p-2">
                {/* Categories */}
                <div className="flex items-center border-b border-[var(--glass-border)] p-1">
                    {emojiCategories.map(category => (
                        <button 
                            key={category.name}
                            onClick={() => setActiveCategory(category.name)}
                            className={`
                                p-2 rounded-lg transition-colors
                                ${activeCategory === category.name 
                                    ? 'bg-purple-500/20 text-purple-400' 
                                    : 'text-muted-foreground hover:bg-accent/50'
                                }
                            `}
                        >
                            {category.icon}
                        </button>
                    ))}
                </div>

                {/* Emoji Grid */}
                <div className="flex-1 overflow-y-auto">
                    {emojiCategories.map(category => (
                        <div key={category.name} className={activeCategory === category.name ? 'block' : 'hidden'}>
                            <p className="text-xs font-bold text-muted-foreground p-2">{category.name}</p>
                            <div className="grid grid-cols-8 gap-1">
                                {category.emojis.map(emoji => (
                                    <motion.button
                                        key={emoji}
                                        onClick={() => onEmojiSelect(emoji)}
                                        className="text-2xl p-1 rounded-lg hover:bg-accent/50"
                                        whileHover={{ scale: 1.2 }}
                                    >
                                        {emoji}
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </GlassCard>
        </motion.div>
    </>
  );
}
