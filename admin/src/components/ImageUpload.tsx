import { useState } from "react";
import { FiUpload, FiTrash2 } from "react-icons/fi";
import uploadService from "../services/admin/upload.service";

interface ImageUploadProps {
  folder: string;
  imageUrl?: string | null;
  imageKey?: string | null;
  onChange: (next: { url: string | null; key: string | null }) => void;
}

const ImageUpload = ({ folder, imageUrl, imageKey, onChange }: ImageUploadProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file?: File | null) => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const res = imageKey
        ? await uploadService.replace(file, folder, imageKey)
        : await uploadService.upload(file, folder);
      onChange({ url: res.data.data.url, key: res.data.data.key });
    } catch {
      setError("Upload failed. Check S3 configuration.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!imageKey) {
      onChange({ url: null, key: null });
      return;
    }
    setLoading(true);
    try {
      await uploadService.remove(imageKey);
      onChange({ url: null, key: null });
    } catch {
      setError("Delete failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      {imageUrl ? (
        <div className="relative w-full h-36 rounded-xl overflow-hidden border border-[var(--border)]">
          <img src={imageUrl} alt="" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="absolute top-2 right-2 admin-btn admin-btn-ghost !p-2 bg-black/50"
          >
            <FiTrash2 size={14} />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center gap-2 h-36 rounded-xl border border-dashed border-[var(--border)] cursor-pointer hover:border-[var(--primary)] hover:bg-[var(--primary-soft)] transition-colors">
          <FiUpload size={18} className="text-[var(--text-muted)]" />
          <span className="text-xs text-[var(--text-muted)]">
            {loading ? "Uploading…" : "Upload image"}
          </span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
            disabled={loading}
          />
        </label>
      )}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
};

export default ImageUpload;
