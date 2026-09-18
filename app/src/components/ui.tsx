import { Children, useEffect, useRef, type ReactNode } from 'react';
import { ActivityIndicator, Animated, Text, View, type ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cn } from '../utils/utils';

export function ScreenLoader({ label = 'Loading…' }: { label?: string }) {
  return (
    <View className="flex-1 items-center justify-center bg-bg">
      <ActivityIndicator color="#ff0040" size="large" />
      <Text className="mt-3 font-sans text-sm text-muted">{label}</Text>
    </View>
  );
}

export function EmptyState({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View className="items-center px-6 py-16">
      <Text className="text-center font-display text-xl font-bold text-fg">{title}</Text>
      {subtitle ? <Text className="mt-2 text-center font-sans text-sm text-muted">{subtitle}</Text> : null}
    </View>
  );
}

export function SkeletonBlock({ className, style, ...rest }: ViewProps & { className?: string }) {
  const opacity = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.95,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.45,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      {...rest}
      style={[{ opacity }, style]}
      className={cn('rounded-xl bg-surface-2', className)}
    />
  );
}

export function BottomBar({ children, className, ...rest }: ViewProps & { children: ReactNode; className?: string }) {
  const insets = useSafeAreaInsets();
  return (
    <View
      {...rest}
      style={[{ paddingBottom: Math.max(insets.bottom, 12) }, rest.style]}
      className={cn('border-t border-border bg-surface px-4 pt-3', className)}
    >
      {children}
    </View>
  );
}

export function TwoColGrid({ children }: { children: ReactNode }) {
  const items = Children.toArray(children);
  const rows: ReactNode[][] = [];
  for (let i = 0; i < items.length; i += 2) {
    rows.push(items.slice(i, i + 2));
  }
  return (
    <View className="gap-3">
      {rows.map((row, idx) => (
        <View key={idx} className="flex-row items-start gap-3">
          {row.map((cell, i) => {
            const key =
              cell && typeof cell === 'object' && 'key' in cell && cell.key != null
                ? String(cell.key)
                : `cell-${idx}-${i}`;
            return (
              <View key={key} className="min-w-0 flex-1">
                {cell}
              </View>
            );
          })}
          {row.length === 1 ? <View className="min-w-0 flex-1" /> : null}
        </View>
      ))}
    </View>
  );
}
