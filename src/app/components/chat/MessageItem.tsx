import React from 'react';
import { motion } from 'motion/react';
import { GlassCard } from '../ui/glass/GlassCard';
import { AudioMessage } from './AudioMessage';
import { useLongPress } from '../../../hooks/useLongPress';
import { format } from 'date-fns';
import { isSingleEmoji } from '../../../utils/helpers';


interface MessageItemProps {
  message: any;
  sender: any;
  isOwn: boolean;
  userColor: string;
  replyMessage: any;
  isHighlighted: boolean;
  onProfileClick: (user: any) => void;
  onLongPress: (target: EventTarget, message: any) => void;
  onShowReactions: (messageId: string, reactions: any[]) => void;
}

export const MessageItem = React.memo(({
  message,
  sender,
  isOwn,
  userColor,
  replyMessage,
  isHighlighted,
  onProfileClick,
  onLongPress,
  onShowReactions,
}: MessageItemProps) => {

  const longPressEvents = useLongPress((target) => {
    onLongPress(target, message);
  });
  
  const isJumbo = isSingleEmoji(message.content);

  return (
    <motion.div
      key={message.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 relative ${isOwn ? "flex-row-reverse" : ""} ${isHighlighted ? "opacity-0" : ""}`}
      style={{ pointerEvents: 'none' }}
    >
      <img
        src={sender?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${message.senderId}`}
        alt={sender?.displayName || "User"}
        className="w-8 h-8 rounded-full cursor-pointer hover:scale-110 transition-transform"
        onClick={() => onProfileClick(sender)}
        style={{ pointerEvents: 'auto' }}
      />
      <div className={`max-w-[75%] flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
        {!isOwn && (
          <p className="text-xs mb-1 ml-1 opacity-70">{sender?.displayName || "Unknown"}</p>
        )}
        
        <div 
          className="relative group cursor-pointer select-none"
          {...longPressEvents}
          style={{ pointerEvents: 'auto' }}
        >
          {isJumbo ? (
            <motion.div 
              className={`text-5xl`}
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 15, stiffness: 400 }}
            >
              {message.content}
            </motion.div>
          ) : (
            <GlassCard className={`px-3 py-1 ${
              isOwn ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : `bg-gradient-to-r ${userColor} text-white`
            }`}>
              {replyMessage && (
                <div className="mb-2 p-2 rounded bg-black/20 border-l-2 border-white/50">
                  <p className="text-xs opacity-70">Replying to {replyMessage.sender?.displayName}</p>
                  <p className="text-sm truncate">{replyMessage.content}</p>
                </div>
              )}
              
              {message.type === 'image' ? (
                <img 
                  src={message.content} 
                  alt="Shared image" 
                  className="max-w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => window.open(message.content, '_blank')}
                />
              ) : message.type === 'audio' ? (
                <AudioMessage src={message.content} isOwn={isOwn} />
              ) : (
                <div className="flex flex-wrap items-end gap-2">
                  <p className="break-words">{message.content}</p>
                  <span className={`text-[10px] whitespace-nowrap ml-auto ${isOwn ? "text-white/70" : "text-white/60"}`}>
                    {(() => {
                      try {
                        return format(new Date(message.timestamp), "p");
                      } catch (e) {
                        return "";
                      }
                    })()}
                  </span>
                </div>
              )}
              
              {message.reactions && message.reactions.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {Object.entries(
                    message.reactions.reduce((acc: any, r: any) => {
                      acc[r.emoji] = (acc[r.emoji] || 0) + 1;
                      return acc;
                    }, {})
                  ).map(([emoji, count]) => (
                    <button
                      key={emoji as string}
                      onClick={(e) => {
                        e.stopPropagation();
                        onShowReactions(message.id, message.reactions)
                      }}
                      className="text-xs px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
                    >
                      {emoji as string} {count as number}
                    </button>
                  ))}
                </div>
              )}
            </GlassCard>
          )}
        </div>
      </div>
    </motion.div>
  );
});
