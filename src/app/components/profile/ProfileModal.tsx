import { useState, useRef, useContext, useMemo } from "react";
import { X, Camera, Mail, User as UserIcon, Shield, Loader2, Trash2, UserPlus, UserCheck, MessageSquare, Clock, UserMinus } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { GlassCard } from "../ui/glass/GlassCard";
import { GlassButton } from "../ui/glass/GlassButton";
import { GlassInput } from "../ui/glass/GlassInput";
import { toast } from "sonner";
import { uploadToCloudinary } from "../../../lib/cloudinary/config";
import { ImageCropper } from "../ui/ImageCropper";
import { useFriendRequests } from "../../../hooks/useFriendRequests";
import { AuthContext } from "../../App";
import { doc, updateDoc, arrayRemove, arrayUnion } from "firebase/firestore";
import { db } from "../../../lib/firebase/config";
import { StatusIndicator } from "../ui/StatusIndicator";

interface ProfileModalProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
  isOwnProfile?: boolean;
  onUpdate?: (data: any) => void;
}

export function ProfileModal({ user, isOpen, onClose, isOwnProfile = false, onUpdate }: ProfileModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user.displayName);
  const [bio, setBio] = useState(user.bio || "");
  const [photoURL, setPhotoURL] = useState(user.photoURL);
  const [isUploading, setIsUploading] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);

  const authContext = useContext(AuthContext);
  const currentUser = authContext?.user;

  const {
    incomingRequests,
    outgoingRequests,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    cancelFriendRequest,
  } = useFriendRequests();
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const relationship = useMemo(() => {
    if (!currentUser || isOwnProfile) return null;

    if ((currentUser as any)?.friends?.includes(user.id)) return "friend";
    if (incomingRequests.some(req => req.senderId === user.id)) return "incoming";
    if (outgoingRequests.some(req => req.receiverId === user.id)) return "outgoing";

    return "none";
  }, [currentUser, user, isOwnProfile, incomingRequests, outgoingRequests]);

  const handleSave = async () => {
    try {
      await onUpdate?.({ displayName, bio, photoURL });
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const handleUnfriend = async () => {
    if (!currentUser || !confirm(`Are you sure you want to unfriend ${user.displayName}?`)) return;

    try {
      // Remove from current user's friend list
      const currentUserRef = doc(db, 'users', currentUser.uid);
      await updateDoc(currentUserRef, {
        friends: arrayRemove(user.id)
      });

      // Remove from friend's friend list
      const friendRef = doc(db, 'users', user.id);
      await updateDoc(friendRef, {
        friends: arrayRemove(currentUser.uid)
      });
      
      toast.success(`Unfriended ${user.displayName}`);
      onClose();
    } catch (error) {
      console.error("Error unfriending:", error);
      toast.error("Failed to unfriend user");
    }
  };

  const handlePhotoClick = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  const handleRemovePhoto = () => {
    const defaultPhoto = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id || user.email}`;
    setPhotoURL(defaultPhoto);
    toast.success("Photo removed (reset to default)");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setTempImageSrc(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    // Reset input
    e.target.value = '';
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setTempImageSrc(null);
    setIsUploading(true);
    try {
      const uploadedUrl = await uploadToCloudinary(croppedBlob);
      setPhotoURL(uploadedUrl);
      toast.success("Photo updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload photo");
    } finally {
      setIsUploading(false);
    }
  };

  const renderRelationshipActions = () => {
    if (!relationship) return null;

    switch (relationship) {
      case 'friend':
        return (
          <GlassButton onClick={handleUnfriend} className="w-full bg-red-500/10 text-red-500 hover:bg-red-500/20">
            <UserMinus size={16} className="mr-2"/>
            Unfriend
          </GlassButton>
        );
      case 'incoming': {
        const req = incomingRequests.find(r => r.senderId === user.id);
        return (
          <div className="flex gap-3 w-full">
            <GlassButton onClick={() => req && acceptFriendRequest(req.id, req.senderId)} className="flex-1 bg-green-500/20 text-green-500">
              <UserCheck size={16} className="mr-2"/>
              Accept
            </GlassButton>
            <GlassButton onClick={() => req && rejectFriendRequest(req.id)} variant="secondary" className="flex-1">
              Reject
            </GlassButton>
          </div>
        );
      }
      case 'outgoing': {
        const req = outgoingRequests.find(r => r.receiverId === user.id);
        return (
          <GlassButton onClick={() => req && cancelFriendRequest(req.id)} className="w-full">
            <Clock size={16} className="mr-2" />
            Request Sent
          </GlassButton>
        );
      }
      case 'none':
        return (
          <GlassButton onClick={() => sendFriendRequest(user.id)} className="w-full">
            <UserPlus size={16} className="mr-2" />
            Add Friend
          </GlassButton>
        );
      default:
        return null;
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="pointer-events-auto w-full max-w-md"
            >
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2>Profile</h2>
                  <button
                    onClick={onClose}
                    className="hover:bg-accent/50 p-2 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex flex-col items-center mb-6">
                  <div className="relative mb-4">
                    <div className="relative w-24 h-24">
                      <img
                        src={photoURL}
                        alt={displayName}
                        className={`w-24 h-24 rounded-full object-cover ${isUploading ? 'opacity-50' : ''}`}
                      />
                      {isUploading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Loader2 className="animate-spin text-white" />
                        </div>
                      )}
                    </div>
                    {isEditing && (
                      <>
                        <button
                          onClick={handleRemovePhoto}
                          disabled={isUploading}
                          className="absolute bottom-0 left-0 bg-red-500/80 hover:bg-red-500 text-white p-2 rounded-full hover:scale-110 transition-transform disabled:opacity-50 backdrop-blur-sm"
                          title="Remove photo"
                        >
                          <Trash2 size={16} />
                        </button>
                        <button
                          onClick={handlePhotoClick}
                          disabled={isUploading}
                          className="absolute bottom-0 right-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-2 rounded-full hover:scale-110 transition-transform disabled:opacity-50 shadow-lg"
                        >
                          <Camera size={16} />
                        </button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          accept="image/*"
                          className="hidden"
                        />
                      </>
                    )}
                  </div>
                  
                  <StatusIndicator status={user.status} lastSeen={user.lastSeen} showText={true} />
                </div>

                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm mb-2">Display Name</label>
                      <GlassInput
                        icon={<UserIcon size={18} />}
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-2">Bio</label>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-[var(--glass-background)] border border-[var(--glass-border)] backdrop-blur-[12px] min-h-24 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                    <div className="flex gap-3">
                      <GlassButton variant="secondary" onClick={() => setIsEditing(false)} className="flex-1">
                        Cancel
                      </GlassButton>
                      <GlassButton onClick={handleSave} className="flex-1" disabled={isUploading}>
                        Save
                      </GlassButton>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h3 className="mb-2">{displayName}</h3>
                      {bio && <p className="text-muted-foreground">{bio}</p>}
                    </div>
                    
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Mail size={16} />
                      {user.email}
                    </div>
                    
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <Shield size={16} />
                      {user.role === 'admin' ? 'Admin' : 'Member'}
                    </div>

                    {isOwnProfile ? (
                      <GlassButton onClick={() => setIsEditing(true)} className="w-full">
                        Edit Profile
                      </GlassButton>
                    ) : (
                      renderRelationshipActions()
                    )}
                  </div>
                )}
              </GlassCard>
            </motion.div>
          </div>
          
          {tempImageSrc && (
            <ImageCropper
              imageSrc={tempImageSrc}
              onCropComplete={handleCropComplete}
              onCancel={() => setTempImageSrc(null)}
            />
          )}
        </>
      )}
    </AnimatePresence>
  );
}
