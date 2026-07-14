import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ExtrasCatalogProvider, useExtrasCatalog } from './ExtrasCatalogContext';

function Harness() {
  const { cartCount, subtotal, quantity, add, remove, clear } = useExtrasCatalog();
  return <>
    <output aria-label="cart summary">{cartCount}:{subtotal}:{quantity('gel-pen')}</output>
    <button onClick={() => add('gel-pen')}>Add pen</button>
    <button onClick={() => remove('gel-pen')}>Remove pen</button>
    <button onClick={clear}>Clear</button>
  </>;
}

describe('ExtrasCatalogProvider', () => {
  it('starts with a separate empty Extras cart', () => {
    render(<ExtrasCatalogProvider><Harness /></ExtrasCatalogProvider>);
    expect(screen.getByLabelText('cart summary')).toHaveTextContent('0:0:0');
  });

  it('adds and removes quantities while calculating subtotal', async () => {
    const user = userEvent.setup();
    render(<ExtrasCatalogProvider><Harness /></ExtrasCatalogProvider>);
    await user.click(screen.getByRole('button', { name: 'Add pen' }));
    await user.click(screen.getByRole('button', { name: 'Add pen' }));
    expect(screen.getByLabelText('cart summary')).toHaveTextContent('2:30:2');
    await user.click(screen.getByRole('button', { name: 'Remove pen' }));
    expect(screen.getByLabelText('cart summary')).toHaveTextContent('1:15:1');
  });

  it('clears the Extras cart', async () => {
    const user = userEvent.setup();
    render(<ExtrasCatalogProvider><Harness /></ExtrasCatalogProvider>);
    await user.click(screen.getByRole('button', { name: 'Add pen' }));
    await user.click(screen.getByRole('button', { name: 'Clear' }));
    expect(screen.getByLabelText('cart summary')).toHaveTextContent('0:0:0');
  });
});
