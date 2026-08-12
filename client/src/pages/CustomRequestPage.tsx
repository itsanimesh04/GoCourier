import { useEffect, useRef, useState } from 'react';
import { FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store';
import { addExtra } from '../store/slices/cartSlice';
import { setCatalogMode } from '../store/slices/uiSlice';
import { uploadCustomRequestPhoto } from '../services/upload.service';
import ExtrasRequestShell from './components/Extras/ExtrasRequestShell';

const SERVICE_IMAGE =
  'https://images.unsplash.com/photo-1583485088034-697b5bc36b00?w=400&q=80';

const CustomRequestPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [need, setNeed] = useState('');
  const [quantity, setQuantity] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(setCatalogMode('extras'));
  }, [dispatch]);

  useEffect(() => {
    if (!photoFile) {
      setPhotoPreview(null);
      return;
    }
    const url = URL.createObjectURL(photoFile);
    setPhotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photoFile]);

  const valid = need.trim() && quantity.trim() && photoFile;

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file.');
      return;
    }
    setError(null);
    setPhotoFile(file);
  };

  const clearPhoto = () => {
    setPhotoFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || !photoFile) return;
    setSubmitting(true);
    setError(null);
    try {
      const imageUrl = await uploadCustomRequestPhoto(photoFile);
      const note = [`Need: ${need.trim()}`, `Qty: ${quantity.trim()}`].join(' · ');

      dispatch(
        addExtra({
          extrasProductId: 'custom-request',
          name: 'Custom request',
          imageUrl: imageUrl || SERVICE_IMAGE,
          unitPrice: 49,
          note,
        })
      );
      navigate('/cart');
    } catch {
      setError('Could not upload screenshot. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClass =
    'mt-1 w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 font-sans text-sm text-fg outline-none focus:border-primary';

  return (
    <ExtrasRequestShell
      title="Custom request"
      subtitle="Tell us what you need — we'll quote and deliver with tonight's batch."
    >
      <form onSubmit={submit} className="space-y-4">
        <label className="block">
          <span className="font-sans text-xs uppercase text-muted">What do you need?</span>
          <input
            type="text"
            value={need}
            onChange={(e) => setNeed(e.target.value)}
            placeholder="e.g. A4 sheets, phone charger"
            className={fieldClass}
            required
          />
        </label>
        <label className="block">
          <span className="font-sans text-xs uppercase text-muted">Quantity / approx</span>
          <input
            type="text"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="e.g. 2 packs"
            className={fieldClass}
            required
          />
        </label>
        <div className="block">
          <span className="font-sans text-xs uppercase text-muted">
            Share Screenshot of product
          </span>
          {photoPreview ? (
            <div className="relative mt-2 overflow-hidden rounded-xl border border-border bg-surface-2">
              <img
                src={photoPreview}
                alt="Product screenshot preview"
                className="max-h-48 w-full object-contain"
              />
              <button
                type="button"
                onClick={clearPhoto}
                className="absolute right-2 top-2 rounded-lg bg-surface/90 p-1.5 text-fg hover:bg-surface"
                aria-label="Remove screenshot"
              >
                <FiX size={16} />
              </button>
            </div>
          ) : (
            <label className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface-2 px-4 py-8 transition-colors hover:border-primary">
              <span className="font-sans text-sm text-muted">Tap to upload screenshot</span>
              <span className="mt-1 font-sans text-xs text-muted">PNG, JPG up to 5 MB</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="sr-only"
                required
              />
            </label>
          )}
        </div>
        {error && <p className="font-sans text-xs text-primary">{error}</p>}
        <p className="font-sans text-xs text-muted">
          Base service fee ₹49 — final quote confirmed before procurement.
        </p>
        <button
          type="submit"
          disabled={!valid || submitting}
          className="w-full rounded-xl bg-primary py-2.5 font-sans text-sm font-semibold text-on-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitting ? 'Uploading…' : 'Add to cart'}
        </button>
      </form>
    </ExtrasRequestShell>
  );
};

export default CustomRequestPage;
