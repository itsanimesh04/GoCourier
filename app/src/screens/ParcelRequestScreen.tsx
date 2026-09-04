import { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import ExtrasRequestShell from '../components/ExtrasRequestShell';
import Field from '../components/Field';
import { useAppDispatch, useAppSelector } from '../store';
import { addExtra } from '../store/slices/cartSlice';
import { selectAppConfig } from '../store/slices/catalogSlice';
import { setCatalogMode } from '../store/slices/uiSlice';
import { cn } from '../utils/utils';
import { usePalette } from '../theme/ThemeProvider';

const SERVICE_IMAGE =
  'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400&q=80';
const sizes = ['Small', 'Medium', 'Large'] as const;

export default function ParcelRequestScreen() {
  const dispatch = useAppDispatch();
  const colors = usePalette();
  const config = useAppSelector(selectAppConfig);
  const fee = config?.parcelFee ?? 79;
  const [pickup, setPickup] = useState('');
  const [dropPoint, setDropPoint] = useState('');
  const [size, setSize] = useState<(typeof sizes)[number]>('Small');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(setCatalogMode('extras'));
  }, [dispatch]);

  const valid = pickup.trim() && dropPoint.trim();

  const submit = async () => {
    if (!valid || submitting) return;
    setSubmitting(true);
    const note = [
      `Pickup: ${pickup.trim()}`,
      `Drop: ${dropPoint.trim()}`,
      `Size: ${size}`,
      notes.trim() ? `Notes: ${notes.trim()}` : null,
    ]
      .filter(Boolean)
      .join(' · ');

    try {
      await dispatch(
        addExtra({
          extrasProductId: 'parcel-pickup',
          name: 'Parcel pickup & drop',
          imageUrl: SERVICE_IMAGE,
          unitPrice: fee,
          note,
          itemKind: 'parcel',
          pickupPoint: pickup.trim(),
          dropPoint: dropPoint.trim(),
          size,
        })
      );
      router.push('/cart');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-bg">
      <ScrollView keyboardShouldPersistTaps="handled">
        <ExtrasRequestShell
          title="Parcel pickup & drop"
          subtitle="Send or collect parcels on campus — quoted and delivered with the batch."
        >
          <View className="gap-4">
            <Field
              label="Pickup point"
              value={pickup}
              onChangeText={setPickup}
              placeholder="e.g. Main gate courier desk"
              autoCapitalize="sentences"
            />
            <Field
              label="Drop point"
              value={dropPoint}
              onChangeText={setDropPoint}
              placeholder="Hostel Block C lobby"
              autoCapitalize="sentences"
            />
            <View>
              <Text className="font-sans text-xs text-muted">Parcel size</Text>
              <View className="mt-2 flex-row gap-2">
                {sizes.map((s) => (
                  <Pressable
                    key={s}
                    onPress={() => setSize(s)}
                    className={cn(
                      'flex-1 items-center rounded-xl py-2.5',
                      size === s ? 'bg-primary' : 'border border-border bg-surface-2'
                    )}
                  >
                    <Text className={cn('font-sans text-sm font-medium', size === s ? 'text-on-primary' : 'text-muted')}>
                      {s}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
            <Field
              label="Notes (optional)"
              value={notes}
              onChangeText={setNotes}
              placeholder="Fragile, timing window…"
              multiline
              autoCapitalize="sentences"
            />
            <Text className="font-sans text-xs text-muted">
              Base service fee ₹{fee} — final quote confirmed before pickup.
            </Text>
            <Pressable
              disabled={!valid || submitting}
              onPress={() => void submit()}
              className="flex-row items-center justify-center gap-2 rounded-xl bg-primary py-3.5 disabled:opacity-40"
            >
              {submitting ? <ActivityIndicator color={colors.onPrimary} /> : null}
              <Text className="text-center font-sans text-sm font-semibold text-on-primary">
                {submitting ? 'Adding…' : 'Add to cart'}
              </Text>
            </Pressable>
          </View>
        </ExtrasRequestShell>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
