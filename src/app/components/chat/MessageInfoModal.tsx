import { motion, AnimatePresence } from "motion/react";
import { GlassCard } from "../ui/glass/GlassCard";
import { X, Check, CheckCheck } from "lucide-react";
import { format } from "date-fns";

interface MessageInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: any;
}

export function MessageInfoModal({ isOpen, onClose, message }: MessageInfoModalProps) {
  if (!isOpen) return null;

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
          <GlassCard className="flex flex-col">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-semibold">Message Info</h3>
              <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="p-4 space-y-6">
              <div className="bg-white/5 p-3 rounded-lg border-l-4 border-purple-500">
                <p className="text-sm">{message.content}</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCheck className="text-blue-500" size={20} />
                  <div>
                    <p className="text-sm font-medium">Read</p>
                    <p className="text-xs text-muted-foreground">
                      {message.readAt ? format(new Date(message.readAt), "MMM d, yyyy 'at' h:mm a") : "—"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Check className="text-gray-400" size={20} />
                  <div>
                    <p className="text-sm font-medium">Delivered</p>
                    <p className="text-xs text-muted-foreground">
                      {message.deliveredAt ? format(new Date(message.deliveredAt), "MMM d, yyyy 'at' h:mm a") : format(new Date(message.timestamp), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
