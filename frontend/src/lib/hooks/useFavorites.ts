import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'gc-favorites';

function readFavorites(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as string[];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function writeFavorites(ids: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(() =>
    typeof window === 'undefined' ? new Set() : readFavorites()
  );

  useEffect(() => {
    writeFavorites(favorites);
  }, [favorites]);

  const isFavorite = useCallback((id: string) => favorites.has(id), [favorites]);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  return { favorites, isFavorite, toggleFavorite };
}
