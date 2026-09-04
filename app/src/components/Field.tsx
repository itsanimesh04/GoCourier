import { useState } from 'react';
import { Pressable, Text, TextInput, View, type TextInputProps } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { usePalette } from '../theme/ThemeProvider';

export default function Field({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize = 'none',
  multiline,
  textContentType,
  autoComplete,
  autoCorrect,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'number-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words';
  multiline?: boolean;
  textContentType?: TextInputProps['textContentType'];
  autoComplete?: TextInputProps['autoComplete'];
  autoCorrect?: boolean;
}) {
  const colors = usePalette();
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = !!secureTextEntry;

  return (
    <View>
      <Text className="font-sans text-xs font-medium text-muted">{label}</Text>
      <View className="relative mt-1.5">
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          secureTextEntry={isPassword && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          textContentType={textContentType}
          autoComplete={autoComplete}
          autoCorrect={autoCorrect}
          className="rounded-xl border border-border bg-surface px-3.5 py-3 font-sans text-base text-fg"
          style={isPassword ? { paddingRight: 44 } : undefined}
        />
        {isPassword ? (
          <Pressable
            onPress={() => setShowPassword((v) => !v)}
            hitSlop={8}
            className="absolute right-3 top-3 p-0.5"
          >
            {showPassword ? <EyeOff size={18} color={colors.muted} /> : <Eye size={18} color={colors.muted} />}
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
