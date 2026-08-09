export const EXTRA_IMAGES = [
  'https://images.unsplash.com/photo-1583485088034-697b5bc36b00?w=400&q=80',
  'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&q=80',
  'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=400&q=80',
  'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&q=80',
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80',
  'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&q=80',
  'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80',
  'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&q=80',
];

export function extrasImageUrl(imageIndex: number) {
  return EXTRA_IMAGES[imageIndex % EXTRA_IMAGES.length];
}
