import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ClipboardList,
  Clock,
  EmptyStateBlock,
  ErrorStateBlock,
  Search,
  ShoppingCart
} from '../components/ui';
import { cn } from '../lib/utils';

function StateDivider({ label, danger, urgent }: { label: string; danger?: boolean; urgent?: boolean }) {
  return (
    <div className="my-3 flex items-center gap-2 text-xs text-muted">
      <span className={cn('h-0.5 w-2', danger ? 'bg-danger' : urgent ? 'bg-urgent' : 'bg-brand')} />
      <span>{label}</span>
      <span className={cn('h-px flex-1 border-t border-dashed', danger ? 'border-danger' : urgent ? 'border-urgent' : 'border-brand')} />
    </div>
  );
}

export function EmptyStatesScreen() {
  const navigate = useNavigate();
  return (
    <div>
      <StateDivider label="Empty Cart" />
      <EmptyStateBlock icon={<ShoppingCart size={56} />} heading="Cart's feeling lonely" subtext="Add something delicious to get started" action="Browse restaurants" onAction={() => navigate('/home')} />
      <StateDivider label="No Search Results" />
      <EmptyStateBlock icon={<Search size={56} />} heading="Nothing matches that" subtext="Try a different dish or restaurant name" />
      <StateDivider label="No Past Orders" />
      <EmptyStateBlock icon={<ClipboardList size={56} />} heading="No orders yet" subtext="Your first order is one tap away" action="Order now" onAction={() => navigate('/home')} />
    </div>
  );
}

export function ErrorStatesScreen() {
  return (
    <div>
      <StateDivider label="Payment Failed" danger />
      <ErrorStateBlock icon={<AlertTriangle size={42} />} heading="Payment didn't go through" subtext="No money was taken. Give it another shot?" primary="Try again" secondary="Use a different method" />
      <StateDivider label="Cutoff Passed" urgent />
      <ErrorStateBlock icon={<Clock size={42} />} heading="Batch just closed" subtext="Cutoff hit while you were checking out. Next batch opens at 7:00 PM." primary="Set a reminder" secondary="Back to browse" urgent />
    </div>
  );
}
