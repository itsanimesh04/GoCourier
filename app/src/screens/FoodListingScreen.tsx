import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SlidersHorizontal } from 'lucide-react-native';
import FilterDrawer from '../components/FilterDrawer';
import FoodCard from '../components/FoodCard';
import RestaurantCard from '../components/RestaurantCard';
import { EmptyState, ScreenLoader } from '../components/ui';
import { filterMenuItems, filterRestaurants } from '../data/selectors';
import { useAppDispatch, useAppSelector } from '../store';
import { loadCatalog, selectCatalogStatus, selectMenuItems, selectRestaurants } from '../store/slices/catalogSlice';
import { openFilterDrawer, selectSelectedCampusId, setCatalogMode } from '../store/slices/uiSlice';
import { DEFAULT_FOOD_FILTERS, type FoodFilters, type MenuItem, type Restaurant } from '../utils/types';
import { usePalette } from '../theme/ThemeProvider';

function filtersFromParams(params: Record<string, string | string[] | undefined>): FoodFilters {
  const diet = typeof params.diet === 'string' ? params.diet : undefined;
  const priceTo = typeof params.priceTo === 'string' ? params.priceTo : undefined;
  return {
    ...DEFAULT_FOOD_FILTERS,
    query: typeof params.q === 'string' ? params.q : '',
    cuisine: typeof params.cuisine === 'string' ? params.cuisine : null,
    diet: diet === 'veg' || diet === 'non_veg' ? diet : 'all',
    priceTo: priceTo ? Number(priceTo) : DEFAULT_FOOD_FILTERS.priceTo,
  };
}

type Row =
  | { type: 'header'; key: string }
  | { type: 'restaurants'; key: string; items: Restaurant[] }
  | { type: 'section'; key: string; title: string }
  | { type: 'food-pair'; key: string; items: MenuItem[] }
  | { type: 'empty'; key: string };

export default function FoodListingScreen() {
  const params = useLocalSearchParams();
  const dispatch = useAppDispatch();
  const colors = usePalette();
  const menuItems = useAppSelector(selectMenuItems);
  const restaurants = useAppSelector(selectRestaurants);
  const status = useAppSelector(selectCatalogStatus);
  const campusId = useAppSelector(selectSelectedCampusId);
  const [filters, setFilters] = useState<FoodFilters>(() => filtersFromParams(params));

  useEffect(() => {
    dispatch(setCatalogMode('food'));
  }, [dispatch]);

  useEffect(() => {
    setFilters(filtersFromParams(params));
  }, [params.q, params.cuisine, params.diet, params.priceTo]);

  const foods = useMemo(() => filterMenuItems(menuItems, filters), [filters, menuItems]);
  const restoList = useMemo(() => filterRestaurants(restaurants, filters).slice(0, 4), [filters, restaurants]);

  const rows = useMemo(() => {
    const out: Row[] = [{ type: 'header', key: 'header' }];
    if (restoList.length > 0) {
      out.push({ type: 'restaurants', key: 'restaurants', items: restoList });
    }
    out.push({ type: 'section', key: 'dishes-title', title: `Dishes · ${foods.length}` });
    if (foods.length === 0) {
      out.push({ type: 'empty', key: 'empty' });
    } else {
      for (let i = 0; i < foods.length; i += 2) {
        out.push({ type: 'food-pair', key: `f-${foods[i].id}`, items: foods.slice(i, i + 2) });
      }
    }
    return out;
  }, [foods, restoList]);

  if (status === 'loading' && menuItems.length === 0) {
    return <ScreenLoader label="Loading food…" />;
  }

  return (
    <View className="flex-1 bg-bg">
      <FlatList
        data={rows}
        keyExtractor={(item) => item.key}
        contentContainerClassName="px-4 pb-8 pt-4"
        refreshControl={
          <RefreshControl
            refreshing={status === 'loading'}
            onRefresh={() => void dispatch(loadCatalog(campusId || undefined))}
            tintColor={colors.primary}
          />
        }
        renderItem={({ item }) => {
          if (item.type === 'header') {
            return (
              <View className="mb-5 flex-row items-end justify-between gap-3">
                <View className="min-w-0 flex-1">
                  <Text className="font-display text-2xl font-bold text-fg">All Food</Text>
                  <Text className="mt-1 font-sans text-sm text-muted">
                    {filters.query
                      ? `Results for “${filters.query}”`
                      : filters.cuisine
                        ? filters.cuisine
                        : 'Browse campus favourites'}
                  </Text>
                </View>
                <Pressable
                  onPress={() => dispatch(openFilterDrawer())}
                  className="flex-row items-center gap-2 rounded-xl border border-border bg-surface px-3.5 py-2.5"
                >
                  <SlidersHorizontal size={16} color={colors.fg} />
                  <Text className="font-sans text-sm font-semibold text-fg">Filter</Text>
                </Pressable>
              </View>
            );
          }
          if (item.type === 'restaurants') {
            return (
              <View className="mb-8">
                <View className="mb-3 flex-row items-center justify-between">
                  <Text className="font-display text-lg font-bold text-fg">Restaurants</Text>
                  <Text className="font-sans text-sm text-primary">{item.items.length} nearby</Text>
                </View>
                <View className="flex-row flex-wrap gap-3">
                  {item.items.map((r) => (
                    <View key={r.id} className="w-[47%] flex-grow">
                      <RestaurantCard restaurant={r} />
                    </View>
                  ))}
                </View>
              </View>
            );
          }
          if (item.type === 'section') {
            return <Text className="mb-3 font-display text-lg font-semibold text-fg">{item.title}</Text>;
          }
          if (item.type === 'empty') {
            return <EmptyState title="No dishes match your filters" />;
          }
          return (
            <View className="mb-3 flex-row gap-3">
              {item.items.map((food) => (
                <View key={food.id} className="flex-1">
                  <FoodCard menuItem={food} />
                </View>
              ))}
              {item.items.length === 1 ? <View className="flex-1" /> : null}
            </View>
          );
        }}
      />
      <FilterDrawer value={filters} onApply={setFilters} showRating />
    </View>
  );
}
