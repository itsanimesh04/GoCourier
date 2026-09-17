import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { usePalette } from '../theme/ThemeProvider';

export default function ExtrasRequestShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const colors = usePalette();

  return (
    <View className="flex-1 bg-bg px-4 py-5">
      <View className="flex-row items-center gap-3">
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/extras'))}
          className="rounded-xl border border-border bg-surface p-2 active:scale-95"
          hitSlop={8}
        >
          <ArrowLeft size={18} color={colors.fg} />
        </Pressable>
        <Text className="font-display text-2xl font-bold tracking-tight text-fg">{title}</Text>
      </View>
      <Text className="mt-1.5 font-sans text-sm text-muted">{subtitle}</Text>
      <View className="mt-5 rounded-2xl border border-border bg-surface p-4">{children}</View>
    </View>
  );
}
