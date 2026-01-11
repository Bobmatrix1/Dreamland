import { useState, useContext } from "react";
import { Search, UserPlus, Users, MessageSquare, Clock, X, Check, User as UserIcon, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { GlassCard } from "../ui/glass/GlassCard";
import { GlassInput } from "../ui/glass/GlassInput";
import { GlassButton } from "../ui/glass/GlassButton";
import { useUsers } from "../../../hooks/useUsers";
import { useFriendRequests } from "../../../hooks/useFriendRequests";
import { AuthContext } from "../../App";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useChats } from "../../../hooks/useChats";
import { FriendList } from "./FriendList";
import { StatusIndicator } from "../ui/StatusIndicator";
import React from "react";

type ActiveTab = 'friends' | 'discover' | 'requests';

interface UserCardProps {
  user: any;
  status: 'friend' | 'incoming' | 'outgoing' | 'none';
  onAction: (action: string, payload?: any) => void;
  isSuggestion?: boolean;
}

const UserCard = ({ 
  user, 
  status, 
  onAction,
  isSuggestion = false
}: UserCardProps) => {

    return (
      <GlassCard className={`flex items-center gap-4 p-4 ${isSuggestion ? 'border-purple-500/30 bg-purple-500/5' : ''}`}>
        <div className="relative">
          <img
            src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}
            alt={user.displayName}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="absolute bottom-0 right-0">
            <StatusIndicator status={user.status} showText={false} />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium truncate">{user.displayName}</h4>
          <p className="text-sm text-muted-foreground truncate">{user.email}</p>
          {isSuggestion && ( // Show "In your contacts" only if it's a suggestion
            <p className="text-xs text-purple-500 flex items-center gap-1 mt-1">
              <Smartphone size={10} />
              <span>In your contacts</span>
            </p>
          )}
        </div>

        <div className="shrink-0">
          {status === 'friend' ? (
            <GlassButton size="sm" onClick={() => onAction('message', user.id)} title="Message">
              <MessageSquare size={16} />
            </GlassButton>
          ) : status === 'incoming' ? (
            <div className="flex gap-2">
              <GlassButton 
                size="sm" 
                className="bg-green-500/20 text-green-500 hover:bg-green-500/30"
                onClick={() => onAction('accept', user)} title="Accept"
              ><Check size={16} /></GlassButton>
              <GlassButton 
                size="sm"
                className="bg-red-500/20 text-red-500 hover:bg-red-500/30"
                onClick={() => onAction('reject', user)} title="Reject"
              ><X size={16} /></GlassButton>
            </div>
          ) : status === 'outgoing' ? (
            <GlassButton size="sm" variant="secondary" onClick={() => onAction('cancel', user)} title="Cancel Request">
              <Clock size={16} className="mr-1" />
              Pending
            </GlassButton>
          ) : (
            <GlassButton size="sm" variant="primary" onClick={() => onAction('add', user.id)} title="Add Friend">
              <UserPlus size={16} />
            </GlassButton>
          )}
        </div>
      </GlassCard>
    );
  };


export function FindFriendsView() {
  const { users, loading } = useUsers();
  const authContext = useContext(AuthContext);
  const currentUser = authContext?.user;
  const navigate = useNavigate();
  const { createChat } = useChats();
  const { 
    incomingRequests, 
    outgoingRequests, 
    sendFriendRequest, 
    acceptFriendRequest, 
    rejectFriendRequest,
    cancelFriendRequest
  } = useFriendRequests();
  
  const [activeTab, setActiveTab] = useState<ActiveTab>('friends');
  const [searchQuery, setSearchQuery] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [contactsSynced, setContactsSynced] = useState(false);
  const [matchedUsers, setMatchedUsers] = useState<any[]>([]);

  // Helpers
  const isFriend = (userId: string) => {
    const currentUserDoc = users.find(u => u.id === currentUser?.uid);
    return currentUserDoc?.friends?.includes(userId);
  };

  const hasIncomingRequest = (userId: string) => incomingRequests.some(r => r.senderId === userId);
  const hasOutgoingRequest = (userId: string) => outgoingRequests.some(r => r.receiverId === userId);

  const getRelationshipStatus = (userId: string) => {
    const currentUserDoc = users.find(u => u.id === currentUser?.uid);
    if (currentUserDoc?.friends?.includes(userId)) return 'friend';
    if (incomingRequests.some(r => r.senderId === userId)) return 'incoming';
    if (outgoingRequests.some(r => r.receiverId === userId)) return 'outgoing';
    return 'none';
  };

  const otherUsers = users.filter(u => u.id !== currentUser?.uid);
  const filteredUsers = otherUsers.filter(user => 
    user.id !== currentUser?.uid && // Ensure current user is not in filtered list again
    (user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSyncContacts = async () => {
    setIsSyncing(true);
    if (!('contacts' in navigator && 'ContactsManager' in window)) {
       toast.info("Contact Picker API not supported on this device. Simulating sync...");
       await new Promise(resolve => setTimeout(resolve, 2000));
       const randomMatches = otherUsers.sort(() => 0.5 - Math.random()).slice(0, 3);
       setMatchedUsers(randomMatches);
       setContactsSynced(true);
       setIsSyncing(false);
       toast.success(`Found ${randomMatches.length} contacts on Dreamland!`);
       return;
    }
    try {
      const props = ['name', 'email', 'tel'];
      const opts = { multiple: true };
      // @ts-ignore
      const contacts = await navigator.contacts.select(props, opts);
      if (!contacts || contacts.length === 0) {
        setIsSyncing(false);
        return;
      }
      const matches = otherUsers.filter(user => {
        const emailMatch = contacts.some((c: any) => c.email?.some((e: string) => e === user.email));
        const phoneMatch = contacts.some((c: any) => c.tel?.some((t: string) => {
          const cleanContactPhone = t.replace(/\D/g, '');
          const cleanUserPhone = (user.phoneNumber || '').replace(/\D/g, '');
          return cleanContactPhone && cleanUserPhone && cleanContactPhone === cleanUserPhone;
        }));
        return emailMatch || phoneMatch;
      });
      setMatchedUsers(matches);
      setContactsSynced(true);
      if (matches.length > 0) {
        toast.success(`Found ${matches.length} friends from your contacts!`);
      } else {
        toast.info("No matching users found in your contacts.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to access contacts.");
    } finally {
      setIsSyncing(false);
    }
  };

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

  const handleAction = (action: string, payload: any) => {
    switch(action) {
      case 'message':
        handleMessage(payload);
        break;
      case 'add':
        sendFriendRequest(payload);
        break;
      case 'accept': {
        const req = incomingRequests.find(r => r.senderId === payload.id);
        if (req) acceptFriendRequest(req.id, payload.id);
        break;
      }
      case 'reject': {
        const req = incomingRequests.find(r => r.senderId === payload.id);
        if (req) rejectFriendRequest(req.id);
        break;
      }
      case 'cancel': {
        const req = outgoingRequests.find(r => r.receiverId === payload.id);
        if (req) cancelFriendRequest(req.id);
        break;
      }
    }
  };
  
  const tabs = [
    { id: 'friends', label: 'Friends', icon: UserIcon },
    { id: 'discover', label: 'Discover', icon: Search },
    { id: 'requests', label: 'Requests', icon: Check, count: incomingRequests.length } // Use Check for UserCheck to avoid confusion
  ];

  return (
    <div className="h-full flex flex-col p-4 md:p-6 overflow-hidden">
      <div className="mb-4">
        <h2 className="mb-4 flex items-center gap-2">
          <Users className="text-purple-500" />
          Friends
        </h2>
        <div className="border-b border-[var(--glass-border)]">
          <div className="flex items-center gap-2 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={`flex shrink-0 items-center gap-2 px-4 py-3 border-b-2 transition-colors ${activeTab === tab.id ? 'border-purple-500 text-purple-500' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
              >
                {tab.icon && React.createElement(tab.icon, { size: 18 })}
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{tab.count}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'friends' && <FriendList />}

            {activeTab === 'requests' && (
              <section className="space-y-4">
                {incomingRequests.length > 0 ? (
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {incomingRequests.map(req => {
                      const sender = users.find(u => u.id === req.senderId);
                      if (!sender) return null;
                      return <UserCard key={req.id} user={sender} status="incoming" onAction={handleAction} />;
                    })}
                  </div>
                ) : (
                  <div className="text-center p-8 text-muted-foreground">No pending friend requests.</div>
                )}
              </section>
            )}

            {activeTab === 'discover' && (
              <div className="space-y-8">
                <GlassInput
                  icon={<Search size={18} />}
                  placeholder="Search all users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">People you may know</h3>
                  </div>
                  {matchedUsers.length > 0 && contactsSynced ? ( 
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {matchedUsers.map(user => (
                        <UserCard 
                          key={`matched-${user.id}`} 
                          user={user} 
                          status={getRelationshipStatus(user.id)} 
                          onAction={handleAction} 
                          isSuggestion={true} 
                        />
                      ))}
                    </div>
                  ) : (
                    <GlassCard className="p-6 text-center space-y-4 mb-4 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-dashed border-2">
                      <div className="w-12 h-12 rounded-full bg-accent/50 flex items-center justify-center mx-auto mb-2">
                        <Smartphone size={24} className="text-muted-foreground" />
                      </div>
                      <div>
                        <h4 className="font-medium">Find your friends</h4>
                        <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1">
                          See which of your phone contacts are already on Dreamland.
                        </p>
                      </div>
                      <GlassButton onClick={() => {}} disabled={true} className="w-full sm:w-auto">
                        Connect Contacts (Feature Coming Soon)
                      </GlassButton>
                    </GlassCard>
                  )}
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-4">All Users</h3>
                  {loading ? (
                    <div className="text-center p-8 text-muted-foreground">Loading...</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredUsers.map(user => (
                        <UserCard key={user.id} user={user} status={getRelationshipStatus(user.id)} onAction={handleAction} />
                      ))}
                    </div>
                  )}
                </section>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
