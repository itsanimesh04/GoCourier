import { Text, View } from 'react-native';

export default function ExtrasRequestShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <View className="flex-1 bg-bg px-4 py-5">
      <Text className="font-display text-2xl font-bold tracking-tight text-fg">{title}</Text>
      <Text className="mt-1.5 font-sans text-sm text-muted">{subtitle}</Text>
      <View className="mt-5 rounded-2xl border border-border bg-surface p-4">{children}</View>
    </View>
  );
}
