import type { Restaurant } from '../../lib/types';
import { Star, MapPin, Clock } from '../icons';

export interface MenuHeaderProps {
  restaurant: Restaurant;
}

export function MenuHeader({ restaurant }: MenuHeaderProps) {
  return (
    <div className="-mt-2 mb-5 border-b border-border pb-4">
      <div className="flex items-center gap-3 text-xs text-muted">
        <span className="flex items-center gap-1 text-text">
          <Star size={14} className="fill-urgent text-urgent" /> {restaurant.rating.toFixed(1)}
        </span>
        <span>{restaurant.cuisine}</span>
        <span className="flex items-center gap-1">
          <MapPin size={13} /> {restaurant.distanceKm.toFixed(1)} km
        </span>
        <span className="flex items-center gap-1">
          <Clock size={13} /> {restaurant.etaMinutes} min
        </span>
      </div>
    </div>
  );
}
