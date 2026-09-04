import { useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, TextInput, View } from 'react-native';
import { Search } from 'lucide-react-native';
import { router } from 'expo-router';
import CampusBatchCard from '../components/CampusBatchCard';
import CatalogModeTabs from '../components/CatalogModeTabs';
import ExtraCard from '../components/ExtraCard';
import ExtrasServiceCards from '../components/ExtrasServiceCards';
import FoodCard from '../components/FoodCard';
import HeroBannerRotator from '../components/HeroBannerRotator';
import InfiniteTextBanner from '../components/InfiniteTextBanner';
import { EmptyState, ScreenLoader, SkeletonBlock, TwoColGrid } from '../components/ui';
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
} from '../store/slices/catalogSlice';
import { selectCatalogMode, selectSelectedCampusId } from '../store/slices/uiSlice';
import { usePalette } from '../theme/ThemeProvider';

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

export default function HomeScreen() {
  const dispatch = useAppDispatch();
  const colors = usePalette();
  const catalogMode = useAppSelector(selectCatalogMode);
  const config = useAppSelector(selectAppConfig);
  const status = useAppSelector(selectCatalogStatus);
  const campusId = useAppSelector(selectSelectedCampusId);
  const menuItems = useAppSelector(selectMenuItems);
  const extras = useAppSelector(selectExtras);
  const apiCategories = useAppSelector(selectFoodCategories);
  const isExtras = catalogMode === 'extras';
  const [query, setQuery] = useState('');
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

  const featuredExtras = extras.filter((p) => p.featured && p.available);
  const stores = [...new Set(extras.map((p) => p.storeName))];
  const showInitialLoader = status === 'loading' && menuItems.length === 0 && extras.length === 0;

  const submit = () => {
    const q = query.trim();
    router.push({ pathname: isExtras ? '/extras' : '/food', params: q ? { q } : {} });
  };

  const featuredFood = useMemo(() => menuItems.slice(0, 8), [menuItems]);

  if (showInitialLoader) {
    return <ScreenLoader label="Loading campus menu…" />;
  }

  return (
    <ScrollView
      className="flex-1 bg-bg"
      keyboardShouldPersistTaps="handled"
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
        <View className="mb-4 flex-row items-center gap-2 rounded-2xl border border-border bg-surface px-3 py-1">
          <Search size={18} color={colors.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={isExtras ? 'Search stationery, snacks…' : 'Search restaurants, dishes…'}
            placeholderTextColor={colors.muted}
            returnKeyType="search"
            onSubmitEditing={submit}
            className="min-h-[44px] flex-1 font-sans text-base text-fg"
          />
          {query.trim() ? (
            <Pressable onPress={submit} className="rounded-xl bg-primary px-3 py-2">
              <Text className="font-sans text-xs font-bold text-on-primary">Go</Text>
            </Pressable>
          ) : null}
        </View>

        {categories.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-5 -mx-4">
            <View className="flex-row gap-3 px-4">
              {categories.map((cat) => (
                <Pressable
                  key={cat.id}
                  onPress={() =>
                    router.push(
                      isExtras
                        ? { pathname: '/extras', params: { category: cat.name } }
                        : { pathname: '/food', params: { q: cat.name } }
                    )
                  }
                  className="w-[76px] items-center"
                >
                  <View className="h-[76px] w-[76px] overflow-hidden rounded-2xl border border-border bg-surface-2">
                    <RemoteImage uri={cat.imageUrl} className="h-full w-full" />
                  </View>
                  <Text numberOfLines={1} className="mt-1.5 text-center font-sans text-[11px] font-semibold text-fg">
                    {cat.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        ) : status === 'loading' ? (
          <View className="mb-5 flex-row gap-3">
            <SkeletonBlock className="h-[76px] w-[76px]" />
            <SkeletonBlock className="h-[76px] w-[76px]" />
            <SkeletonBlock className="h-[76px] w-[76px]" />
          </View>
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
                  {featuredExtras.map((p) => (
                    <ExtraCard key={p.id} product={p} />
                  ))}
                </TwoColGrid>
              </View>
            ) : (
              <EmptyState title="No extras yet" subtitle="Pull to refresh or check back later." />
            )}
          </View>
        ) : featuredFood.length === 0 ? (
          <EmptyState title="No dishes yet for this campus" subtitle="Pull to refresh." />
        ) : (
          <View>
            <Text className="mb-3 font-display text-lg font-bold text-fg">Popular now</Text>
            <TwoColGrid>
              {featuredFood.map((item) => (
                <FoodCard key={item.id} menuItem={item} />
              ))}
            </TwoColGrid>
            <Pressable onPress={() => router.push('/food')} className="mt-4 items-center py-2">
              <Text className="font-sans text-sm font-semibold text-primary">See all food →</Text>
            </Pressable>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
