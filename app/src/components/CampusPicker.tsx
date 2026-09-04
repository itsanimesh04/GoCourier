import { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { useAppDispatch, useAppSelector } from '../store';
import { selectCampuses } from '../store/slices/catalogSlice';
import { selectAuthUser, setUserCampus } from '../store/slices/authSlice';
import { selectSelectedCampusId, setSelectedCampusId } from '../store/slices/uiSlice';
import { usePalette } from '../theme/ThemeProvider';
import { cn } from '../utils/utils';

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
    dispatch(setSelectedCampusId(id));
    if (user) void dispatch(setUserCampus(id));
    setOpen(false);
  };

  if (!selected) return null;

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        className={cn(
          'flex-row items-center gap-1 rounded-lg px-2 py-1',
          variant === 'header' ? 'border border-on-primary/40' : 'border border-border bg-surface'
        )}
      >
        <Text
          numberOfLines={1}
          className={cn(
            'max-w-[120px] font-sans text-xs font-semibold',
            variant === 'header' ? 'text-on-primary' : 'text-fg'
          )}
        >
          {shortName(selected.name)}
        </Text>
        <ChevronDown size={14} color={variant === 'header' ? colors.onPrimary : colors.fg} />
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable className="flex-1 justify-center bg-black/60 px-6" onPress={() => setOpen(false)}>
          <Pressable className="max-h-[70%] overflow-hidden rounded-2xl border border-border bg-surface">
            <Text className="border-b border-border px-4 py-3 font-display text-base font-bold uppercase text-fg">
              Choose campus
            </Text>
            <ScrollView>
              {campuses.map((campus) => {
                const active = campus.id === selected.id;
                return (
                  <Pressable
                    key={campus.id}
                    onPress={() => pick(campus.id)}
                    className={cn('px-4 py-3', active && 'bg-primary/10')}
                  >
                    <Text className="font-display text-sm font-semibold text-fg">{campus.name}</Text>
                    <Text className="font-sans text-xs text-muted">{campus.city}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
