interface ProductGalleryProps {
  imageUrl: string;
  name: string;
}

const ProductGallery = ({ imageUrl, name }: ProductGalleryProps) => {
  return (
    <div className="relative aspect-square w-full shrink-0 overflow-hidden rounded-2xl bg-surface-2">
      <img
        src={imageUrl}
        alt={name}
        className="absolute inset-0 h-full w-full object-cover"
      />
    </div>
  );
};

export default ProductGallery;
