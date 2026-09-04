import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { X } from 'lucide-react-native';
import ExtrasRequestShell from '../components/ExtrasRequestShell';
import Field from '../components/Field';
import { useAppDispatch, useAppSelector } from '../store';
import { addExtra } from '../store/slices/cartSlice';
import { selectAppConfig } from '../store/slices/catalogSlice';
import { setCatalogMode } from '../store/slices/uiSlice';
import { uploadCustomRequestPhoto } from '../services/upload.service';
import { usePalette } from '../theme/ThemeProvider';

const SERVICE_IMAGE =
  'https://images.unsplash.com/photo-1583485088034-697b5bc36b00?w=400&q=80';

export default function CustomRequestScreen() {
  const dispatch = useAppDispatch();
  const colors = usePalette();
  const config = useAppSelector(selectAppConfig);
  const fee = config?.customRequestFee ?? 49;
  const [need, setNeed] = useState('');
  const [quantity, setQuantity] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(setCatalogMode('extras'));
  }, [dispatch]);

  const valid = need.trim() && quantity.trim() && photoUri;

  const pickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow photo access to attach a screenshot.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setError(null);
      setPhotoUri(result.assets[0].uri);
    }
  };

  const submit = async () => {
    if (!valid || !photoUri) return;
    setSubmitting(true);
    setError(null);
    try {
      const imageUrl = await uploadCustomRequestPhoto(photoUri);
      const note = [`Need: ${need.trim()}`, `Qty: ${quantity.trim()}`].join(' · ');
      await dispatch(
        addExtra({
          extrasProductId: 'custom-request',
          name: 'Custom request',
          imageUrl: imageUrl || SERVICE_IMAGE,
          unitPrice: fee,
          note,
          itemKind: 'custom_request',
        })
      );
      router.push('/cart');
    } catch {
      setError('Could not upload screenshot. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 bg-bg">
      <ScrollView keyboardShouldPersistTaps="handled">
        <ExtrasRequestShell
          title="Custom request"
          subtitle="Tell us what you need — we'll quote and deliver with tonight's batch."
        >
          <View className="gap-4">
            <Field
              label="What do you need?"
              value={need}
              onChangeText={setNeed}
              placeholder="e.g. A4 sheets, phone charger"
              autoCapitalize="sentences"
            />
            <Field label="Quantity / approx" value={quantity} onChangeText={setQuantity} placeholder="e.g. 2 packs" />
            <View>
              <Text className="font-sans text-xs text-muted">Share screenshot of product</Text>
              {photoUri ? (
                <View className="relative mt-2 overflow-hidden rounded-xl border border-border bg-surface-2">
                  <Image source={{ uri: photoUri }} contentFit="contain" className="h-48 w-full" />
                  <Pressable
                    onPress={() => setPhotoUri(null)}
                    className="absolute right-2 top-2 rounded-lg bg-surface/90 p-1.5"
                  >
                    <X size={16} color={colors.fg} />
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  onPress={() => void pickPhoto()}
                  className="mt-2 items-center rounded-xl border border-dashed border-border bg-surface-2 px-4 py-8"
                >
                  <Text className="font-sans text-sm text-muted">Tap to upload screenshot</Text>
                  <Text className="mt-1 font-sans text-xs text-muted">PNG, JPG up to 5 MB</Text>
                </Pressable>
              )}
            </View>
            {error ? <Text className="font-sans text-xs text-primary">{error}</Text> : null}
            <Text className="font-sans text-xs text-muted">
              Base service fee ₹{fee} — final quote confirmed before procurement.
            </Text>
            <Pressable
              disabled={!valid || submitting}
              onPress={() => void submit()}
              className="flex-row items-center justify-center gap-2 rounded-xl bg-primary py-3.5 disabled:opacity-40"
            >
              {submitting ? <ActivityIndicator color={colors.onPrimary} /> : null}
              <Text className="text-center font-sans text-sm font-semibold text-on-primary">
                {submitting ? 'Uploading…' : 'Add to cart'}
              </Text>
            </Pressable>
          </View>
        </ExtrasRequestShell>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
