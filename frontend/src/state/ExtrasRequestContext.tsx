import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

export type ExtrasRequestKind = 'custom_request' | 'parcel';
export type ExtrasRequestStatus = 'submitted' | 'under_review' | 'quote_ready' | 'quote_accepted' | 'rejected';

export interface ExtrasRequest {
  id: string;
  kind: ExtrasRequestKind;
  title: string;
  note: string;
  quantity: number;
  dropPoint: string;
  maximumBudget?: number;
  status: ExtrasRequestStatus;
  submittedAt: string;
  quote?: { itemCost: number; serviceFee: number; deliveryFee: number; opsNote: string; expiresAt: number };
}

interface ExtrasRequestContextValue {
  requests: ExtrasRequest[];
  submitCustom: (input: Omit<ExtrasRequest, 'id' | 'kind' | 'status' | 'submittedAt' | 'quote'>) => string;
  submitParcel: (input: { title: string; note: string; dropPoint: string }) => string;
  getRequest: (id: string) => ExtrasRequest | undefined;
  makeQuoteReady: (id: string) => void;
  acceptQuote: (id: string) => void;
  rejectQuote: (id: string) => void;
}

const ExtrasRequestContext = createContext<ExtrasRequestContextValue | null>(null);

export function ExtrasRequestProvider({ children }: { children: ReactNode }) {
  const [requests, setRequests] = useState<ExtrasRequest[]>([]);
  const submitCustom = useCallback<ExtrasRequestContextValue['submitCustom']>((input) => {
    const id = `request-${Date.now()}`;
    setRequests((current) => [...current, { ...input, id, kind: 'custom_request', status: 'under_review', submittedAt: new Date().toISOString() }]);
    return id;
  }, []);
  const submitParcel = useCallback<ExtrasRequestContextValue['submitParcel']>((input) => {
    const id = `parcel-${Date.now()}`;
    setRequests((current) => [...current, { ...input, id, kind: 'parcel', quantity: 1, status: 'under_review', submittedAt: new Date().toISOString() }]);
    return id;
  }, []);
  const makeQuoteReady = useCallback((id: string) => setRequests((current) => current.map((request) => request.id === id ? { ...request, status: 'quote_ready', quote: { itemCost: request.maximumBudget ? Math.min(request.maximumBudget, 480) : 180, serviceFee: 35, deliveryFee: 20, opsNote: 'Available from a verified campus-area vendor. Final item will match the request details.', expiresAt: Date.now() + 30 * 60 * 1000 } } : request)), []);
  const setStatus = useCallback((id: string, status: ExtrasRequestStatus) => setRequests((current) => current.map((request) => request.id === id ? { ...request, status } : request)), []);
  const value = useMemo<ExtrasRequestContextValue>(() => ({ requests, submitCustom, submitParcel, getRequest: (id) => requests.find((request) => request.id === id), makeQuoteReady, acceptQuote: (id) => setStatus(id, 'quote_accepted'), rejectQuote: (id) => setStatus(id, 'rejected') }), [makeQuoteReady, requests, setStatus, submitCustom, submitParcel]);
  return <ExtrasRequestContext.Provider value={value}>{children}</ExtrasRequestContext.Provider>;
}

export function useExtrasRequests() {
  const context = useContext(ExtrasRequestContext);
  if (!context) throw new Error('useExtrasRequests must be used inside ExtrasRequestProvider');
  return context;
}
