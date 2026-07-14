import { SERVICE_MODES, type ServiceMode } from '../../lib/serviceMode';
import { useServiceMode } from '../../state/ServiceModeContext';

export function ServiceModeSwitch() {
  const { mode, setMode } = useServiceMode();

  return (
    <div className="grid grid-cols-2 rounded-button border border-border bg-card p-1" role="tablist" aria-label="Delivery service">
      {(Object.keys(SERVICE_MODES) as ServiceMode[]).map((id) => {
        const item = SERVICE_MODES[id];
        const selected = mode === id;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-label={`${item.label}: ${item.description}`}
            onClick={() => setMode(id)}
            className={`min-h-tap rounded-[9px] px-4 text-sm font-bold transition-colors ${
              selected ? 'bg-brand text-brandContrast shadow-sm' : 'text-muted hover:text-text'
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
