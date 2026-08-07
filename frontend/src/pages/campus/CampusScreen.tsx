import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell, Check, MapPin, PrimaryButton, ScreenHeader, Search, TextInput } from '../../components/ui';
import { useAppState } from '../../state/AppState';
import { cn } from '../../lib/utils';

export function CampusScreen() {
  const navigate = useNavigate();
  const { campuses, selectedCampus, selectCampus } = useAppState();
  const [query, setQuery] = useState('');
  const visible = campuses.filter((campus) => `${campus.name} ${campus.city} ${campus.state}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <AppShell className="px-0" contentClassName="content-rail py-4">
      <div className="max-w-2xl mx-auto w-full flex flex-col flex-1 pb-12">
        <ScreenHeader title="Pick your campus" />
        <h1 className="font-display text-[32px] font-bold leading-tight">Pick your campus</h1>
        <p className="mt-2 text-sm text-muted">We'll only show restaurants near you</p>
        <div className="mt-5">
          <TextInput value={query} onChange={setQuery} placeholder="Search campuses..." icon={<Search size={19} />} />
        </div>
        <div className="thin-scroll mt-4 max-h-[420px] space-y-3 overflow-y-auto pr-1">
          {visible.map((campus) => {
            const selected = campus.id === selectedCampus.id;
            return (
              <button
                key={campus.id}
                type="button"
                onClick={() => {
                  void selectCampus(campus.id);
                }}
                className={cn(
                  'card-gradient flex min-h-[64px] w-full items-center gap-3 rounded-card border border-border p-3 text-left transition hover:border-border/80',
                  selected && 'border-l-4 border-l-brand'
                )}
              >
                <div className="grid h-10 w-10 place-items-center rounded-button bg-surface2 text-brand">
                  <MapPin size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-display text-base font-bold text-text">{campus.name}</span>
                    {selected ? (
                      <span className="rounded bg-brand/15 px-2 py-0.5 text-[10px] font-bold tracking-wide text-brand uppercase">
                        Selected
                      </span>
                    ) : null}
                  </div>
                  <p className="text-xs text-muted">
                    {campus.city}, {campus.state}
                  </p>
                </div>
                {selected ? (
                  <div className="grid h-6 w-6 place-items-center rounded-full bg-brand text-text">
                    <Check size={14} />
                  </div>
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="mt-auto pt-6">
          <PrimaryButton
            onClick={() => {
              navigate('/home');
            }}
          >
            Continue to {selectedCampus.name}
          </PrimaryButton>
        </div>
      </div>
    </AppShell>
  );
}
