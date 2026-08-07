import type { Restaurant } from '../../lib/types';
import { Star, MapPin, Clock } from '../icons';

export interface MenuHeaderProps {
  restaurant: Restaurant;
}

export function MenuHeader({ restaurant }: MenuHeaderProps) {
  return (
    <div className="-mt-2 mb-6 border-b border-border pb-4">
      <div className="flex items-center gap-4 text-sm text-muted">
        <span className="flex items-center gap-1 font-medium text-foreground">
          <Star size={16} className="fill-secondary text-secondary" /> {restaurant.rating.toFixed(1)}
        </span>
        <span className="font-medium">{restaurant.cuisine}</span>
        <span className="flex items-center gap-1 font-medium">
          <MapPin size={14} /> {restaurant.distanceKm.toFixed(1)} km
        </span>
        <span className="flex items-center gap-1 font-medium">
          <Clock size={14} /> {restaurant.etaMinutes} min
        </span>
      </div>
    </div>
  );
}
