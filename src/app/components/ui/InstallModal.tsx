import { motion, AnimatePresence } from "motion/react";
import { Download, X } from "lucide-react";
import { GlassCard } from "./glass/GlassCard";
import { GlassButton } from "./glass/GlassButton";

interface InstallModalProps {
  isOpen: boolean;
  onInstall: () => void;
  onClose: () => void;
}

export function InstallModal({ isOpen, onInstall, onClose }: InstallModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-sm"
          >
            <GlassCard className="p-6 relative overflow-hidden">
              {/* Decorative background */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500" />
              
              <button 
                onClick={onClose}
                className="absolute top-2 right-2 p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={20} className="text-muted-foreground" />
              </button>

              <div className="flex flex-col items-center text-center mt-2">
                <div className="w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                  <Download className="text-white w-8 h-8" />
                </div>
                
                <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Install Dreamland
                </h3>
                
                <p className="text-muted-foreground mb-6 text-sm">
                  Install the app for the best experience! Get faster access, offline mode, and a full-screen view.
                </p>

                <div className="flex gap-3 w-full">
                  <GlassButton 
                    variant="ghost" 
                    onClick={onClose}
                    className="flex-1"
                  >
                    Maybe Later
                  </GlassButton>
                  <GlassButton 
                    variant="primary" 
                    onClick={onInstall}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0"
                  >
                    Install Now
                  </GlassButton>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
