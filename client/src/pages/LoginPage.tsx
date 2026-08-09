import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthField from './components/Auth/AuthField';
import AuthShell from './components/Auth/AuthShell';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/profile');
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
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@campus.edu"
          autoComplete="email"
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
        <button
          type="submit"
          className="mt-2 w-full bg-primary py-3.5 font-bebas text-2xl uppercase tracking-wide text-white transition-colors hover:bg-red-700"
        >
          Login
        </button>
      </form>
    </AuthShell>
  );
};

export default LoginPage;
