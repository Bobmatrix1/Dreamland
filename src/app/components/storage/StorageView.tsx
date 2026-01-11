import { useState, useRef, useContext } from "react";
import { Search, Upload, FolderPlus, Grid, List, File, FileText, FileImage, FileVideo, Download, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { GlassCard } from "../ui/glass/GlassCard";
import { GlassInput } from "../ui/glass/GlassInput";
import { GlassButton } from "../ui/glass/GlassButton";
import { format } from "date-fns";
import { useFiles } from "../../../hooks/useFiles";
import { useUsers } from "../../../hooks/useUsers";
import { AuthContext } from "../../App";
import { toast } from "sonner";
import { uploadToCloudinary } from "../../../lib/cloudinary/config";
import { useIsMobile } from "../ui/use-mobile";

export function StorageView() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const { files, loading: filesLoading, uploadFileRecord } = useFiles();
  const { users } = useUsers();
  const { user: currentUser } = useContext(AuthContext) || {};
  const isMobile = useIsMobile();
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (type: string) => {
    switch (type) {
      case "image":
        return <FileImage className="text-blue-500" />;
      case "video":
        return <FileVideo className="text-purple-500" />;
      case "document":
        return <FileText className="text-green-500" />;
      default:
        return <File className="text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "0 B";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const filteredFiles = files.filter(file =>
    (file.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (file.tags || []).some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getUser = (userId: string) => users.find(u => u.id === userId);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    setIsUploading(true);
    const toastId = toast.loading(`Uploading ${file.name}...`);
    
    try {
      const url = await uploadToCloudinary(file);
      
      let fileType = "other";
      if (file.type.startsWith("image/")) fileType = "image";
      else if (file.type.startsWith("video/")) fileType = "video";
      else if (file.type.includes("pdf") || file.type.includes("text") || file.type.includes("document")) fileType = "document";

      await uploadFileRecord({
        name: file.name,
        type: fileType,
        size: file.size,
        url: url,
        uploadedBy: currentUser.uid,
        folder: "General",
        tags: [fileType]
      });

      toast.success("File uploaded successfully!", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload file", { id: toastId });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="h-full flex flex-col p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="mb-4">Storage</h2>
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4">
          <GlassInput
            icon={<Search size={18} />}
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <div className="flex gap-2">
            <GlassButton variant="secondary" onClick={() => toast.info("Folders coming soon!")} className="flex-1 md:flex-none justify-center">
              <FolderPlus size={20} className="mr-2" />
              New Folder
            </GlassButton>
            <GlassButton onClick={handleUploadClick} disabled={isUploading} className="flex-1 md:flex-none justify-center">
              {isUploading ? <Loader2 className="animate-spin mr-2" size={20} /> : <Upload size={20} className="mr-2" />}
              {isUploading ? "Uploading..." : "Upload"}
            </GlassButton>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === "grid" ? "bg-accent" : "hover:bg-accent/50"
            }`}
          >
            <Grid size={20} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === "list" ? "bg-accent" : "hover:bg-accent/50"
            }`}
          >
            <List size={20} />
          </button>
        </div>
        <p className="text-sm text-muted-foreground">
          {filteredFiles.length} files
        </p>
      </div>

      {/* Files */}
      <div className="flex-1 overflow-y-auto">
        {filesLoading ? (
            <div className="text-center p-10 text-muted-foreground">Loading files...</div>
        ) : filteredFiles.length === 0 ? (
            <div className="text-center p-10 text-muted-foreground">No files found.</div>
        ) : (
            viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredFiles.map((file) => {
                const uploader = getUser(file.uploadedBy);
                
                return (
                    <motion.div
                    key={file.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    >
                    <GlassCard className="p-4 hover:shadow-xl transition-all cursor-pointer">
                        {file.type === "image" && file.url && file.url !== "#" ? (
                        <img
                            src={file.url}
                            alt={file.name}
                            className="w-full h-32 object-cover rounded-lg mb-3"
                        />
                        ) : (
                        <div className="w-full h-32 flex items-center justify-center rounded-lg bg-accent/30 mb-3">
                            {getFileIcon(file.type)}
                        </div>
                        )}
                        <h4 className="truncate mb-2">{file.name}</h4>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{formatFileSize(file.size)}</span>
                        <button className="hover:bg-accent/50 p-1 rounded transition-colors">
                            <Download size={16} />
                        </button>
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                        <img
                            src={uploader?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${file.uploadedBy}`}
                            alt={uploader?.displayName || "User"}
                            className="w-6 h-6 rounded-full"
                        />
                        <span className="text-xs text-muted-foreground">
                            {file.uploadedAt ? format(new Date(file.uploadedAt), "MMM dd") : "-"}
                        </span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                        {(file.tags || []).map((tag: string) => (
                            <span
                            key={tag}
                            className="text-xs px-2 py-0.5 rounded-full bg-accent/50"
                            >
                            {tag}
                            </span>
                            ))}
                        </div>
                    </GlassCard>
                    </motion.div>
                );
                })}
            </div>
            ) : (
            <div className="space-y-2">
                {filteredFiles.map((file) => {
                const uploader = getUser(file.uploadedBy);
                
                return (
                    <motion.div
                    key={file.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ x: 4 }}
                    >
                    <GlassCard className="p-4 hover:shadow-lg transition-all cursor-pointer">
                        <div className="flex items-center gap-4">
                        <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-accent/30 shrink-0">
                            {getFileIcon(file.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="truncate">{file.name}</h4>
                            <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm text-muted-foreground mt-1 flex-wrap">
                                <span>{formatFileSize(file.size)}</span>
                                <span className="hidden md:inline">•</span>
                                <span className="hidden md:inline">{file.uploadedAt ? format(new Date(file.uploadedAt), "MMM dd, yyyy") : "-"}</span>
                                <span>•</span>
                                <span className="truncate max-w-[100px]">{uploader?.displayName || "Unknown"}</span>
                            </div>
                        </div>
                        <div className="hidden md:flex gap-2">
                            {(file.tags || []).map((tag: string) => (
                            <span
                                key={tag}
                                className="text-xs px-2 py-1 rounded-full bg-accent/50"
                            >
                                {tag}
                            </span>
                            ))}
                        </div>
                        <button className="hover:bg-accent/50 p-2 rounded-lg transition-colors">
                            <Download size={20} />
                        </button>
                        </div>
                    </GlassCard>
                    </motion.div>
                );
                })}
            </div>
            )
        )}
      </div>
    </div>
  );
}