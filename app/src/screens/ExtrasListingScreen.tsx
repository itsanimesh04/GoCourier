import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

const ExtrasListHeader = memo(function ExtrasListHeader({
  query,
  categories,
  category,
  stores,
  store,
  productCount,
  onSelectCategory,
  onSelectStore,
}: {
  query: string;
  categories: string[];
  category: string;
  stores: string[];
  store: string | null;
  productCount: number;
  onSelectCategory: (cat: string) => void;
  onSelectStore: (store: string | null) => void;
}) {
  return (
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
              onPress={() => onSelectCategory(cat)}
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
                    onPress={() => onSelectStore(active ? null : s)}
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
      <Text className="font-display text-base font-semibold text-fg">Products · {productCount}</Text>
    </View>
  );
});

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

  const handleEndReached = useCallback(() => {
    if (hasMore) {
      setVisibleCount((prev) => Math.min(prev + 10, products.length));
    }
  }, [hasMore, products.length]);

  const pairs = useMemo(() => {
    const rows: { key: string; items: ExtraProduct[] }[] = [];
    for (let i = 0; i < displayedProducts.length; i += 2) {
      const items = displayedProducts.slice(i, i + 2);
      rows.push({ key: `e-${items[0].id}`, items });
    }
    return rows;
  }, [displayedProducts]);

  const listHeader = useMemo(
    () => (
      <ExtrasListHeader
        query={query}
        categories={categories}
        category={category}
        stores={stores}
        store={store}
        productCount={products.length}
        onSelectCategory={setCategory}
        onSelectStore={setStore}
      />
    ),
    [query, categories, category, stores, store, products.length]
  );

  const renderItem = useCallback(({ item }: { item: { key: string; items: ExtraProduct[] } }) => {
    return (
      <View className="mb-3 flex-row items-start gap-3">
        {item.items.map((p) => (
          <View key={p.id} className="min-w-0 flex-1">
            <ExtraCard product={p} />
          </View>
        ))}
        {item.items.length === 1 ? <View className="min-w-0 flex-1" /> : null}
      </View>
    );
  }, []);

  const keyExtractor = useCallback((row: { key: string }) => row.key, []);

  // Track if we ever received data — prevents showing full skeleton on re-fetches
  const hadDataRef = useRef(extras.length > 0);
  if (extras.length > 0) hadDataRef.current = true;

  if (status === 'loading' && extras.length === 0 && !hadDataRef.current) {
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
      keyExtractor={keyExtractor}
      contentContainerClassName="px-4 pb-8 pt-4"
      removeClippedSubviews={false}
      windowSize={11}
      initialNumToRender={8}
      maxToRenderPerBatch={10}
      refreshControl={
        <RefreshControl
          refreshing={status === 'loading'}
          onRefresh={() => void dispatch(loadCatalog(campusId || undefined))}
          tintColor={colors.primary}
        />
      }
      ListHeaderComponent={listHeader}
      ListEmptyComponent={<EmptyState title="No extras match your filters." />}
      renderItem={renderItem}
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
