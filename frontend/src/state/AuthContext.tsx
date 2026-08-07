import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { campuses as mockCampuses } from '../data/mockData';
import type { Campus, User } from '../lib/types';
import { apiClient, apiEnabled, ApiClientError } from '../lib/api';

const TOKEN_KEY = 'gc-auth-token';

export interface AuthContextValue {
  token: string | null;
  user: User | null;
  userName: string;
  setUserName: (name: string) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  phone: string;
  setPhone: (phone: string) => void;
  campuses: Campus[];
  selectedCampus: Campus;
  signup: (input: {
    name: string;
    password: string;
    email?: string;
    phone?: string;
  }) => Promise<void>;
  login: (identifier: string, password: string) => Promise<void>;
  selectCampus: (campusId: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function persistToken(token: string | null) {
  if (token) sessionStorage.setItem(TOKEN_KEY, token);
  else sessionStorage.removeItem(TOKEN_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    typeof window === 'undefined' ? null : sessionStorage.getItem(TOKEN_KEY)
  );
  const [user, setUser] = useState<User | null>(null);
  const [userName, setUserName] = useState('Animesh Sharma');
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(token));
  const [phone, setPhone] = useState('9876543210');
  const [campuses, setCampuses] = useState<Campus[]>(mockCampuses);
  const [selectedCampusId, setSelectedCampusId] = useState('campus-nims');

  const selectedCampus =
    campuses.find((campus) => campus.id === selectedCampusId) ?? campuses[0] ?? mockCampuses[0];

  const applySession = useCallback(async (nextToken: string, nextUser: User) => {
    setToken(nextToken);
    persistToken(nextToken);
    setUser(nextUser);
    setUserName(nextUser.name || 'Student');
    setPhone(nextUser.phone || '');
    setIsAuthenticated(true);
    setSelectedCampusId(nextUser.campus_id ?? selectedCampusId);

    if (apiEnabled) {
      try {
        const apiCampuses = await apiClient.listCampuses(nextToken);
        if (apiCampuses.length) {
          setCampuses(apiCampuses);
          setSelectedCampusId(nextUser.campus_id ?? apiCampuses[0].id);
        }
      } catch {
        /* keep mock campuses */
      }
    }
  }, [selectedCampusId]);

  useEffect(() => {
    if (token && !user) {
      setIsAuthenticated(true);
    }
  }, [token, user]);

  const signup = useCallback(
    async (input: { name: string; password: string; email?: string; phone?: string }) => {
      if (apiEnabled) {
        const result = await apiClient.signup(input);
        await applySession(result.token, {
          ...result.user,
          email: result.user.email ?? null,
          phone: result.user.phone ?? null
        });
        return;
      }

      if (input.password.length < 6) {
        throw new ApiClientError(400, 'WEAK_PASSWORD', 'Password must be at least 6 characters');
      }

      const mockUser: User = {
        id: 'student-demo',
        name: input.name,
        email: input.email ?? null,
        phone: input.phone ?? null,
        role: 'student',
        campus_id: selectedCampusId
      };
      await applySession('mock-student-token', mockUser);
    },
    [applySession, selectedCampusId]
  );

  const login = useCallback(
    async (identifier: string, password: string) => {
      if (apiEnabled) {
        const result = await apiClient.login(identifier, password);
        await applySession(result.token, {
          ...result.user,
          email: result.user.email ?? null,
          phone: result.user.phone ?? null
        });
        return;
      }

      if (password.length < 6) {
        throw new ApiClientError(401, 'INVALID', 'Invalid credentials');
      }

      const looksLikeEmail = identifier.includes('@');
      const mockUser: User = {
        id: 'student-demo',
        name: userName || 'Student',
        email: looksLikeEmail ? identifier : null,
        phone: looksLikeEmail ? null : identifier.replace(/\D/g, ''),
        role: 'student',
        campus_id: selectedCampusId
      };
      await applySession('mock-student-token', mockUser);
    },
    [applySession, selectedCampusId, userName]
  );

  const logout = useCallback(async () => {
    if (apiEnabled && token) {
      try {
        await apiClient.logout(token);
      } catch {
        /* ignore */
      }
    }
    setIsAuthenticated(false);
    setToken(null);
    persistToken(null);
    setUser(null);
  }, [token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      userName,
      setUserName,
      isAuthenticated,
      setIsAuthenticated,
      phone,
      setPhone,
      campuses,
      selectedCampus,
      signup,
      login,
      selectCampus: async (campusId) => {
        setSelectedCampusId(campusId);
        setUser((current) => (current ? { ...current, campus_id: campusId } : current));
        if (apiEnabled && token) {
          const updatedUser = await apiClient.setCampus(token, campusId);
          setUser({
            ...updatedUser,
            email: updatedUser.email ?? null,
            phone: updatedUser.phone ?? null
          });
        }
      },
      logout
    }),
    [
      campuses,
      isAuthenticated,
      login,
      logout,
      phone,
      selectedCampus,
      signup,
      token,
      user,
      userName
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
