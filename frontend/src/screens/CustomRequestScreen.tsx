import { Camera, Minus, Plus, X } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell, BottomNav, PrimaryButton, ScreenHeader } from '../components/ui';
import { Field, inputClass, textareaClass } from '../components/extras/RequestFormFields';
import { useExtrasCatalog } from '../state/ExtrasCatalogContext';
import { useExtrasRequests } from '../state/ExtrasRequestContext';

export function CustomRequestScreen() {
  const navigate = useNavigate();
  const { cartCount } = useExtrasCatalog();
  const { submitCustom } = useExtrasRequests();
  const [title, setTitle] = useState(''); const [note, setNote] = useState(''); const [quantity, setQuantity] = useState(1);
  const [brand, setBrand] = useState(''); const [budget, setBudget] = useState(''); const [dropPoint, setDropPoint] = useState('');
  const [alternatives, setAlternatives] = useState(true); const [photos, setPhotos] = useState<string[]>([]); const [error, setError] = useState('');
  function submit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim() || !note.trim() || !dropPoint.trim()) { setError('Add a title, detailed note, and delivery drop point.'); return; }
    const id = submitCustom({ title: title.trim(), note: `${note.trim()}${brand ? ` Preferred brand: ${brand}.` : ''}${alternatives ? ' Alternatives accepted.' : ''}`, quantity, dropPoint: dropPoint.trim(), maximumBudget: budget ? Number(budget) : undefined });
    navigate(`/extras/requests/${id}`);
  }
  return <AppShell bottomNav={<BottomNav cartCount={cartCount} />}><ScreenHeader title="Custom request" />
    <form onSubmit={submit} className="mx-auto max-w-2xl space-y-5">
      <div><h1 className="font-display text-2xl font-bold">What do you need?</h1><p className="mt-1 text-sm text-muted">Give our operations team enough detail to source it accurately.</p></div>
      <Field label="Request title"><input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Scientific calculator" /></Field>
      <Field label="Detailed note" hint={`${note.length}/500`}><textarea className={textareaClass} maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Size, color, model, specifications, or anything else that matters" /></Field>
      <div className="grid grid-cols-2 gap-3"><Field label="Quantity"><div className="grid min-h-[52px] grid-cols-3 items-center rounded-input border border-border bg-card"><button type="button" aria-label="Decrease quantity" onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="grid min-h-tap place-items-center"><Minus size={18}/></button><span className="text-center font-bold">{quantity}</span><button type="button" aria-label="Increase quantity" onClick={() => setQuantity((value) => value + 1)} className="grid min-h-tap place-items-center"><Plus size={18}/></button></div></Field><Field label="Preferred brand"><input className={inputClass} value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Optional" /></Field></div>
      <label className="flex min-h-[56px] items-center justify-between rounded-input border border-border bg-card px-4"><span><strong className="block text-sm">Accept alternatives</strong><span className="text-xs text-muted">Similar brands or options</span></span><input type="checkbox" checked={alternatives} onChange={(e) => setAlternatives(e.target.checked)} className="h-5 w-5 accent-[var(--brand)]" /></label>
      <div className="grid grid-cols-2 gap-3"><Field label="Maximum budget"><input className={inputClass} inputMode="numeric" value={budget} onChange={(e) => setBudget(e.target.value.replace(/\D/g, ''))} placeholder="₹ Optional" /></Field><Field label="Delivery drop point"><input className={inputClass} value={dropPoint} onChange={(e) => setDropPoint(e.target.value)} placeholder="e.g. Main reception" /></Field></div>
      <Field label="Add photos" hint="Up to 3 references; previews are local only in this frontend phase."><div className="flex gap-3 overflow-x-auto"><button type="button" disabled={photos.length >= 3} onClick={() => setPhotos((current) => [...current, `Reference ${current.length + 1}`])} className="grid h-24 w-24 shrink-0 place-items-center rounded-input border border-dashed border-muted text-muted disabled:opacity-40"><Camera size={24}/><span className="text-xs">Add photo</span></button>{photos.map((photo) => <div key={photo} className="relative grid h-24 w-24 shrink-0 place-items-center rounded-input border border-border bg-surface2 text-xs text-muted">{photo}<button type="button" aria-label={`Remove ${photo}`} onClick={() => setPhotos((current) => current.filter((item) => item !== photo))} className="absolute right-1 top-1 grid h-7 w-7 place-items-center rounded-full bg-bg"><X size={14}/></button></div>)}</div></Field>
      {error ? <p role="alert" className="rounded-input border border-danger/40 bg-danger/10 p-3 text-sm text-danger">{error}</p> : null}<PrimaryButton type="submit">Submit request</PrimaryButton>
    </form></AppShell>;
}
