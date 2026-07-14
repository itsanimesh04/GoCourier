import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell, BottomNav, PrimaryButton, ScreenHeader } from '../components/ui';
import { Field, inputClass, textareaClass } from '../components/extras/RequestFormFields';
import { useExtrasCatalog } from '../state/ExtrasCatalogContext';
import { useExtrasRequests } from '../state/ExtrasRequestContext';

export function ParcelRequestScreen() {
  const navigate = useNavigate(); const { cartCount } = useExtrasCatalog(); const { submitParcel } = useExtrasRequests();
  const [pickup, setPickup] = useState(''); const [drop, setDrop] = useState(''); const [sender, setSender] = useState(''); const [receiver, setReceiver] = useState('');
  const [category, setCategory] = useState('Documents'); const [size, setSize] = useState(''); const [notes, setNotes] = useState(''); const [safe, setSafe] = useState(false); const [error, setError] = useState('');
  function submit(event: FormEvent) { event.preventDefault(); if (!pickup || !drop || !sender || !receiver || !size || !safe) { setError('Complete the locations, contacts, size, and prohibited-item confirmation.'); return; } const id = submitParcel({ title: `${category} parcel`, dropPoint: drop, note: `Pickup: ${pickup}. Sender: ${sender}. Receiver: ${receiver}. Size/weight: ${size}. ${notes}` }); navigate(`/extras/requests/${id}`); }
  return <AppShell bottomNav={<BottomNav cartCount={cartCount} />}><ScreenHeader title="Parcel pickup & drop" /><form onSubmit={submit} className="mx-auto max-w-2xl space-y-5"><div><h1 className="font-display text-2xl font-bold">Request a parcel quote</h1><p className="mt-1 text-sm text-muted">Campus deliveries join the scheduled batch after quote acceptance.</p></div>
    <Field label="Pickup location"><input className={inputClass} value={pickup} onChange={(e) => setPickup(e.target.value)} placeholder="Building, gate, or reception" /></Field><Field label="Drop location"><input className={inputClass} value={drop} onChange={(e) => setDrop(e.target.value)} placeholder="Destination and landmark" /></Field>
    <div className="grid grid-cols-2 gap-3"><Field label="Sender contact"><input className={inputClass} value={sender} onChange={(e) => setSender(e.target.value)} placeholder="Name, phone" /></Field><Field label="Receiver contact"><input className={inputClass} value={receiver} onChange={(e) => setReceiver(e.target.value)} placeholder="Name, phone" /></Field></div>
    <div className="grid grid-cols-2 gap-3"><Field label="Parcel category"><select className={inputClass} value={category} onChange={(e) => setCategory(e.target.value)}><option>Documents</option><option>Books</option><option>Clothing</option><option>Electronics</option><option>Other</option></select></Field><Field label="Approx. size / weight"><input className={inputClass} value={size} onChange={(e) => setSize(e.target.value)} placeholder="30 × 20 cm, 2 kg" /></Field></div>
    <Field label="Handling notes"><textarea className={textareaClass} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Fragile, keep upright, reception instructions…" /></Field>
    <label className="flex items-start gap-3 rounded-input border border-border bg-card p-4"><input type="checkbox" checked={safe} onChange={(e) => setSafe(e.target.checked)} className="mt-1 h-5 w-5 accent-[var(--brand)]"/><span><strong className="block text-sm">Prohibited-item confirmation</strong><span className="mt-1 block text-xs leading-5 text-muted">I confirm this parcel contains no illegal, hazardous, perishable, or restricted items.</span></span></label>
    {error ? <p role="alert" className="rounded-input border border-danger/40 bg-danger/10 p-3 text-sm text-danger">{error}</p> : null}<PrimaryButton type="submit">Submit for quote</PrimaryButton></form></AppShell>;
}
