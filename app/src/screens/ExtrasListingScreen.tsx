import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import CatalogModeTabs from '../components/CatalogModeTabs';
import ExtraCard from '../components/ExtraCard';
import ExtrasServiceCards from '../components/ExtrasServiceCards';
import { ExtraCardSkeleton } from '../components/skeletons';
import { EmptyState, SkeletonBlock } from '../components/ui';
import { useAppDispatch, useAppSelector } from '../store';
import { loadCatalog, selectCatalogStatus, selectExtras } from '../store/slices/catalogSlice';
import { selectSelectedCampusId, setCatalogMode } from '../store/slices/uiSlice';
import { cn } from '../utils/utils';
import { usePalette } from '../theme/ThemeProvider';
import type { ExtraProduct } from '../utils/types';

export default function ExtrasListingScreen() {
  const params = useLocalSearchParams<{ q?: string; store?: string; category?: string }>();
  const dispatch = useAppDispatch();
  const colors = usePalette();
  const extras = useAppSelector(selectExtras);
  const status = useAppSelector(selectCatalogStatus);
  const campusId = useAppSelector(selectSelectedCampusId);
  const query = params.q ?? '';
  const storeParam = params.store;
  const categories = useMemo(() => ['All', ...[...new Set(extras.map((p) => p.category))]], [extras]);
  const [category, setCategory] = useState(
    params.category && categories.includes(params.category) ? params.category : 'All'
  );
  const [visibleCount, setVisibleCount] = useState(16);

  useEffect(() => {
    dispatch(setCatalogMode('extras'));
  }, [dispatch]);

  useEffect(() => {
    if (params.category && categories.includes(params.category)) setCategory(params.category);
  }, [params.category, categories]);

  const stores = useMemo(() => [...new Set(extras.map((p) => p.storeName))], [extras]);
  const [store, setStore] = useState<string | null>(storeParam ?? null);

  useEffect(() => {
    setStore(storeParam ?? null);
  }, [storeParam]);

  useEffect(() => {
    setVisibleCount(16);
  }, [query, store, category]);

  const products = useMemo(() => {
    const q = query.trim().toLowerCase();
    return extras.filter((p) => {
      if (store && p.storeName !== store) return false;
      if (category !== 'All' && p.category !== category) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.storeName.toLowerCase().includes(q)
      );
    });
  }, [category, extras, query, store]);

  const displayedProducts = useMemo(() => products.slice(0, visibleCount), [products, visibleCount]);
  const hasMore = visibleCount < products.length;

  const handleEndReached = () => {
    if (hasMore) {
      setVisibleCount((prev) => Math.min(prev + 10, products.length));
    }
  };

  const pairs = useMemo(() => {
    const rows: ExtraProduct[][] = [];
    for (let i = 0; i < displayedProducts.length; i += 2) rows.push(displayedProducts.slice(i, i + 2));
    return rows;
  }, [displayedProducts]);

  if (status === 'loading' && extras.length === 0) {
    return (
      <ScrollView className="flex-1 bg-bg px-4 pt-4" showsVerticalScrollIndicator={false}>
        <View className="mb-4 gap-5">
          <View>
            <SkeletonBlock className="h-7 w-44 rounded-lg" />
            <SkeletonBlock className="mt-2 h-4 w-60 rounded-md" />
          </View>
          <CatalogModeTabs navigateOnChange />
          <ExtrasServiceCards />
          <View className="flex-row gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-8 w-16 rounded-full" />
            ))}
          </View>
          <View>
            <SkeletonBlock className="mb-3 h-5 w-20 rounded" />
            <View className="flex-row gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonBlock key={i} className="h-10 w-24 rounded-2xl" />
              ))}
            </View>
          </View>
          <SkeletonBlock className="h-5 w-28 rounded" />
        </View>

        <View className="gap-3 pb-8">
          <View className="flex-row gap-3">
            <View className="flex-1">
              <ExtraCardSkeleton />
            </View>
            <View className="flex-1">
              <ExtraCardSkeleton />
            </View>
          </View>
          <View className="flex-row gap-3">
            <View className="flex-1">
              <ExtraCardSkeleton />
            </View>
            <View className="flex-1">
              <ExtraCardSkeleton />
            </View>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <FlatList
      className="flex-1 bg-bg"
      data={pairs}
      keyExtractor={(row) => row.map((p) => p.id).join('-')}
      contentContainerClassName="px-4 pb-8 pt-4"
      refreshControl={
        <RefreshControl
          refreshing={status === 'loading'}
          onRefresh={() => void dispatch(loadCatalog(campusId || undefined))}
          tintColor={colors.primary}
        />
      }
      ListHeaderComponent={
        <View className="mb-4 gap-5">
          <View>
            <Text className="font-display text-2xl font-bold text-fg">Campus extras</Text>
            <Text className="mt-1 font-sans text-sm text-muted">
              {query ? `Results for “${query}”` : 'Stationery, snacks, and essentials'}
            </Text>
          </View>
          <CatalogModeTabs navigateOnChange />
          <ExtrasServiceCards />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-4">
            <View className="flex-row gap-2 px-4">
              {categories.map((cat) => (
                <Pressable
                  key={cat}
                  onPress={() => setCategory(cat)}
                  className={cn(
                    'rounded-full px-3.5 py-2',
                    category === cat ? 'bg-primary' : 'border border-border bg-surface'
                  )}
                >
                  <Text
                    className={cn(
                      'font-sans text-sm font-medium',
                      category === cat ? 'text-on-primary' : 'text-muted'
                    )}
                  >
                    {cat}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
          {stores.length > 0 ? (
            <View>
              <Text className="mb-3 font-display text-base font-semibold text-fg">Stores</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-4">
                <View className="flex-row gap-2 px-4">
                  {stores.map((s) => {
                    const active = store === s;
                    return (
                      <Pressable
                        key={s}
                        onPress={() => setStore(active ? null : s)}
                        className={cn(
                          'rounded-2xl border px-3.5 py-2.5',
                          active ? 'border-primary bg-primary/10' : 'border-border bg-surface'
                        )}
                      >
                        <Text className="font-sans text-sm font-semibold text-fg">{s}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          ) : null}
          <Text className="font-display text-base font-semibold text-fg">Products · {products.length}</Text>
        </View>
      }
      ListEmptyComponent={<EmptyState title="No extras match your filters." />}
      renderItem={({ item: row }) => (
        <View className="mb-3 flex-row gap-3">
          {row.map((p) => (
            <View key={p.id} className="flex-1">
              <ExtraCard product={p} />
            </View>
          ))}
          {row.length === 1 ? <View className="flex-1" /> : null}
        </View>
      )}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.4}
      ListFooterComponent={
        hasMore ? (
          <View className="py-4 items-center justify-center">
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : null
      }
    />
  );
}
