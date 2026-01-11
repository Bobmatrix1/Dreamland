import { useContext } from "react";
import { UserMinus, MessageSquare, User } from "lucide-react";
import { GlassCard } from "../ui/glass/GlassCard";
import { GlassButton } from "../ui/glass/GlassButton";
import { useUsers } from "../../../hooks/useUsers";
import { AuthContext } from "../../App";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useChats } from "../../../hooks/useChats";
import { doc, updateDoc, arrayRemove } from "firebase/firestore";
import { db } from "../../../lib/firebase/config";
import { motion } from "motion/react";
import { StatusIndicator } from "../ui/StatusIndicator";

export function FriendList() {
  const { users } = useUsers();
  const authContext = useContext(AuthContext);
  const currentUser = authContext?.user;
  const navigate = useNavigate();
  const { createChat } = useChats();

  // Get current user's friends from the users list to ensure real-time updates
  const currentUserDoc = users.find(u => u.id === currentUser?.uid);
  const friendIds = currentUserDoc?.friends || [];
  const friends = users.filter(u => friendIds.includes(u.id));

  const handleMessage = async (userId: string) => {
    if (!currentUser) return;
    try {
      await createChat([currentUser.uid, userId], 'direct');
      navigate('/dashboard/chat');
    } catch (error) {
      console.error("Failed to start chat", error);
      toast.error("Failed to start chat");
    }
  };

  const handleUnfriend = async (friendId: string, friendName: string) => {
    if (!currentUser || !confirm(`Are you sure you want to unfriend ${friendName}?`)) return;

    try {
      // Remove from current user's friend list
      const currentUserRef = doc(db, 'users', currentUser.uid);
      await updateDoc(currentUserRef, {
        friends: arrayRemove(friendId)
      });

      // Remove from friend's friend list
      const friendRef = doc(db, 'users', friendId);
      await updateDoc(friendRef, {
        friends: arrayRemove(currentUser.uid)
      });

      toast.success(`Unfriended ${friendName}`);
    } catch (error) {
      console.error("Error unfriending:", error);
      toast.error("Failed to unfriend user");
    }
  };

  if (friends.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground bg-accent/5 rounded-xl border border-dashed border-accent/20">
        <User size={48} className="mx-auto mb-3 opacity-20" />
        <p>You haven't added any friends yet.</p>
        <p className="text-xs mt-1">Search for users to add them!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {friends.map(friend => (
        <motion.div
          key={friend.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
        >
          <GlassCard className="flex items-center gap-4 p-4">
            <div className="relative">
              <img
                src={friend.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.id}`}
                alt={friend.displayName}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="absolute bottom-0 right-0">
                <StatusIndicator status={friend.status} showText={false} />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-medium truncate">{friend.displayName}</h4>
              <p className="text-sm text-muted-foreground truncate">{friend.email}</p>
            </div>

            <div className="flex gap-2">
              <GlassButton 
                size="sm" 
                onClick={() => handleMessage(friend.id)}
                title="Message"
              >
                <MessageSquare size={16} />
              </GlassButton>
              <GlassButton 
                size="sm"
                variant="secondary"
                className="hover:bg-red-500/10 hover:text-red-500"
                onClick={() => handleUnfriend(friend.id, friend.displayName)}
                title="Unfriend"
              >
                <UserMinus size={16} />
              </GlassButton>
            </div>
          </GlassCard>
        </motion.div>
      ))}
    </div>
  );
}
