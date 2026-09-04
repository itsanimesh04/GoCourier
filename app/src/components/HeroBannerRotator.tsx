import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAppDispatch, useAppSelector } from '../store';
import { selectBanners } from '../store/slices/catalogSlice';
import { setCatalogMode } from '../store/slices/uiSlice';
import { RemoteImage } from './VegBadge';
import { cn } from '../utils/utils';

const INTERVAL_MS = 4500;

export default function HeroBannerRotator() {
  const [index, setIndex] = useState(0);
  const dispatch = useAppDispatch();
  const banners = useAppSelector(selectBanners);
  const banner = banners[index % Math.max(banners.length, 1)];

  useEffect(() => {
    if (banners.length === 0) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % banners.length);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, [banners.length]);

  if (!banner) return null;

  const onCta = () => {
    if (banner.ctaHref.startsWith('/extras')) dispatch(setCatalogMode('extras'));
    else if (banner.ctaHref.startsWith('/food')) dispatch(setCatalogMode('food'));
    if (banner.ctaHref.startsWith('/signup')) router.push('/signup');
    else if (banner.ctaHref.startsWith('/extras')) router.push('/extras');
    else router.push('/food');
  };

  return (
    <View className="relative min-h-[220px] overflow-hidden rounded-2xl border border-border bg-surface">
      <RemoteImage uri={banner.imageUrl} className="absolute inset-0 h-full w-full" />
      <LinearGradient
        colors={['transparent', 'rgba(10,10,11,0.85)']}
        className="absolute inset-0"
        style={{ position: 'absolute', inset: 0 }}
      />
      <View className="mt-auto p-4">
        <Text className="font-display text-base font-semibold leading-tight text-fg">{banner.title}</Text>
        <Text numberOfLines={2} className="mt-1 font-sans text-xs text-muted">
          {banner.subtitle}
        </Text>
        <Pressable onPress={onCta} className="mt-3 self-start rounded-lg bg-primary px-3 py-1.5">
          <Text className="font-sans text-[11px] font-semibold uppercase tracking-wide text-on-primary">
            {banner.ctaLabel}
          </Text>
        </Pressable>
      </View>
      <View className="absolute bottom-3 right-3 z-10 flex-row gap-1.5">
        {banners.map((b, i) => (
          <Pressable
            key={b.id}
            onPress={() => setIndex(i)}
            className={cn('h-1.5 rounded-full', i === index % banners.length ? 'w-5 bg-primary' : 'w-1.5 bg-fg/40')}
          />
        ))}
      </View>
    </View>
  );
}
