import { useState, useContext, useRef } from "react";
import { User, Bell, Shield, Palette, Globe, Camera, Trash2, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { GlassCard } from "../ui/glass/GlassCard";
import { GlassInput } from "../ui/glass/GlassInput";
import { GlassButton } from "../ui/glass/GlassButton";
import { AuthContext } from "../../App";
import { Switch } from "../ui/switch";
import { toast } from "sonner";
import { uploadToCloudinary } from "../../../lib/cloudinary/config";
import { ImageCropper } from "../ui/ImageCropper";

export function SettingsView() {
  const authContext = useContext(AuthContext);
  const [notifications, setNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);

  const [displayName, setDisplayName] = useState(authContext?.user?.displayName || "");
  const [bio, setBio] = useState(authContext?.user?.bio || "");
  const [photoURL, setPhotoURL] = useState(authContext?.user?.photoURL || "");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    setLoading(true);
    try {
      if (authContext?.updateProfileData) {
        await authContext.updateProfileData({ displayName, bio, photoURL });
        toast.success("Settings saved successfully!");
      }
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemovePhoto = () => {
    const defaultPhoto = `https://api.dicebear.com/7.x/avataaars/svg?seed=${authContext?.user?.id || authContext?.user?.email}`;
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

  const settingsSections = [
    {
      title: "Notifications",
      icon: Bell,
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p>Push Notifications</p>
              <p className="text-sm text-muted-foreground">
                Receive notifications for new messages
              </p>
            </div>
            <Switch
              checked={notifications}
              onCheckedChange={setNotifications}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p>Sound</p>
              <p className="text-sm text-muted-foreground">
                Play sound for notifications
              </p>
            </div>
            <Switch
              checked={soundEnabled}
              onCheckedChange={setSoundEnabled}
            />
          </div>
        </div>
      )
    },
    {
      title: "Security",
      icon: Shield,
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p>Two-Factor Authentication</p>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security
              </p>
            </div>
            <Switch
              checked={twoFactorAuth}
              onCheckedChange={setTwoFactorAuth}
            />
          </div>
          <div>
            <label className="block mb-2">Change Password</label>
            <GlassInput
              type="password"
              placeholder="New password"
            />
          </div>
        </div>
      )
    },
    {
      title: "Appearance",
      icon: Palette,
      content: (
        <div className="space-y-4">
          <div>
            <p className="mb-3">Theme</p>
            <div className="grid grid-cols-3 gap-3">
              {["light", "dark", "system"].map(theme => (
                <button
                  key={theme}
                  className="p-3 rounded-xl bg-accent/30 hover:bg-accent/50 transition-colors capitalize"
                >
                  {theme}
                </button>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Language & Region",
      icon: Globe,
      content: (
        <div className="space-y-4">
          <div>
            <label className="block mb-2">Language</label>
            <select className="w-full px-4 py-2.5 rounded-xl bg-[var(--glass-background)] border border-[var(--glass-border)] backdrop-blur-[12px] focus:outline-none focus:ring-2 focus:ring-purple-500/50">
              <option>English</option>
              <option>Spanish</option>
              <option>French</option>
              <option>German</option>
            </select>
          </div>
          <div>
            <label className="block mb-2">Timezone</label>
            <select className="w-full px-4 py-2.5 rounded-xl bg-[var(--glass-background)] border border-[var(--glass-border)] backdrop-blur-[12px] focus:outline-none focus:ring-2 focus:ring-purple-500/50">
              <option>UTC-8 (Pacific Time)</option>
              <option>UTC-5 (Eastern Time)</option>
              <option>UTC+0 (GMT)</option>
              <option>UTC+1 (Central European)</option>
            </select>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6">
      <h2 className="mb-6">Settings</h2>

      <div className="space-y-4 max-w-3xl">
        {settingsSections.map((section) => {
          const Icon = section.icon;
          
          return (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <GlassCard className="p-4 md:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    <Icon size={20} />
                  </div>
                  <h3>{section.title}</h3>
                </div>
                {section.content}
              </GlassCard>
            </motion.div>
          );
        })}

        <div className="flex justify-end gap-3 pt-4">
          <GlassButton variant="secondary" disabled={loading}>
            Cancel
          </GlassButton>
          <GlassButton onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </GlassButton>
        </div>
      </div>
      
      {tempImageSrc && (
        <ImageCropper
          imageSrc={tempImageSrc}
          onCropComplete={handleCropComplete}
          onCancel={() => setTempImageSrc(null)}
        />
      )}
    </div>
  );
}
