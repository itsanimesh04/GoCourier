const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api/v1';

export interface UploadResult {
  key: string;
  url: string;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/** Uploads a custom-request screenshot; falls back to data URL when API is unavailable. */
export async function uploadCustomRequestPhoto(file: File): Promise<string> {
  const token = localStorage.getItem('gcs-token');
  const form = new FormData();
  form.append('file', file);
  form.append('folder', 'custom-requests');

  if (token) {
    try {
      const res = await fetch(`${API_BASE}/uploads`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      if (res.ok) {
        const json = (await res.json()) as { data: UploadResult };
        return json.data.url;
      }
    } catch {
      /* fall through to local preview */
    }
  }

  return readFileAsDataUrl(file);
}
