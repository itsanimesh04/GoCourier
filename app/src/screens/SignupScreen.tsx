import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import AuthShell from '../components/AuthShell';
import Field from '../components/Field';
import { useAppDispatch, useAppSelector } from '../store';
import { selectAuthError, signupUser } from '../store/slices/authSlice';
import { fetchCart } from '../store/slices/cartSlice';
import { usePalette } from '../theme/ThemeProvider';

export default function SignupScreen() {
  const dispatch = useAppDispatch();
  const error = useAppSelector(selectAuthError);
  const colors = usePalette();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setSubmitting(true);
    const result = await dispatch(
      signupUser({
        name,
        password,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
      })
    );
    setSubmitting(false);
    if (signupUser.fulfilled.match(result)) {
      await dispatch(fetchCart());
      router.replace('/');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerClassName="flex-grow" bounces={false}>
        <AuthShell
          title="Sign Up"
          subtitle="Join GoCourier and start ordering."
          footer={
            <Text className="font-sans text-sm text-muted">
              Already have an account?{' '}
              <Text onPress={() => router.push('/login')} className="font-semibold text-primary">
                Login
              </Text>
            </Text>
          }
        >
          <View className="gap-4">
            <Field
              label="Full name"
              value={name}
              onChangeText={setName}
              placeholder="Rohan Sharma"
              autoCapitalize="words"
              textContentType="name"
              autoComplete="name"
            />
            <Field
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@campus.edu"
              keyboardType="email-address"
              textContentType="emailAddress"
              autoComplete="email"
              autoCorrect={false}
            />
            <Field
              label="Phone"
              value={phone}
              onChangeText={setPhone}
              placeholder="9876543210"
              keyboardType="phone-pad"
              textContentType="telephoneNumber"
              autoComplete="tel"
            />
            <Field
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              textContentType="newPassword"
              autoComplete="password-new"
            />
            {error ? <Text className="font-sans text-sm text-red-400">{error}</Text> : null}
            <Pressable
              disabled={submitting}
              onPress={() => void submit()}
              className="mt-2 flex-row items-center justify-center gap-2 rounded-xl bg-primary py-3.5 disabled:opacity-60"
            >
              {submitting ? <ActivityIndicator color={colors.onPrimary} /> : null}
              <Text className="text-center font-display text-sm font-semibold text-on-primary">
                {submitting ? 'Creating…' : 'Create Account'}
              </Text>
            </Pressable>
          </View>
        </AuthShell>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
