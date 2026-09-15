import { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { Check, ChevronDown, MapPin } from 'lucide-react-native';
import { useAppDispatch, useAppSelector } from '../store';
import { selectCampuses } from '../store/slices/catalogSlice';
import { selectAuthUser, setUserCampus } from '../store/slices/authSlice';
import { selectSelectedCampusId, setSelectedCampusId } from '../store/slices/uiSlice';
import { usePalette } from '../theme/ThemeProvider';
import { cn } from '../utils/utils';
import { haptic } from '../utils/haptics';

function shortName(name: string) {
  return name.replace(/\s*University\s*/i, ' ').trim();
}

export default function CampusPicker({ variant = 'header' }: { variant?: 'header' | 'panel' }) {
  const dispatch = useAppDispatch();
  const colors = usePalette();
  const campuses = useAppSelector(selectCampuses);
  const selectedId = useAppSelector(selectSelectedCampusId);
  const user = useAppSelector(selectAuthUser);
  const selected = campuses.find((c) => c.id === selectedId) ?? campuses[0];
  const [open, setOpen] = useState(false);

  const pick = (id: string) => {
    haptic.selection();
    dispatch(setSelectedCampusId(id));
    if (user) void dispatch(setUserCampus(id));
    setOpen(false);
  };

  const handleOpen = () => {
    haptic.light();
    setOpen(true);
  };

  if (!selected) return null;

  return (
    <>
      <Pressable
        onPress={handleOpen}
        hitSlop={6}
        className={cn(
          'flex-row items-center gap-1.5',
          variant === 'header'
            ? 'py-0.5'
            : 'rounded-xl border border-border bg-surface-2 px-3 py-2'
        )}
      >
        <MapPin size={16} color={colors.primary} />
        <View className="min-w-0">
          {variant === 'header' && (
            <Text className="font-sans text-[10px] font-bold uppercase tracking-wider text-muted">
              Delivering To
            </Text>
          )}
          <View className="flex-row items-center gap-1">
            <Text
              numberOfLines={1}
              className="max-w-[160px] font-display text-sm font-bold text-fg"
            >
              {shortName(selected.name)}
            </Text>
            <ChevronDown size={14} color={colors.fg} />
          </View>
        </View>
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <View className="flex-1 justify-end bg-black/60">
          <Pressable className="flex-1" onPress={() => setOpen(false)} />
          <View className="max-h-[75%] rounded-t-3xl border-t border-border bg-surface px-5 pb-8 pt-3">
            {/* Grab handle bar */}
            <View className="mx-auto mb-4 h-1 w-12 rounded-full bg-border" />

            <View className="mb-4 flex-row items-center justify-between">
              <View>
                <Text className="font-display text-lg font-bold text-fg">Choose Campus</Text>
                <Text className="font-sans text-xs text-muted">Select your delivery location</Text>
              </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="divide-y divide-border/60">
              {campuses.map((campus) => {
                const active = campus.id === selected.id;
                return (
                  <Pressable
                    key={campus.id}
                    onPress={() => pick(campus.id)}
                    className={cn(
                      'my-1 flex-row items-center justify-between rounded-2xl p-3.5',
                      active ? 'bg-primary/10' : 'bg-surface-2/60'
                    )}
                  >
                    <View className="flex-1 pr-2">
                      <Text
                        className={cn(
                          'font-display text-sm font-bold',
                          active ? 'text-primary' : 'text-fg'
                        )}
                      >
                        {campus.name}
                      </Text>
                      <Text className="mt-0.5 font-sans text-xs text-muted">
                        {campus.city}{campus.state ? `, ${campus.state}` : ''}
                      </Text>
                    </View>
                    {active && (
                      <View className="h-6 w-6 items-center justify-center rounded-full bg-primary">
                        <Check size={14} color={colors.onPrimary} strokeWidth={3} />
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}
