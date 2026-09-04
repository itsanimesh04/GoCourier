import clientApi from '../apis/clientApi';

export async function uploadCustomRequestPhoto(
  uri: string,
  mimeType = 'image/jpeg',
  fileName = 'screenshot.jpg'
): Promise<string> {
  const form = new FormData();
  form.append('file', {
    uri,
    name: fileName,
    type: mimeType,
  } as unknown as Blob);
  form.append('folder', 'custom-requests');
  const res = await clientApi.post('/uploads', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data.url as string;
}
