import { useMemo, useState } from 'react';
import { Pressable, ScrollView, SectionList, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Heart, SlidersHorizontal, Star } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FilterDrawer from '../components/FilterDrawer';
import FoodCard from '../components/FoodCard';
import { RemoteImage } from '../components/VegBadge';
import { EmptyState } from '../components/ui';
import { filterMenuItems, getMenuByRestaurant, groupByCategory } from '../data/selectors';
import { useAppDispatch, useAppSelector } from '../store';
import { selectMenuItems, selectRestaurants } from '../store/slices/catalogSlice';
import { openFilterDrawer } from '../store/slices/uiSlice';
import { selectIsRestaurantWishlisted, toggleRestaurantWishlist } from '../store/slices/wishlistSlice';
import { DEFAULT_FOOD_FILTERS, type FoodFilters } from '../utils/types';
import { usePalette } from '../theme/ThemeProvider';
import { cn } from '../utils/utils';

export default function RestaurantScreen() {
  const { id = '' } = useLocalSearchParams<{ id: string }>();
  const restaurants = useAppSelector(selectRestaurants);
  const menuItems = useAppSelector(selectMenuItems);
  const restaurant = restaurants.find((r) => r.id === id);
  const dispatch = useAppDispatch();
  const colors = usePalette();
  const wishlisted = useAppSelector(selectIsRestaurantWishlisted(id));
  const [filters, setFilters] = useState<FoodFilters>(DEFAULT_FOOD_FILTERS);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const allItems = useMemo(
    () => (restaurant ? getMenuByRestaurant(menuItems, restaurant.id) : []),
    [restaurant, menuItems]
  );
  const filtered = useMemo(() => filterMenuItems(allItems, filters), [allItems, filters]);
  const grouped = useMemo(() => groupByCategory(filtered), [filtered]);
  const categories = useMemo(() => Object.keys(grouped).sort(), [grouped]);

  const sections = useMemo(() => {
    const cats = activeCategory ? [activeCategory] : categories;
    return cats
      .filter((cat) => (grouped[cat] ?? []).length > 0)
      .map((cat) => ({ title: cat, data: grouped[cat] ?? [] }));
  }, [activeCategory, categories, grouped]);

  if (!restaurant) {
    return (
      <View className="flex-1 items-center justify-center bg-bg px-6">
        <Text className="font-display text-2xl font-bold text-fg">Restaurant not found</Text>
        <Pressable onPress={() => router.push('/food')} className="mt-4">
          <Text className="font-sans text-sm font-semibold text-primary">Browse food</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-bg">
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        ListHeaderComponent={
          <View>
            <View className="relative min-h-[220px]">
              <RemoteImage uri={restaurant.imageUrl} className="absolute inset-0 h-full w-full" />
              <LinearGradient colors={['rgba(10,10,11,0.15)', '#0a0a0b']} style={{ position: 'absolute', inset: 0 }} />
              <View className="mt-auto p-4">
                <View
                  className={cn(
                    'mb-2 self-start rounded-lg px-2 py-0.5',
                    restaurant.isOpen ? 'bg-green-500' : 'bg-surface'
                  )}
                >
                  <Text className="font-sans text-[10px] font-bold uppercase text-white">
                    {restaurant.isOpen ? 'Open' : 'Closed'}
                  </Text>
                </View>
                <Text className="font-display text-3xl font-bold tracking-tight text-fg">{restaurant.name}</Text>
                <Text className="mt-1 font-sans text-sm text-muted">{restaurant.cuisine}</Text>
                <View className="mt-2 flex-row flex-wrap items-center gap-3">
                  <View className="flex-row items-center gap-1">
                    <Star size={12} color="#eab308" fill="#eab308" />
                    <Text className="font-sans text-xs text-muted">{restaurant.rating.toFixed(1)}</Text>
                  </View>
                  <Text className="font-sans text-xs text-muted">{restaurant.etaMinutes} min</Text>
                  <Text className="font-sans text-xs text-muted">
                    {restaurant.openTime} – {restaurant.closeTime}
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={() => dispatch(toggleRestaurantWishlist(restaurant.id))}
                className="absolute right-4 top-4 rounded-xl bg-surface/90 p-2.5"
              >
                <Heart
                  size={18}
                  color={wishlisted ? colors.primary : colors.fg}
                  fill={wishlisted ? colors.primary : 'transparent'}
                />
              </Pressable>
            </View>

            <View className="px-4 pt-5">
              <View className="mb-4 flex-row items-center justify-between">
                <Text className="font-sans text-sm text-muted">{filtered.length} items</Text>
                <Pressable
                  onPress={() => dispatch(openFilterDrawer())}
                  className="flex-row items-center gap-2 rounded-xl border border-border bg-surface px-3.5 py-2"
                >
                  <SlidersHorizontal size={16} color={colors.fg} />
                  <Text className="font-sans text-sm font-semibold text-fg">Filter</Text>
                </Pressable>
              </View>

              {categories.length > 1 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4 -mx-4">
                  <View className="flex-row gap-2 px-4">
                    <Pressable
                      onPress={() => setActiveCategory(null)}
                      className={cn(
                        'rounded-full px-3.5 py-2',
                        !activeCategory ? 'bg-primary' : 'border border-border bg-surface'
                      )}
                    >
                      <Text className={cn('font-sans text-sm', !activeCategory ? 'text-on-primary' : 'text-muted')}>
                        All
                      </Text>
                    </Pressable>
                    {categories.map((cat) => (
                      <Pressable
                        key={cat}
                        onPress={() => setActiveCategory(cat)}
                        className={cn(
                          'rounded-full px-3.5 py-2',
                          activeCategory === cat ? 'bg-primary' : 'border border-border bg-surface'
                        )}
                      >
                        <Text
                          className={cn(
                            'font-sans text-sm',
                            activeCategory === cat ? 'text-on-primary' : 'text-muted'
                          )}
                        >
                          {cat}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>
              ) : null}
            </View>
          </View>
        }
        renderSectionHeader={({ section }) => (
          <Text className="bg-bg px-4 pb-2 pt-2 font-display text-base font-bold text-fg">{section.title}</Text>
        )}
        renderItem={({ item }) => (
          <View className="px-4 pb-3">
            <FoodCard menuItem={item} />
          </View>
        )}
        ListEmptyComponent={
          <View className="px-4">
            <EmptyState title="No items match your filters" />
          </View>
        }
        contentContainerClassName="pb-8"
      />
      <FilterDrawer value={filters} onApply={setFilters} />
    </View>
  );
}
