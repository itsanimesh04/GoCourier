import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ServiceModeSwitch } from '../components/common/ServiceModeSwitch';
import { SERVICE_MODE_STORAGE_KEY } from '../lib/serviceMode';
import { ServiceModeProvider, useServiceMode } from './ServiceModeContext';

function Probe() {
  const { mode } = useServiceMode();
  const location = useLocation();
  return <output>{mode}:{location.pathname}</output>;
}

function renderMode(path = '/food') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <ServiceModeProvider>
        <ServiceModeSwitch />
        <Probe />
      </ServiceModeProvider>
    </MemoryRouter>
  );
}

describe('ServiceModeProvider', () => {
  it('defaults to Food without saved state', () => {
    renderMode('/profile');
    expect(screen.getByText('food:/profile')).toBeInTheDocument();
  });

  it('restores a valid saved Extras mode', () => {
    localStorage.setItem(SERVICE_MODE_STORAGE_KEY, 'extras');
    renderMode('/profile');
    expect(screen.getByText('extras:/profile')).toBeInTheDocument();
  });

  it('ignores invalid persisted values', () => {
    localStorage.setItem(SERVICE_MODE_STORAGE_KEY, 'invalid');
    renderMode('/profile');
    expect(screen.getByText('food:/profile')).toBeInTheDocument();
  });

  it('uses a mode-specific URL as the authoritative mode', () => {
    localStorage.setItem(SERVICE_MODE_STORAGE_KEY, 'food');
    renderMode('/extras');
    expect(screen.getByText('extras:/extras')).toBeInTheDocument();
    expect(document.documentElement).toHaveAttribute('data-service-mode', 'extras');
  });

  it('switches mode, route, persisted state, and accessible selection', async () => {
    const user = userEvent.setup();
    renderMode();
    await user.click(screen.getByRole('tab', { name: /Extras:/ }));
    expect(screen.getByText('extras:/extras')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Extras:/ })).toHaveAttribute('aria-selected', 'true');
    expect(localStorage.getItem(SERVICE_MODE_STORAGE_KEY)).toBe('extras');
  });
});
