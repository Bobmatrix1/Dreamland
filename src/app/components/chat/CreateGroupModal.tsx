import { useState } from "react";
import { X, Users, Search } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { GlassCard } from "../ui/glass/GlassCard";
import { GlassButton } from "../ui/glass/GlassButton";
import { GlassInput } from "../ui/glass/GlassInput";
import { toast } from "sonner";

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGroup: (name: string, participants: string[]) => void;
  users: any[];
}

export function CreateGroupModal({ isOpen, onClose, onCreateGroup, users = [] }: CreateGroupModalProps) {
  const [groupName, setGroupName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const filteredUsers = users.filter(user => 
    user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreate = () => {
    if (!groupName.trim()) {
      toast.error("Please enter a group name");
      return;
    }
    if (selectedUsers.length < 2) {
      toast.error("Please select at least 2 members");
      return;
    }

    onCreateGroup(groupName, selectedUsers);
    setGroupName("");
    setSelectedUsers([]);
    onClose();
    toast.success("Group created successfully!");
  };

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
              <GlassCard className="p-6 max-h-[80vh] overflow-hidden flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h2>Create Group</h2>
                  <button
                    onClick={onClose}
                    className="hover:bg-accent/50 p-2 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4 flex-1 overflow-auto">
                  <div>
                    <label className="block text-sm mb-2">Group Name</label>
                    <GlassInput
                      icon={<Users size={18} />}
                      placeholder="Enter group name..."
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2">Add Members ({selectedUsers.length})</label>
                    <GlassInput
                      icon={<Search size={18} />}
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {filteredUsers.length === 0 ? (
                      <p className="text-center text-muted-foreground py-4">No users found</p>
                    ) : (
                      filteredUsers.map(user => (
                        <button
                          key={user.id}
                          onClick={() => toggleUser(user.id)}
                          className={`w-full p-3 rounded-xl transition-all ${
                            selectedUsers.includes(user.id)
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                              : 'bg-accent/30 hover:bg-accent/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={user.photoURL}
                              alt={user.displayName}
                              className="w-10 h-10 rounded-full"
                            />
                            <div className="flex-1 text-left">
                              <p>{user.displayName}</p>
                              <p className={`text-sm ${
                                selectedUsers.includes(user.id) ? 'text-white/80' : 'text-muted-foreground'
                              }`}>
                                {user.email}
                              </p>
                            </div>
                            {selectedUsers.includes(user.id) && (
                              <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
                                <div className="w-3 h-3 rounded-full bg-purple-500" />
                              </div>
                            )}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <GlassButton variant="secondary" onClick={onClose} className="flex-1">
                    Cancel
                  </GlassButton>
                  <GlassButton onClick={handleCreate} className="flex-1">
                    Create Group
                  </GlassButton>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
