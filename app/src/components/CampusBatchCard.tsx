import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useAppSelector } from '../store';
import { selectCampuses } from '../store/slices/catalogSlice';
import { selectSelectedCampusId } from '../store/slices/uiSlice';
import { formatClockLabel, formatCountdown, getCampusById, getNextCutoffDate } from '../utils/campusTime';
import { useTimerAccent } from '../utils/timerAccent';
import { cn } from '../utils/utils';

export default function CampusBatchCard() {
  const campusId = useAppSelector(selectSelectedCampusId);
  const campuses = useAppSelector(selectCampuses);
  const campus = getCampusById(campuses, campusId);
  const { accentColor, textClass, bgClass } = useTimerAccent();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!campus) return null;

  const cutoff = getNextCutoffDate(campus.cutoffTime, new Date(now));
  const remaining = cutoff.getTime() - now;
  const locked = remaining <= 0;

  return (
    <View className="relative overflow-hidden rounded-2xl border border-border bg-surface p-3.5">
      <View className="flex-row items-start justify-between gap-2">
        <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
          <View className="h-2 w-2 rounded-full" style={{ backgroundColor: accentColor }} />
          <Text className="font-display text-xs font-semibold uppercase tracking-wide text-fg">
            Tonight's campus batch
          </Text>
        </View>
        <Text className="shrink-0 font-sans text-[11px] text-muted">Locks @ {formatClockLabel(campus.cutoffTime)}</Text>
      </View>
      <View className="my-3 h-px bg-border" />
      <View className="flex-row gap-3">
        <View className="flex-1">
          <Text className="font-sans text-[11px] text-muted">Order cutoff in</Text>
          <Text className={cn('mt-0.5 font-display text-2xl font-bold tracking-tight', textClass)}>
            {locked ? 'CLOSED' : formatCountdown(remaining)}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="font-sans text-[11px] text-muted">Delivery schedule</Text>
          <Text className="mt-0.5 font-display text-sm font-semibold text-fg">
            Hostel drop @ {formatClockLabel(campus.deliveryTime)}
          </Text>
          <Text className="mt-0.5 font-sans text-[11px] text-muted">{campus.name}</Text>
        </View>
      </View>
      <View className={cn('mt-3.5 h-1 rounded-full', bgClass)} />
    </View>
  );
}
