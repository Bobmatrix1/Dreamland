import { motion } from "motion/react";
import { GlassCard } from "../ui/glass/GlassCard";
import { Reply, Forward, Copy, Info, Star, Trash2, Pin } from "lucide-react";

interface MessageActionsProps {
  position: { x: number; y: number };
  isOwnMessage: boolean;
  onAction: (action: string) => void;
  onClose: () => void;
}

export function MessageActions({ position, isOwnMessage, onAction, onClose }: MessageActionsProps) {
  const actions = [
    { id: 'reply', label: 'Reply', icon: Reply },
    { id: 'forward', label: 'Forward', icon: Forward },
    { id: 'copy', label: 'Copy', icon: Copy },
    { id: 'info', label: 'Info', icon: Info },
    { id: 'star', label: 'Star', icon: Star },
    { id: 'pin', label: 'Pin', icon: Pin },
    ...(isOwnMessage ? [{ id: 'delete', label: 'Delete', icon: Trash2, danger: true }] : [])
  ];

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 10 }}
        style={{ 
          position: 'fixed', 
          left: position.x, 
          top: position.y,
          zIndex: 60 
        }}
        className="min-w-[200px]"
      >
        <GlassCard className="overflow-hidden p-1">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={() => {
                onAction(action.id);
                onClose();
              }}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors
                ${action.danger 
                  ? 'text-red-500 hover:bg-red-500/10' 
                  : 'text-foreground hover:bg-white/10'
                }
              `}
            >
              <action.icon size={16} />
              {action.label}
            </button>
          ))}
        </GlassCard>
      </motion.div>
    </>
  );
}
