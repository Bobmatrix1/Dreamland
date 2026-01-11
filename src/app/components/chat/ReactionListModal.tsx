import { motion, AnimatePresence } from "motion/react";
import { GlassCard } from "../ui/glass/GlassCard";
import { X, User } from "lucide-react";
import { useUsers } from "../../../hooks/useUsers";

interface Reaction {
  emoji: string;
  userId: string;
  timestamp: string;
}

interface ReactionListModalProps {
  isOpen: boolean;
  onClose: () => void;
  reactions: Reaction[];
  currentUserId?: string;
  onRemoveReaction: (emoji: string) => void;
}

export function ReactionListModal({ 
  isOpen, 
  onClose, 
  reactions, 
  currentUserId,
  onRemoveReaction 
}: ReactionListModalProps) {
  const { users } = useUsers();

  if (!isOpen) return null;

  // Group reactions by emoji
  const groupedReactions = reactions.reduce((acc, r) => {
    if (!acc[r.emoji]) acc[r.emoji] = [];
    acc[r.emoji].push(r);
    return acc;
  }, {} as Record<string, Reaction[]>);

  const activeEmojis = Object.keys(groupedReactions);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <GlassCard className="max-h-[60vh] flex flex-col">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-semibold">Reactions</h3>
              <button 
                onClick={onClose}
                className="p-1 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {activeEmojis.map(emoji => (
                <div key={emoji} className="space-y-3">
                  <h4 className="text-xl flex items-center gap-2">
                    <span>{emoji}</span>
                    <span className="text-sm text-muted-foreground font-normal">
                      {groupedReactions[emoji].length}
                    </span>
                  </h4>
                  
                  <div className="space-y-2">
                    {groupedReactions[emoji].map(reaction => {
                      const user = users.find(u => u.id === reaction.userId);
                      const isMe = reaction.userId === currentUserId;

                      return (
                        <div key={reaction.timestamp} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5">
                          <div className="flex items-center gap-3">
                            <img
                              src={user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${reaction.userId}`}
                              alt={user?.displayName}
                              className="w-8 h-8 rounded-full"
                            />
                            <div>
                              <p className="text-sm font-medium">
                                {isMe ? "You" : user?.displayName || "Unknown User"}
                              </p>
                            </div>
                          </div>
                          
                          {isMe && (
                            <button
                              onClick={() => onRemoveReaction(emoji)}
                              className="text-xs text-red-400 hover:bg-red-500/10 px-2 py-1 rounded transition-colors"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
