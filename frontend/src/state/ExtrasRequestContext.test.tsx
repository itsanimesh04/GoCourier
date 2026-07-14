import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ExtrasRequestProvider, useExtrasRequests } from './ExtrasRequestContext';

function Harness() {
  const { requests, submitCustom, makeQuoteReady, acceptQuote, rejectQuote } = useExtrasRequests();
  const request = requests[0];
  return <><output aria-label="request state">{request ? `${request.kind}:${request.status}:${Boolean(request.quote)}` : 'empty'}</output>
    <button onClick={() => submitCustom({ title: 'Calculator', note: 'Scientific', quantity: 1, dropPoint: 'Reception', maximumBudget: 600 })}>Submit</button>
    <button disabled={!request} onClick={() => request && makeQuoteReady(request.id)}>Quote</button>
    <button disabled={!request} onClick={() => request && acceptQuote(request.id)}>Accept</button>
    <button disabled={!request} onClick={() => request && rejectQuote(request.id)}>Reject</button></>;
}

describe('ExtrasRequestProvider', () => {
  it('submits a custom request into review', async () => { const user = userEvent.setup(); render(<ExtrasRequestProvider><Harness/></ExtrasRequestProvider>); await user.click(screen.getByRole('button', { name: 'Submit' })); expect(screen.getByLabelText('request state')).toHaveTextContent('custom_request:under_review:false'); });
  it('creates an expiring quote and accepts it', async () => { const user = userEvent.setup(); render(<ExtrasRequestProvider><Harness/></ExtrasRequestProvider>); await user.click(screen.getByRole('button', { name: 'Submit' })); await user.click(screen.getByRole('button', { name: 'Quote' })); expect(screen.getByLabelText('request state')).toHaveTextContent('custom_request:quote_ready:true'); await user.click(screen.getByRole('button', { name: 'Accept' })); expect(screen.getByLabelText('request state')).toHaveTextContent('custom_request:quote_accepted:true'); });
  it('supports rejecting a quote', async () => { const user = userEvent.setup(); render(<ExtrasRequestProvider><Harness/></ExtrasRequestProvider>); await user.click(screen.getByRole('button', { name: 'Submit' })); await user.click(screen.getByRole('button', { name: 'Quote' })); await user.click(screen.getByRole('button', { name: 'Reject' })); expect(screen.getByLabelText('request state')).toHaveTextContent('custom_request:rejected:true'); });
});
