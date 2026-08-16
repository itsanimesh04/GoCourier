import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthField from './components/Auth/AuthField';
import AuthShell from './components/Auth/AuthShell';
import { useAppDispatch, useAppSelector } from '../store';
import { loginUser, selectAuthError } from '../store/slices/authSlice';
import { fetchCart } from '../store/slices/cartSlice';
import { loadCatalog } from '../store/slices/catalogSlice';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const error = useAppSelector(selectAuthError);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const from = (location.state as { from?: string } | null)?.from ?? '/';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const result = await dispatch(loginUser({ identifier, password }));
    setSubmitting(false);
    if (loginUser.fulfilled.match(result)) {
      const campusId = result.payload.campus_id ?? undefined;
      await dispatch(loadCatalog(campusId));
      await dispatch(fetchCart());
      navigate(from, { replace: true });
    }
  };

  return (
    <AuthShell
      title="Login"
      subtitle="Welcome back — pick up where you left off."
      footer={
        <>
          New here?{' '}
          <Link to="/signup" className="text-primary underline-offset-2 hover:underline">
            Create account
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <AuthField
          id="login-email"
          label="Email or phone"
          type="text"
          value={identifier}
          onChange={setIdentifier}
          placeholder="you@campus.edu"
          autoComplete="username"
        />
        <AuthField
          id="login-password"
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
          autoComplete="current-password"
        />
        {error && <p className="font-sans text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="mt-2 w-full rounded-xl bg-primary py-3 font-display text-sm font-semibold uppercase tracking-wide text-on-primary transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {submitting ? 'Logging in…' : 'Login'}
        </button>
      </form>
    </AuthShell>
  );
};

export default LoginPage;
