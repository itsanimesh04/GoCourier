import adminApi from "../../apis/adminApi";
import type { UploadResult } from "../../types/admin.types";

class UploadService {
  upload(file: File, folder: string) {
    const form = new FormData();
    form.append("file", file);
    form.append("folder", folder);
    return adminApi.post<{ success: boolean; data: UploadResult }>("/uploads", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }

  replace(file: File, folder: string, oldKey?: string | null) {
    const form = new FormData();
    form.append("file", file);
    form.append("folder", folder);
    if (oldKey) form.append("old_key", oldKey);
    return adminApi.put<{ success: boolean; data: UploadResult }>("/uploads", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }

  remove(key: string) {
    return adminApi.delete("/uploads", { data: { key } });
  }
}

export default new UploadService();
