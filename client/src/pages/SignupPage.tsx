import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthField from './components/Auth/AuthField';
import AuthShell from './components/Auth/AuthShell';
import { useAppDispatch, useAppSelector } from '../store';
import { selectAuthError, signupUser } from '../store/slices/authSlice';
import { fetchCart } from '../store/slices/cartSlice';

const SignupPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const error = useAppSelector(selectAuthError);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      navigate('/', { replace: true });
    }
  };

  return (
    <AuthShell
      title="Sign Up"
      subtitle="Join GoCourier and start ordering."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="text-primary underline-offset-2 hover:underline">
            Login
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <AuthField
          id="signup-name"
          label="Full name"
          value={name}
          onChange={setName}
          placeholder="Rohan Sharma"
          autoComplete="name"
        />
        <AuthField
          id="signup-email"
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@campus.edu"
          autoComplete="email"
        />
        <AuthField
          id="signup-phone"
          label="Phone"
          type="tel"
          value={phone}
          onChange={setPhone}
          placeholder="9876543210"
          autoComplete="tel"
        />
        <AuthField
          id="signup-password"
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
          autoComplete="new-password"
        />
        {error && <p className="font-sans text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="mt-2 w-full rounded-xl bg-primary py-3 font-display text-sm font-semibold uppercase tracking-wide text-on-primary transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {submitting ? 'Creating…' : 'Create Account'}
        </button>
      </form>
    </AuthShell>
  );
};

export default SignupPage;
