import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Search } from 'lucide-react-native';
import { router } from 'expo-router';
import CampusBatchCard from '../components/CampusBatchCard';
import CatalogModeTabs from '../components/CatalogModeTabs';
import ExtraCard from '../components/ExtraCard';
import ExtrasServiceCards from '../components/ExtrasServiceCards';
import FoodCard from '../components/FoodCard';
import HeroBannerRotator from '../components/HeroBannerRotator';
import InfiniteTextBanner from '../components/InfiniteTextBanner';
import { ExtraCardSkeleton, FoodCardSkeleton } from '../components/skeletons';
import { EmptyState, SkeletonBlock, TwoColGrid } from '../components/ui';
import { RemoteImage } from '../components/VegBadge';
import { extrasCategoryMeta } from '../data/homepageData';
import { useAppDispatch, useAppSelector } from '../store';
import {
  loadCatalog,
  selectAppConfig,
  selectCatalogStatus,
  selectExtras,
  selectFoodCategories,
  selectMenuItems,
  selectRestaurants,
} from '../store/slices/catalogSlice';
import { selectCatalogMode, selectSelectedCampusId } from '../store/slices/uiSlice';
import { usePalette } from '../theme/ThemeProvider';
import { haptic } from '../utils/haptics';

const foodBannerItems = [
  'Order before cutoff — hostel drop tonight',
  'Campus dinners, delivered on time',
  'Student riders. Fair fees.',
];
const extrasBannerItems = [
  'Stationery, snacks & essentials',
  'Extras ride with your food batch',
  'Campus stores, one checkout',
];

const PAGE_SIZE = 8;
const LOAD_MORE = 10;
const SCROLL_LOAD_THRESHOLD = 200;

export default function HomeScreen() {
  const dispatch = useAppDispatch();
  const colors = usePalette();
  const catalogMode = useAppSelector(selectCatalogMode);
  const config = useAppSelector(selectAppConfig);
  const status = useAppSelector(selectCatalogStatus);
  const campusId = useAppSelector(selectSelectedCampusId);
  const menuItems = useAppSelector(selectMenuItems);
  const restaurants = useAppSelector(selectRestaurants);
  const extras = useAppSelector(selectExtras);
  const apiCategories = useAppSelector(selectFoodCategories);
  const isExtras = catalogMode === 'extras';
  const [query, setQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const loadingMoreRef = useRef(false);

  const marquee =
    config?.marqueeStrings && config.marqueeStrings.length > 0
      ? config.marqueeStrings
      : isExtras
        ? extrasBannerItems
        : foodBannerItems;

  const extrasCats = [...new Set(extras.map((item) => item.category).filter(Boolean))];
  const categories = isExtras
    ? extrasCats.map((name) => ({
        id: name,
        name,
        imageUrl:
          extras.find((item) => item.category === name)?.imageUrl ||
          extrasCategoryMeta[name] ||
          extrasCategoryMeta.Stationery,
      }))
    : apiCategories;

  const featuredExtras = useMemo(
    () => extras.filter((p) => p.featured && p.available),
    [extras]
  );
  const stores = [...new Set(extras.map((p) => p.storeName))];
  const nearbyRestaurants = useMemo(() => {
    const campusFiltered = campusId
      ? restaurants.filter((r) => !r.campusId || r.campusId === campusId)
      : restaurants;
    return campusFiltered.slice(0, 6);
  }, [restaurants, campusId]);

  const showInitialLoader = status === 'loading' && menuItems.length === 0 && extras.length === 0;
  // Track if we ever received data — prevents showing full skeleton on re-fetches
  const hadDataRef = useRef(menuItems.length > 0 || extras.length > 0);
  if (menuItems.length > 0 || extras.length > 0) hadDataRef.current = true;

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
    loadingMoreRef.current = false;
  }, [catalogMode, campusId, menuItems.length, featuredExtras.length]);

  const listLength = isExtras ? featuredExtras.length : menuItems.length;
  const visibleFood = useMemo(
    () => (!isExtras ? menuItems.slice(0, visibleCount) : []),
    [isExtras, menuItems, visibleCount]
  );
  const visibleExtras = useMemo(
    () => (isExtras ? featuredExtras.slice(0, visibleCount) : []),
    [isExtras, featuredExtras, visibleCount]
  );
  const hasMore = visibleCount < listLength;

  const loadMore = useCallback(() => {
    if (!hasMore || loadingMoreRef.current) return;
    loadingMoreRef.current = true;
    setVisibleCount((prev) => Math.min(prev + LOAD_MORE, listLength));
    requestAnimationFrame(() => {
      loadingMoreRef.current = false;
    });
  }, [hasMore, listLength]);

  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, layoutMeasurement, contentSize } = e.nativeEvent;
      const distanceFromBottom = contentSize.height - (contentOffset.y + layoutMeasurement.height);
      if (distanceFromBottom < SCROLL_LOAD_THRESHOLD) {
        loadMore();
      }
    },
    [loadMore]
  );

  const submit = () => {
    const q = query.trim();
    router.push({ pathname: isExtras ? '/extras' : '/food', params: q ? { q } : {} });
  };

  if (showInitialLoader && !hadDataRef.current) {
    return (
      <ScrollView className="flex-1 bg-bg" showsVerticalScrollIndicator={false}>
        <View className="px-4 pb-2 pt-4">
          <CatalogModeTabs />
        </View>
        <View className="px-4 pt-2">
          <SkeletonBlock className="mb-4 h-[48px] w-full rounded-2xl" />
          <View className="mb-5 flex-row gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <View key={i} className="items-center gap-1.5">
                <SkeletonBlock className="h-[76px] w-[76px] rounded-2xl" />
                <SkeletonBlock className="h-3 w-12 rounded" />
              </View>
            ))}
          </View>
          <View className="mb-5">
            <SkeletonBlock className="mb-2 h-4 w-24 rounded" />
            <View className="flex-row gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <View key={i} className="items-center gap-1.5">
                  <SkeletonBlock className="h-[74px] w-[74px] rounded-3xl" />
                  <SkeletonBlock className="h-3 w-12 rounded" />
                </View>
              ))}
            </View>
          </View>
          <View className="gap-3">
            <SkeletonBlock className="h-[120px] w-full rounded-3xl" />
            <SkeletonBlock className="h-[220px] w-full rounded-2xl" />
          </View>
        </View>
        <View className="px-4 py-6 pb-10">
          <SkeletonBlock className="mb-3 h-6 w-32 rounded-lg" />
          <TwoColGrid>
            {Array.from({ length: 4 }).map((_, i) =>
              isExtras ? <ExtraCardSkeleton key={i} /> : <FoodCardSkeleton key={i} />
            )}
          </TwoColGrid>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-bg"
      keyboardShouldPersistTaps="handled"
      scrollEventThrottle={16}
      onScroll={onScroll}
      onMomentumScrollEnd={onScroll}
      refreshControl={
        <RefreshControl
          refreshing={status === 'loading'}
          onRefresh={() => void dispatch(loadCatalog(campusId || undefined))}
          tintColor={colors.primary}
        />
      }
    >
      <View className="px-4 pb-2 pt-4">
        <CatalogModeTabs />
      </View>

      <View className="px-4 pt-2">
        <View className="mb-4 flex-row items-center gap-2.5 rounded-2xl border border-border/80 bg-surface-2/70 px-3.5 py-1.5 shadow-inner">
          <Search size={18} color={colors.primary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={isExtras ? 'Search stationery, snacks, essentials…' : 'Search dishes, restaurants, cuisines…'}
            placeholderTextColor={colors.muted}
            returnKeyType="search"
            onSubmitEditing={submit}
            className="min-h-[42px] flex-1 font-sans text-sm text-fg"
          />
          {query.trim() ? (
            <Pressable
              onPress={submit}
              className="rounded-xl bg-primary px-3 py-1.5 active:scale-95"
            >
              <Text className="font-display text-xs font-bold text-on-primary">Search</Text>
            </Pressable>
          ) : null}
        </View>

        {categories.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-5 -mx-4">
            <View className="flex-row gap-3 px-4">
              {categories.map((cat) => (
                <Pressable
                  key={cat.id}
                  onPress={() => {
                    haptic.selection();
                    router.push(
                      isExtras
                        ? { pathname: '/extras', params: { category: cat.name } }
                        : { pathname: '/food', params: { q: cat.name } }
                    );
                  }}
                  className="w-[76px] items-center active:scale-95"
                >
                  <View className="h-[74px] w-[74px] overflow-hidden rounded-3xl border border-border/80 bg-surface-2 shadow-sm">
                    <RemoteImage uri={cat.imageUrl} className="h-full w-full" />
                  </View>
                  <Text numberOfLines={1} className="mt-1.5 text-center font-display text-[11px] font-bold text-fg">
                    {cat.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        ) : status === 'loading' ? (
          <View className="mb-5 flex-row gap-3">
            <SkeletonBlock className="h-[74px] w-[74px] rounded-3xl" />
            <SkeletonBlock className="h-[74px] w-[74px] rounded-3xl" />
            <SkeletonBlock className="h-[74px] w-[74px] rounded-3xl" />
            <SkeletonBlock className="h-[74px] w-[74px] rounded-3xl" />
          </View>
        ) : null}

        {!isExtras ? (
          nearbyRestaurants.length > 0 ? (
            <View className="mb-5">
              <Text className="mb-2 font-display text-sm font-bold text-fg">Restaurants</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-4">
                <View className="flex-row gap-3 px-4">
                  {nearbyRestaurants.map((r) => (
                    <Pressable
                      key={r.id}
                      onPress={() => {
                        haptic.selection();
                        router.push(`/food/restaurants/${r.id}`);
                      }}
                      className="w-[76px] items-center active:scale-95"
                    >
                      <View className="h-[74px] w-[74px] overflow-hidden rounded-3xl border border-border/80 bg-surface-2 shadow-sm">
                        {r.imageUrl ? (
                          <RemoteImage uri={r.imageUrl} className="h-full w-full" recyclingKey={r.id} />
                        ) : (
                          <View className="h-full w-full items-center justify-center bg-surface-2">
                            <Text className="font-display text-xs font-bold text-muted">
                              {r.name.slice(0, 2).toUpperCase()}
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text numberOfLines={1} className="mt-1.5 text-center font-display text-[11px] font-bold text-fg">
                        {r.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            </View>
          ) : status === 'loading' ? (
            <View className="mb-5">
              <SkeletonBlock className="mb-2 h-4 w-24 rounded" />
              <View className="flex-row gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <View key={i} className="items-center gap-1.5">
                    <SkeletonBlock className="h-[74px] w-[74px] rounded-3xl" />
                    <SkeletonBlock className="h-3 w-12 rounded" />
                  </View>
                ))}
              </View>
            </View>
          ) : null
        ) : null}

        <View className="gap-3">
          <CampusBatchCard />
          <HeroBannerRotator />
        </View>
      </View>

      <View className="mt-6">
        <InfiniteTextBanner items={marquee} />
      </View>

      <View className="px-4 py-6 pb-10">
        {isExtras ? (
          <View className="gap-8">
            <ExtrasServiceCards />
            {stores.length > 0 ? (
              <View>
                <Text className="mb-3 font-display text-lg font-bold text-fg">Campus stores</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-4">
                  <View className="flex-row gap-2 px-4">
                    {stores.map((store) => (
                      <Pressable
                        key={store}
                        onPress={() => router.push({ pathname: '/extras', params: { store } })}
                        className="rounded-2xl border border-border bg-surface px-4 py-3"
                      >
                        <Text className="font-display text-sm font-semibold text-fg">{store}</Text>
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>
              </View>
            ) : null}
            {featuredExtras.length > 0 ? (
              <View>
                <Text className="mb-3 font-display text-lg font-bold text-fg">Featured extras</Text>
                <TwoColGrid>
                  {visibleExtras.map((p) => (
                    <ExtraCard key={p.id} product={p} />
                  ))}
                </TwoColGrid>
                {hasMore ? (
                  <View className="mt-4 items-center py-2">
                    <ActivityIndicator size="small" color={colors.primary} />
                  </View>
                ) : null}
              </View>
            ) : status === 'loading' ? (
              <View>
                <SkeletonBlock className="mb-3 h-6 w-32 rounded-lg" />
                <TwoColGrid>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <ExtraCardSkeleton key={i} />
                  ))}
                </TwoColGrid>
              </View>
            ) : (
              <EmptyState title="No extras yet" subtitle="Pull to refresh or check back later." />
            )}
          </View>
        ) : menuItems.length === 0 ? (
          status === 'loading' ? (
            <View>
              <SkeletonBlock className="mb-3 h-6 w-32 rounded-lg" />
              <TwoColGrid>
                {Array.from({ length: 4 }).map((_, i) => (
                  <FoodCardSkeleton key={i} />
                ))}
              </TwoColGrid>
            </View>
          ) : (
            <EmptyState title="No dishes yet for this campus" subtitle="Pull to refresh." />
          )
        ) : (
          <View>
            <Text className="mb-3 font-display text-lg font-bold text-fg">Popular now</Text>
            <TwoColGrid>
              {visibleFood.map((item) => (
                <FoodCard key={item.id} menuItem={item} />
              ))}
            </TwoColGrid>
            {hasMore ? (
              <View className="mt-4 items-center py-2">
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : (
              <Pressable onPress={() => router.push('/food')} className="mt-4 items-center py-2">
                <Text className="font-sans text-sm font-semibold text-primary">See all food →</Text>
              </Pressable>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
