import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { Clock, Sparkles } from 'lucide-react-native';
import { useAppSelector } from '../store';
import { selectCampuses } from '../store/slices/catalogSlice';
import { selectSelectedCampusId } from '../store/slices/uiSlice';
import { formatClockLabel, formatCountdown, getCampusById, getNextCutoffDate } from '../utils/campusTime';
import { useTimerAccent } from '../utils/timerAccent';
import { cn } from '../utils/utils';
import { usePalette } from '../theme/ThemeProvider';
import { SkeletonBlock } from './ui';

export default function CampusBatchCard() {
  const campusId = useAppSelector(selectSelectedCampusId);
  const campuses = useAppSelector(selectCampuses);
  const campus = getCampusById(campuses, campusId);
  const colors = usePalette();
  const { accentColor, textClass, bgClass } = useTimerAccent();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!campus) {
    return (
      <View className="relative h-[120px] overflow-hidden rounded-3xl border border-border/80 bg-surface p-4 shadow-sm">
        <View className="flex-row items-center justify-between">
          <SkeletonBlock className="h-4 w-36 rounded-md" />
          <SkeletonBlock className="h-4 w-20 rounded-full" />
        </View>
        <View className="mt-3 flex-row items-end justify-between">
          <View className="gap-1.5">
            <SkeletonBlock className="h-3 w-20 rounded" />
            <SkeletonBlock className="h-7 w-28 rounded-lg" />
          </View>
          <View className="items-end gap-1.5">
            <SkeletonBlock className="h-6 w-28 rounded-xl" />
            <SkeletonBlock className="h-3 w-16 rounded" />
          </View>
        </View>
        <SkeletonBlock className="mt-3.5 h-1 w-full rounded-full" />
      </View>
    );
  }

  const cutoff = getNextCutoffDate(campus.cutoffTime, new Date(now));
  const remaining = cutoff.getTime() - now;
  const locked = remaining <= 0;

  return (
    <View className="relative overflow-hidden rounded-3xl border border-border/80 bg-surface p-4 shadow-sm">
      {/* Top row: Live indicator & Batch title */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <View className="relative flex-row items-center justify-center">
            <View
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: accentColor }}
            />
          </View>
          <Text className="font-display text-xs font-bold uppercase tracking-wider text-fg">
            Tonight's Campus Batch
          </Text>
        </View>
        <View className="rounded-full bg-surface-2 px-2.5 py-0.5">
          <Text className="font-sans text-[10px] font-semibold text-muted">
            Cutoff {formatClockLabel(campus.cutoffTime)}
          </Text>
        </View>
      </View>

      {/* Main info row */}
      <View className="mt-3 flex-row items-end justify-between">
        <View>
          <Text className="font-sans text-[10px] font-bold uppercase tracking-wider text-muted">
            Order cutoff in
          </Text>
          <Text className={cn('mt-0.5 font-display text-2xl font-black tracking-tight', textClass)}>
            {locked ? 'CLOSED' : formatCountdown(remaining)}
          </Text>
        </View>

        <View className="items-end">
          <View className="flex-row items-center gap-1 rounded-xl bg-primary/10 px-2.5 py-1">
            <Clock size={12} color={colors.primary} />
            <Text className="font-display text-xs font-bold text-primary">
              Drop {formatClockLabel(campus.deliveryTime)}
            </Text>
          </View>
          <Text className="mt-1 font-sans text-[10px] text-muted">
            {campus.name}
          </Text>
        </View>
      </View>

      {/* Subtle accent bar */}
      <View className={cn('mt-3.5 h-1 w-full rounded-full', bgClass)} />
    </View>
  );
}
