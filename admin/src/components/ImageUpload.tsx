import { useState } from "react";
import { Trash2, Upload } from "lucide-react";
import uploadService from "@/services/admin/upload.service";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  folder: string;
  imageUrl?: string | null;
  imageKey?: string | null;
  onChange: (next: { url: string | null; key: string | null }) => void;
  /** Client cards use 4/3; product detail / addon thumbs use square */
  aspect?: "4/3" | "square";
  className?: string;
}

const aspectClass: Record<"4/3" | "square", string> = {
  "4/3": "aspect-[4/3]",
  square: "aspect-square",
};

const ImageUpload = ({
  folder,
  imageUrl,
  imageKey,
  onChange,
  aspect = "4/3",
  className,
}: ImageUploadProps) => {
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
    <div className={cn("space-y-2", className)}>
      {imageUrl ? (
        <div
          className={cn(
            "relative w-full overflow-hidden rounded-xl border border-border",
            aspectClass[aspect]
          )}
        >
          <img src={imageUrl} alt="" className="h-full w-full object-cover" />
          <Button
            type="button"
            variant="secondary"
            size="icon"
            onClick={() => void handleDelete()}
            disabled={loading}
            className="absolute top-2 right-2 size-8 bg-black/60"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      ) : (
        <label
          className={cn(
            "flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border transition-colors hover:bg-accent/40",
            aspectClass[aspect]
          )}
        >
          <Upload className="size-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {loading ? "Uploading…" : "Upload image"}
          </span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => void handleFile(e.target.files?.[0])}
            disabled={loading}
          />
        </label>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
};

export default ImageUpload;
