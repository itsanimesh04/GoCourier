import clientApi from '../apis/clientApi';

export async function uploadCustomRequestPhoto(file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  form.append('folder', 'custom-requests');
  const res = await clientApi.post('/uploads', form);
  return res.data.data.url as string;
}
