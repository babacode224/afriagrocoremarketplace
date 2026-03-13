import { useState, useRef } from "react";
import { Camera, Upload, X, Loader2, User } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  shape?: "circle" | "square";
  size?: "sm" | "md" | "lg";
  placeholder?: string;
  optional?: boolean;
}

export function ImageUpload({
  value,
  onChange,
  label,
  shape = "circle",
  size = "md",
  placeholder,
  optional = true,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = trpc.upload.image.useMutation({
    onSuccess: (data) => {
      onChange(data.url);
      toast.success("Photo uploaded successfully!");
      setUploading(false);
    },
    onError: (err) => {
      toast.error("Upload failed: " + err.message);
      setUploading(false);
    },
  });

  const sizeMap = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file (JPG, PNG, GIF, WebP)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB");
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      uploadMutation.mutate({
        base64,
        filename: file.name,
        mimeType: file.type,
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {label && (
        <p className="text-sm font-medium text-gray-700">
          {label}
          {optional && <span className="text-gray-400 font-normal ml-1">(optional)</span>}
        </p>
      )}

      {/* Avatar preview */}
      <div
        className={`${sizeMap[size]} ${shape === "circle" ? "rounded-full" : "rounded-xl"} border-2 border-dashed border-gray-300 overflow-hidden bg-gray-50 flex items-center justify-center relative group cursor-pointer hover:border-[#E85D04] transition-colors`}
        onClick={() => fileInputRef.current?.click()}
      >
        {value ? (
          <>
            <img src={value} alt="Profile" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
              <Camera className="w-5 h-5 text-white" />
            </div>
          </>
        ) : uploading ? (
          <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
        ) : (
          <div className="flex flex-col items-center gap-1 text-gray-400">
            <User className="w-8 h-8" />
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="text-sm px-3 py-1.5 bg-[#E85D04] text-white rounded-lg hover:bg-[#d14e00] disabled:opacity-50 flex items-center gap-1.5 transition-colors"
        >
          {uploading ? (
            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...</>
          ) : (
            <><Upload className="w-3.5 h-3.5" /> {value ? "Change Photo" : "Upload Photo"}</>
          )}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-sm px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 flex items-center gap-1.5 transition-colors"
          >
            <X className="w-3.5 h-3.5" /> Remove
          </button>
        )}
      </div>

      {optional && !value && (
        <p className="text-xs text-gray-400">You can add a photo now or later in your profile settings</p>
      )}
      {!optional && (
        <p className="text-xs text-gray-400">JPG, PNG, WebP · Max 5MB</p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
