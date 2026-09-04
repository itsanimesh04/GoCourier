import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import AuthShell from '../components/AuthShell';
import Field from '../components/Field';
import { useAppDispatch, useAppSelector } from '../store';
import { loginUser, selectAuthError } from '../store/slices/authSlice';
import { fetchCart } from '../store/slices/cartSlice';
import { loadCatalog } from '../store/slices/catalogSlice';
import { usePalette } from '../theme/ThemeProvider';

export default function LoginScreen() {
  const dispatch = useAppDispatch();
  const error = useAppSelector(selectAuthError);
  const colors = usePalette();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setSubmitting(true);
    const result = await dispatch(loginUser({ identifier, password }));
    setSubmitting(false);
    if (loginUser.fulfilled.match(result)) {
      const campusId = result.payload.campus_id ?? undefined;
      await dispatch(loadCatalog(campusId));
      await dispatch(fetchCart());
      router.replace(((from as string) || '/') as Href);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerClassName="flex-grow" bounces={false}>
        <AuthShell
          title="Login"
          subtitle="Welcome back — pick up where you left off."
          footer={
            <Text className="font-sans text-sm text-muted">
              New here?{' '}
              <Text onPress={() => router.push('/signup')} className="font-semibold text-primary">
                Create account
              </Text>
            </Text>
          }
        >
          <View className="gap-4">
            <Field
              label="Email or phone"
              value={identifier}
              onChangeText={setIdentifier}
              placeholder="you@campus.edu"
              textContentType="username"
              autoComplete="username"
              autoCorrect={false}
            />
            <Field
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              textContentType="password"
              autoComplete="password"
            />
            {error ? <Text className="font-sans text-sm text-red-400">{error}</Text> : null}
            <Pressable
              disabled={submitting}
              onPress={() => void submit()}
              className="mt-2 flex-row items-center justify-center gap-2 rounded-xl bg-primary py-3.5 disabled:opacity-60"
            >
              {submitting ? <ActivityIndicator color={colors.onPrimary} /> : null}
              <Text className="text-center font-display text-sm font-semibold text-on-primary">
                {submitting ? 'Logging in…' : 'Login'}
              </Text>
            </Pressable>
          </View>
        </AuthShell>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
