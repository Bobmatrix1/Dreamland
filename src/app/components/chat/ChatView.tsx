import { useState, useEffect, useContext, useRef } from "react";
import { createPortal } from "react-dom";
import { Search, Send, Smile, Paperclip, Mic, MoreVertical, Users, Image, Palette, Pin, Copy, Reply, Trash2, Download, X, Loader2, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { GlassCard } from "../ui/glass/GlassCard";
import { GlassInput } from "../ui/glass/GlassInput";
import { GlassButton } from "../ui/glass/GlassButton";
import { CreateGroupModal } from "./CreateGroupModal";
import { AudioRecorder } from "./AudioRecorder";
import { AudioMessage } from "./AudioMessage";
import { ChatCustomization } from "./ChatCustomization";
import { EmojiPicker } from "./EmojiPicker";
import { ReactionListModal } from "./ReactionListModal";
import { FullEmojiPicker } from "./FullEmojiPicker";
import { MessageActions } from "./MessageActions";
import { MessageInfoModal } from "./MessageInfoModal";
import { MessageItem } from "./MessageItem";
import { getUserColor } from "../../../utils/chatColors";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useChats, useMessages } from "../../../hooks/useChats";
import { useUsers } from "../../../hooks/useUsers";
import { AuthContext } from "../../App";
import { uploadToCloudinary } from "../../../lib/cloudinary/config";
import { useIsMobile } from "../ui/use-mobile";
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase/config";
import { useLongPress } from "../../../hooks/useLongPress";
import { isSingleEmoji } from "../../../utils/helpers";
import { StatusIndicator } from "../ui/StatusIndicator";

interface ChatViewProps {
  onProfileClick: (user: any) => void;
}

export function ChatView({ onProfileClick }: ChatViewProps) {
  const authContext = useContext(AuthContext);
  const { user: currentUser } = authContext || {};
  const { chats, loading: chatsLoading, createChat } = useChats();
  const { users } = useUsers();
  const isMobile = useIsMobile();
  
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const { messages, sendMessage } = useMessages(selectedChat?.id || null);

  const [newMessage, setNewMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCustomization, setShowCustomization] = useState(false);
  const [chatBackground, setChatBackground] = useState('bg-transparent');
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [showFullPicker, setShowFullPicker] = useState(false);
  const [showingReactions, setShowingReactions] = useState<{messageId: string, reactions: any[]} | null>(null);
  
  const [highlightedMessage, setHighlightedMessage] = useState<{message: any, rect: DOMRect} | null>(null);
  const [showInfoModal, setShowInfoModal] = useState<any>(null);
  const [bottomSpacerHeight, setBottomSpacerHeight] = useState(0);

  useEffect(() => {
    if (!highlightedMessage) {
      const timer = setTimeout(() => setBottomSpacerHeight(0), 300);
      return () => clearTimeout(timer);
    }
  }, [highlightedMessage]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const handleLongPress = (target: EventTarget, message: any) => {
    if (!chatContainerRef.current) return;

    const targetEl = target as HTMLElement;
    const rect = targetEl.getBoundingClientRect();
    const messageActionsHeight = 320; 
    const margin = 20;
    
    const viewportHeight = window.innerHeight;
    
    const requiredSpaceBelow = margin + messageActionsHeight;
    const currentBottom = rect.bottom;
    
    // We want the message bottom to be at most (viewportHeight - requiredSpaceBelow)
    const targetBottom = viewportHeight - requiredSpaceBelow;
    const scrollAmount = currentBottom - targetBottom;

    if (scrollAmount > 0) {
      const container = chatContainerRef.current;
      const maxScroll = container.scrollHeight - container.clientHeight;
      const currentScroll = container.scrollTop;
      const availableScroll = maxScroll - currentScroll;
      
      if (scrollAmount > availableScroll) {
         const extraNeeded = scrollAmount - availableScroll;
         setBottomSpacerHeight(extraNeeded + 200); // Significant buffer
      }
      
      // Wait for state update and render
      setTimeout(() => {
        if (chatContainerRef.current) {
           chatContainerRef.current.scrollBy({ top: scrollAmount, behavior: 'smooth' });
        }
        
        // Wait for smooth scroll to finish before capturing new position
        setTimeout(() => {
          const newRect = targetEl.getBoundingClientRect();
          setHighlightedMessage({ message, rect: newRect });
        }, 400);
      }, 100);
    } else {
      setHighlightedMessage({ message, rect });
    }
  };
  
  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !replyingTo) || !currentUser || !selectedChat) return;

    try {
      await sendMessage(
        selectedChat.id,
        newMessage,
        currentUser.uid,
        'text',
        replyingTo?.id
      );
      setNewMessage("");
      setReplyingTo(null);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser || !selectedChat) return;

    setIsUploading(true);
    const toastId = toast.loading("Uploading image...");
    try {
      const url = await uploadToCloudinary(file);
      await sendMessage(
        selectedChat.id,
        url,
        currentUser.uid,
        'image',
        replyingTo?.id
      );
      toast.success("Image sent!", { id: toastId });
      setReplyingTo(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload image", { id: toastId });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAudioSend = async (audioBlob: Blob) => {
    if (!currentUser || !selectedChat) return;
    
    setIsRecording(false);
    const toastId = toast.loading("Sending voice message...");
    
    try {
      const audioFile = new File([audioBlob], "voice-message.webm", { type: 'audio/webm' });
      const url = await uploadToCloudinary(audioFile);
      
      await sendMessage(
        selectedChat.id,
        url,
        currentUser.uid,
        'audio'
      );
      toast.success("Voice message sent!", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Failed to send voice message", { id: toastId });
    }
  };

  const handleCreateGroup = async (name: string, participants: string[]) => {
    if (!currentUser) return;
    try {
      const allParticipants = [currentUser.uid, ...participants];
      await createChat(allParticipants, 'group', name);
      toast.success("Group created!");
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error("Failed to create group");
    }
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    if (!currentUser) return;
    
    setHighlightedMessage(null);

    try {
      const messageRef = doc(db, "messages", messageId);
      const messageDoc = await getDoc(messageRef);
      
      if (messageDoc.exists()) {
        const data = messageDoc.data();
        const reactions = data.reactions || [];
        
        const existingReactionIndex = reactions.findIndex(
          (r: any) => r.emoji === emoji && r.userId === currentUser.uid
        );

        if (existingReactionIndex > -1) {
          await updateDoc(messageRef, {
            reactions: arrayRemove(reactions[existingReactionIndex])
          });
        } else {
          await updateDoc(messageRef, {
            reactions: arrayUnion({
              emoji,
              userId: currentUser.uid,
              timestamp: new Date().toISOString()
            })
          });
        }
      }
    } catch (error) {
      console.error("Error updating reaction:", error);
      toast.error("Failed to update reaction");
    }
  };

  const handleMessageAction = (action: string, message: any) => {
    setHighlightedMessage(null);
    
    switch (action) {
      case 'reply':
        setReplyingTo(message);
        break;
      case 'copy':
        navigator.clipboard.writeText(message.content);
        toast.success("Message copied!");
        break;
      case 'delete':
        toast.info("Delete coming soon!");
        break;
      case 'info':
        setShowInfoModal(message);
        break;
      case 'star':
        toast.success("Message starred!");
        break;
      case 'forward':
        toast.info("Forward coming soon!");
        break;
      case 'pin':
        toast.success("Message pinned!");
        break;
    }
  };

  const getUser = (userId: string) => {
    return users.find(u => u.id === userId);
  };

  const getChatName = (chat: any) => {
    if (chat.type === 'group') return chat.name;
    const otherId = chat.participants.find((id: string) => id !== currentUser?.uid);
    const otherUser = getUser(otherId);
    return otherUser?.displayName || "Unknown User";
  };

  const getChatPhoto = (chat: any) => {
    if (chat.type === 'group') return chat.photoURL;
    const otherId = chat.participants.find((id: string) => id !== currentUser?.uid);
    const otherUser = getUser(otherId);
    return otherUser?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherId}`;
  };

  const getOnlineMembers = () => {
    if (!selectedChat || selectedChat.type !== 'group') return [];
    return users.filter(u => 
      selectedChat.participants.includes(u.id) && u.status === 'online'
    );
  };

  const dropdownActions = [
    { icon: Users, label: "View Members", action: "members" },
    { icon: Palette, label: "Customize Chat", action: "customize" },
    { icon: Image, label: "Media Gallery", action: "gallery" },
    { icon: Pin, label: "Pinned Messages", action: "pinned" },
    { icon: Search, label: "Search in Chat", action: "search" },
    { icon: Download, label: "Export Chat", action: "export" },
  ];

  if (!currentUser) return null;

  const showChatList = !isMobile || (isMobile && !selectedChat);
  const showChatWindow = !isMobile || (isMobile && selectedChat);

  const getOverlayPositions = (rect: DOMRect) => {
    // Always enforce standard layout: Emoji Top, Actions Bottom
    const pickerWidth = 280;
    const actionsWidth = 200;
    const margin = 12;
    const emojiPickerHeight = 50; 

    // Emoji Top
    let emojiY = rect.top - emojiPickerHeight - margin;
    
    // Actions Bottom
    let actionY = rect.bottom + margin;

    // Center X
    let emojiX = rect.left + (rect.width / 2) - (pickerWidth / 2);
    emojiX = Math.max(margin, Math.min(window.innerWidth - pickerWidth - margin, emojiX));
    
    let actionX = rect.left;
    actionX = Math.max(margin, Math.min(window.innerWidth - actionsWidth - margin, actionX));

    return {
      emoji: { x: emojiX, y: emojiY },
      actions: { x: actionX, y: actionY }
    };
  };

  return (
    <div className="h-full flex relative overflow-hidden">
      {/* Chat List */}
      <div className={`
        flex-col border-r border-[var(--glass-border)]
        ${showChatList ? 'flex w-full md:w-80' : 'hidden'}
        ${isMobile ? 'absolute inset-0 z-10 bg-background/80 backdrop-blur-xl' : ''}
        md:relative md:bg-transparent md:backdrop-blur-none
      `}>
        <div className="p-4 border-b border-[var(--glass-border)]">
          <div className="flex items-center justify-between mb-4">
            <h2>Messages</h2>
            <button
              onClick={() => setShowCreateGroup(true)}
              className="hover:bg-accent/50 p-2 rounded-lg transition-colors"
              title="Create Group"
            >
              <Users size={20} />
            </button>
          </div>
          <GlassInput
            icon={<Search size={18} />}
            placeholder="Search chats..."
          />
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {chatsLoading ? (
             <div className="p-4 text-center text-muted-foreground">Loading chats...</div>
          ) : chats.length === 0 ? (
             <div className="p-4 text-center text-muted-foreground">No chats yet. Start one!</div>
          ) : (
            chats.map((chat) => (
              <motion.button
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                className={`
                  w-full p-3 rounded-xl mb-2 text-left transition-all
                  ${selectedChat?.id === chat.id
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                    : "hover:bg-accent/50"
                  }
                `}
                whileHover={{ x: 4 }}
              >
                <div className="flex items-start gap-3">
                  <img
                    src={getChatPhoto(chat)}
                    alt={getChatName(chat)}
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="truncate">{getChatName(chat)}</span>
                      {chat.unreadCount > 0 && (
                        <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className={`text-sm truncate ${
                      selectedChat?.id === chat.id ? "text-white/80" : "text-muted-foreground"
                    }`}>
                      {chat.lastMessage?.text || "No messages yet"}
                    </p>
                    {chat.lastMessage?.timestamp && (
                      <p className={`text-xs mt-1 ${
                        selectedChat?.id === chat.id ? "text-white/60" : "text-muted-foreground"
                      }`}>
                        {(() => {
                          try {
                            return format(new Date(chat.lastMessage.timestamp), "hh:mm a");
                          } catch (e) {
                            return "";
                          }
                        })()}
                      </p>
                    )}
                  </div>
                </div>
              </motion.button>
            ))
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className={`
        flex-col relative
        ${showChatWindow ? 'flex flex-1' : 'hidden'}
        ${isMobile ? 'absolute inset-0 z-20 bg-background' : ''}
        md:relative md:bg-transparent
      `}>
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-[var(--glass-border)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isMobile && (
                  <button 
                    onClick={() => setSelectedChat(null)}
                    className="p-2 -ml-2 hover:bg-accent/50 rounded-full transition-colors"
                  >
                    <ArrowLeft size={20} />
                  </button>
                )}
                
                <div 
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => {
                    if (selectedChat.type === 'direct') {
                      const otherUserId = selectedChat.participants.find((id: string) => id !== currentUser.uid);
                      const user = getUser(otherUserId!);
                      if (user) onProfileClick(user);
                    }
                  }}
                >
                  <img
                    src={getChatPhoto(selectedChat)}
                    alt={getChatName(selectedChat)}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <h3 className="font-semibold">{getChatName(selectedChat)}</h3>
                    {selectedChat.type === "group" ? (
                      <p className="text-xs text-muted-foreground">
                        {getOnlineMembers().length} online • {selectedChat.participants.length} members
                      </p>
                    ) : (
                      <div className="text-xs text-muted-foreground">
                        {(() => {
                           const otherUser = getUser(selectedChat.participants.find((id: string) => id !== currentUser.uid));
                           if (otherUser?.status === 'online') return <span className="text-green-500">Online</span>;
                           if (otherUser?.status === 'away') return <span className="text-orange-500">Away</span>;
                           if (otherUser?.lastSeen) {
                            return `Last seen ${formatDistanceToNow(otherUser.lastSeen.toDate(), { addSuffix: true })}`;
                           }
                           return 'Offline';
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="relative">
                <button 
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="hover:bg-accent/50 p-2 rounded-lg transition-colors"
                >
                  <MoreVertical size={20} />
                </button>

                <AnimatePresence>
                  {showDropdown && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute right-0 top-full mt-2 w-56 z-10"
                    >
                      <GlassCard className="p-2">
                        {dropdownActions.map((item) => {
                          const Icon = item.icon;
                          return (
                            <button
                              key={item.action}
                              onClick={() => {
                                if (item.action === 'customize') {
                                  setShowCustomization(true);
                                } else {
                                  toast.info(`${item.label} - Coming soon!`);
                                }
                                setShowDropdown(false);
                              }}
                              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent/50 transition-colors text-left"
                            >
                              <Icon size={18} />
                              <span>{item.label}</span>
                            </button>
                          );
                        })}
                      </GlassCard>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Messages */}
            <div ref={chatContainerRef} className={`flex-1 overflow-y-auto p-4 space-y-4 ${chatBackground}`}>
              {messages.map((message) => {
                const sender = getUser(message.senderId);
                const isOwn = message.senderId === currentUser.uid;
                const userColor = getUserColor(message.senderId);
                const replyMessageData = message.replyTo ? messages.find(m => m.id === message.replyTo) : null;
                const replyMessage = replyMessageData ? { ...replyMessageData, sender: getUser(replyMessageData.senderId) } : null;
                const isHighlighted = highlightedMessage?.message.id === message.id;

                return (
                  <MessageItem
                    key={message.id}
                    message={message}
                    sender={sender}
                    isOwn={isOwn}
                    userColor={userColor}
                    replyMessage={replyMessage}
                    isHighlighted={isHighlighted}
                    onProfileClick={onProfileClick}
                    onLongPress={handleLongPress}
                    onShowReactions={(messageId, reactions) => setShowingReactions({ messageId, reactions })}
                  />
                );
              })}
              <div style={{ height: bottomSpacerHeight, transition: 'height 0.3s ease' }} />
              <div ref={messagesEndRef} />
            </div>

            {/* Message Interactions Overlay via Portal */}
            {highlightedMessage && createPortal(
              (() => {
                const positions = getOverlayPositions(highlightedMessage.rect);
                return (
                  <div className="fixed inset-0 z-[9999]">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                      onClick={() => setHighlightedMessage(null)}
                    />
                    
                    <div 
                      style={{
                        position: 'fixed',
                        top: highlightedMessage.rect.top,
                        left: highlightedMessage.rect.left,
                        width: highlightedMessage.rect.width,
                        height: highlightedMessage.rect.height,
                        pointerEvents: 'none'
                      }}
                    >
                       {(() => {
                         const message = highlightedMessage.message;
                         const isOwn = message.senderId === currentUser.uid;
                         const userColor = getUserColor(message.senderId);
                         const isJumbo = isSingleEmoji(message.content);
                         
                         if (isJumbo) {
                           return <div className="text-5xl scale-110 drop-shadow-2xl">{message.content}</div>;
                         }
                         
                         return (
                            <GlassCard className={`px-3 py-1 ${
                              isOwn ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : `bg-gradient-to-r ${userColor} text-white`
                            } ring-4 ring-white/30 scale-105 shadow-2xl`}>
                              {message.type === 'image' ? (
                                <img src={message.content} className="max-w-full rounded-lg" />
                              ) : message.type === 'audio' ? (
                                <AudioMessage src={message.content} isOwn={isOwn} />
                              ) : (
                                <div className="flex flex-wrap items-end gap-2">
                                  <p className="break-words">{message.content}</p>
                                  <span className={`text-[10px] whitespace-nowrap ml-auto ${isOwn ? "text-white/70" : "text-white/60"}`}>
                                    {(() => { try { return format(new Date(message.timestamp), "p"); } catch { return ""; } })()}
                                  </span>
                                </div>
                              )}
                            </GlassCard>
                         );
                       })()}
                    </div>

                    <EmojiPicker 
                      position={positions.emoji}
                      onSelect={(emoji) => handleReaction(highlightedMessage.message.id, emoji)}
                      onClose={() => setHighlightedMessage(null)}
                    />
                    <MessageActions
                      position={positions.actions}
                      isOwnMessage={highlightedMessage.message.senderId === currentUser.uid}
                      onAction={(action) => handleMessageAction(action, highlightedMessage.message)}
                      onClose={() => setHighlightedMessage(null)}
                    />
                  </div>
                );
              })(),
              document.body
            )}

            {/* Reply Preview */}
            <AnimatePresence>
              {replyingTo && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="px-4 py-2 border-t border-[var(--glass-border)] bg-accent/30"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">
                        Replying to {getUser(replyingTo.senderId)?.displayName}
                      </p>
                      <p className="text-sm truncate">{replyingTo.content}</p>
                    </div>
                    <button
                      onClick={() => setReplyingTo(null)}
                      className="p-1 hover:bg-accent/50 rounded transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Message Input */}
            <div className="p-3 border-t border-[var(--glass-border)] pb-safe-area-bottom">
              <div className="flex items-end gap-2">
                <div className="flex gap-1 pb-1">
                  <button 
                    onClick={handleFileClick}
                    disabled={isUploading}
                    className="hover:bg-accent/50 p-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isUploading ? <Loader2 className="animate-spin" size={20} /> : <Paperclip size={20} />}
                  </button>
                  <input 
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <button 
                    onClick={() => setShowFullPicker(!showFullPicker)} 
                    className="hover:bg-accent/50 p-2 rounded-lg transition-colors"
                  >
                    <Smile size={20} />
                  </button>
                </div>
                
                <div className="relative flex-1">
                  <GlassInput
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    className="w-full"
                    multiline={true}
                  />
                  {showFullPicker && (
                    <FullEmojiPicker
                      onEmojiSelect={(emoji) => setNewMessage(prev => prev + emoji)}
                      onClose={() => setShowFullPicker(false)}
                    />
                  )}
                </div>
                
                <div className="flex gap-1 pb-1">
                   {newMessage.trim() ? (
                      <GlassButton onClick={handleSendMessage} size="icon" className="h-10 w-10">
                        <Send size={18} />
                      </GlassButton>
                   ) : (
                      <button
                        onClick={() => setIsRecording(true)}
                        className={`p-2 rounded-lg transition-all ${
                          isRecording ? "bg-red-500 text-white animate-pulse" : "hover:bg-accent/50"
                        }`}
                      >
                        <Mic size={20} />
                      </button>
                   )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center flex-col text-muted-foreground p-4 text-center">
            <h3 className="text-xl mb-2">Welcome to Dreamland!</h3>
            <p>Select a chat to start messaging or create a new group.</p>
          </div>
        )}

        {/* Customization Panel */}
        <AnimatePresence>
          {showCustomization && (
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className="absolute inset-0 z-50 bg-background md:left-auto md:w-80 border-l border-[var(--glass-border)]"
            >
              <div className="h-full flex flex-col">
                <div className="p-4 border-b flex items-center gap-3">
                   <button onClick={() => setShowCustomization(false)} className="md:hidden p-2 -ml-2">
                     <ArrowLeft size={20} />
                   </button>
                   <h3 className="font-semibold">Customize Chat</h3>
                </div>
                <div className="flex-1 p-4">
                  <ChatCustomization
                    currentBackground={chatBackground}
                    onBackgroundChange={setChatBackground}
                    onClose={() => setShowCustomization(false)}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <CreateGroupModal
        isOpen={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
        onCreateGroup={handleCreateGroup}
        users={users.filter(u => u.id !== currentUser?.uid)} 
      />

      {isRecording && (
        <AudioRecorder
          onSend={handleAudioSend}
          onCancel={() => setIsRecording(false)}
        />
      )}

      <MessageInfoModal 
        isOpen={!!showInfoModal}
        onClose={() => setShowInfoModal(null)}
        message={showInfoModal}
      />

      <ReactionListModal 
        isOpen={!!showingReactions}
        onClose={() => setShowingReactions(null)}
        reactions={showingReactions?.reactions || []}
        currentUserId={currentUser?.uid}
        onRemoveReaction={(emoji) => {
          if (showingReactions) {
            handleReaction(showingReactions.messageId, emoji);
            setShowingReactions(null);
          }
        }}
      />
    </div>
  );
}