import { useState, useContext, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { MessageSquare, FolderOpen, Settings, LogOut, Moon, Sun, Menu, X, Download, Zap, Trophy, Gift, Sparkles, Users } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "next-themes";
import { GlassCard } from "../ui/glass/GlassCard";
import { GlassButton } from "../ui/glass/GlassButton";
import { ChatView } from "../chat/ChatView";
import { StorageView } from "../storage/StorageView";
import { SettingsView } from "../settings/SettingsView";
import { FindFriendsView } from "../friends/FindFriendsView";
import { ProfileModal } from "../profile/ProfileModal";
import { InstallModal } from "../ui/InstallModal";
import { AuthContext } from "../../App";
import { usePWAInstall } from "../../../hooks/usePWAInstall";
import { toast } from "sonner";
import { USER_ROLES } from "../../../utils/constants";
import { useIsMobile } from "../ui/use-mobile";
import { StatusIndicator } from "../ui/StatusIndicator";

export function Dashboard() {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const { theme, setTheme } = useTheme();
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const { install, canInstall, isInstalled } = usePWAInstall();

  // Sync sidebar state with screen size changes
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  // Show install modal when available and not already installed
  useEffect(() => {
    if (canInstall && !isInstalled) {
      // Small delay to not overwhelm the user immediately
      const timer = setTimeout(() => setShowInstallModal(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [canInstall, isInstalled]);

  const isAdmin = authContext?.user?.role === USER_ROLES.ADMIN;

  const menuItems = [
    { icon: MessageSquare, label: "Chat", path: "/dashboard/chat" },
    { icon: Users, label: "Find Friends", path: "/dashboard/friends" },
    ...(isAdmin ? [{ icon: FolderOpen, label: "Storage", path: "/dashboard/storage" }] : []),
    { icon: Settings, label: "Settings", path: "/dashboard/settings" },
  ];

  const funFeatures = [
    { icon: Zap, label: "Quick Actions", action: () => toast.info("Quick Actions coming soon!") },
    { icon: Trophy, label: "Achievements", action: () => toast.info("Achievements coming soon!") },
    { icon: Gift, label: "Rewards", action: () => toast.info("Rewards coming soon!") },
    { icon: Sparkles, label: "AI Assistant", action: () => toast.info("AI Assistant coming soon!") },
  ];

  const handleLogout = () => {
    authContext?.logout();
    navigate("/auth");
  };

  const handleInstall = async () => {
    setShowInstallModal(false);
    const success = await install();
    if (success) {
      toast.success("App installed successfully!");
    } else if (import.meta.env.DEV) {
      toast.info("PWA install is only available in production builds. Build and deploy to test!", {
        duration: 5000
      });
    }
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="h-[100dvh] w-full overflow-hidden bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-blue-500/20 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-blue-900/20">
      <InstallModal 
        isOpen={showInstallModal} 
        onInstall={handleInstall} 
        onClose={() => setShowInstallModal(false)} 
      />
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10"
            style={{
              width: Math.random() * 200 + 100,
              height: Math.random() * 200 + 100,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, Math.random() * 100 - 50],
              x: [0, Math.random() * 100 - 50],
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: Math.random() * 15 + 10,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex h-full">
        {/* Mobile Backdrop */}
        <AnimatePresence>
          {isMobile && sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="absolute inset-0 z-40 bg-black/50 backdrop-blur-sm"
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <AnimatePresence>
          {(sidebarOpen || !isMobile) && (
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 20 }}
              className={`
                w-64 p-4 flex flex-col gap-4
                ${isMobile ? 'absolute inset-y-0 left-0 z-50 h-full' : 'relative'}
              `}
            >
              <GlassCard className="p-4 flex-1 flex flex-col overflow-hidden bg-background/80 backdrop-blur-xl md:bg-transparent md:backdrop-blur-none">
                <div className="flex items-center justify-between mb-6 shrink-0">
                  <div className="flex items-center gap-3">
                    <img 
                      src="/logo.jpg" 
                      alt="Logo" 
                      className="w-8 h-8 rounded-lg object-cover"
                    />
                    <h2 className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-bold">
                      Dreamland
                    </h2>
                  </div>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="lg:hidden hover:bg-accent/50 p-2 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* User Info */}
                <button 
                  className="flex items-center gap-3 mb-6 p-3 rounded-xl bg-accent/30 shrink-0 cursor-pointer hover:bg-accent/50 transition-colors text-left w-full"
                  onClick={() => setSelectedProfile(authContext?.user)}
                >
                  <div className="relative">
                    <img
                      src={authContext?.user?.photoURL}
                      alt={authContext?.user?.displayName}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="absolute bottom-0 right-0">
                      <StatusIndicator status={(authContext?.user as any)?.status} showText={false} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-semibold">{authContext?.user?.displayName}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {authContext?.user?.email}
                    </p>
                  </div>
                </button>

                {/* Navigation */}
                <nav className="space-y-2 flex-1 overflow-y-auto">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname.startsWith(item.path);
                    
                    return (
                      <button
                        key={item.path}
                        onClick={() => handleNavigation(item.path)}
                        className={`
                          w-full flex items-center gap-3 px-4 py-3 rounded-xl
                          transition-all duration-200
                          ${isActive
                            ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                            : "hover:bg-accent/50"
                          }
                        `}
                      >
                        <Icon size={20} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>

                {/* Bottom Actions */}
                <div className="mt-4 pt-4 border-t border-[var(--glass-border)] shrink-0">
                  {canInstall && !isInstalled && (
                    <GlassButton
                      onClick={handleInstall}
                      className="w-full mb-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                    >
                      <Download size={18} className="mr-2" />
                      Install App
                    </GlassButton>
                  )}
                  
                  {/* Fun Features */}
                  <div className="mb-3 p-3 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20">
                    <p className="text-sm mb-2 opacity-80">Quick Features</p>
                    <div className="grid grid-cols-2 gap-2">
                      {funFeatures.map((feature) => {
                        const Icon = feature.icon;
                        return (
                          <motion.button
                            key={feature.label}
                            onClick={feature.action}
                            className="p-2 rounded-lg bg-accent/30 hover:bg-accent/50 transition-all flex flex-col items-center gap-1"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Icon size={16} />
                            <span className="text-xs">{feature.label.split(' ')[0]}</span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <GlassButton
                      variant="ghost"
                      size="sm"
                      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                      className="flex-1"
                    >
                      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                    </GlassButton>
                    <GlassButton
                      variant="ghost"
                      size="sm"
                      onClick={handleLogout}
                      className="flex-1"
                    >
                      <LogOut size={18} />
                    </GlassButton>
                  </div>
                </div>
              </GlassCard>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 p-4 overflow-hidden h-full">
          <GlassCard className="h-full flex flex-col">
            {/* Mobile Header */}
            {isMobile && !sidebarOpen && (
              <div className="flex items-center gap-3 p-4 border-b border-[var(--glass-border)] shrink-0">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="hover:bg-accent/50 p-2 rounded-lg transition-colors"
                >
                  <Menu size={20} />
                </button>
                <img 
                  src="/logo.jpg" 
                  alt="Logo" 
                  className="w-8 h-8 rounded-lg object-cover"
                />
                <h1 className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-bold">
                  Dreamland
                </h1>
              </div>
            )}

            {/* Routes */}
            <div className="flex-1 overflow-hidden relative">
              <div className="absolute inset-0">
                <Routes>
                  <Route path="chat" element={<ChatView onProfileClick={setSelectedProfile} />} />
                  <Route path="friends" element={<FindFriendsView />} />
                  <Route 
                    path="storage" 
                    element={
                      isAdmin ? <StorageView /> : <Navigate to="/dashboard/chat" replace />
                    } 
                  />
                  <Route path="settings" element={<SettingsView />} />
                  <Route path="/" element={<Navigate to="chat" />} />
                </Routes>
              </div>
            </div>
          </GlassCard>
        </main>
      </div>
      
      {selectedProfile && (
        <ProfileModal
          user={selectedProfile}
          isOpen={!!selectedProfile}
          onClose={() => setSelectedProfile(null)}
          isOwnProfile={selectedProfile?.id === authContext?.user?.uid}
          onUpdate={async (data: any) => {
            if (authContext?.updateProfileData) {
              await authContext.updateProfileData(data);
            }
          }}
        />
      )}
    </div>
  );
}
