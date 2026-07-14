import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { campuses as mockCampuses } from '../data/mockData';
import type { Campus, User } from '../lib/types';
import { apiClient, apiEnabled, ApiClientError } from '../lib/api';

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
  otpCooldownSeconds: number;
  requestOtp: () => Promise<'sent' | 'limited'>;
  verifyOtp: (otp: string) => Promise<boolean>;
  selectCampus: (campusId: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userName, setUserName] = useState('Animesh Sharma');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [phone, setPhone] = useState('9876543210');
  const [campuses, setCampuses] = useState<Campus[]>(mockCampuses);
  const [selectedCampusId, setSelectedCampusId] = useState('campus-nims');
  const [requestCount, setRequestCount] = useState(0);
  const [otpCooldownSeconds, setOtpCooldownSeconds] = useState(0);

  const selectedCampus = campuses.find((campus) => campus.id === selectedCampusId) ?? campuses[0] ?? mockCampuses[0];

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
      otpCooldownSeconds,
      requestOtp: async () => {
        if (apiEnabled) {
          try {
            await apiClient.requestOtp(phone);
            return 'sent';
          } catch (error) {
            if (error instanceof ApiClientError && error.status === 429) {
              setOtpCooldownSeconds(600);
              return 'limited';
            }
            throw error;
          }
        }

        if (requestCount >= 3) {
          setOtpCooldownSeconds(522);
          return 'limited';
        }
        setRequestCount((count) => count + 1);
        return 'sent';
      },
      verifyOtp: async (otp) => {
        if (apiEnabled) {
          try {
            const result = await apiClient.verifyOtp(phone, otp);
            setToken(result.token);
            setUser(result.user);
            setIsAuthenticated(true);
            const apiCampuses = await apiClient.listCampuses(result.token);
            setCampuses(apiCampuses.length ? apiCampuses : mockCampuses);
            const campusId = result.user.campus_id ?? apiCampuses[0]?.id ?? selectedCampusId;
            setSelectedCampusId(campusId);
            return true;
          } catch {
            return false;
          }
        }

        if (otp !== '1234' && otp !== '4829') {
          return false;
        }
        setToken('mock-student-token');
        setUser({
          id: 'student-demo',
          phone,
          name: userName || 'Student',
          role: 'student',
          campus_id: selectedCampusId
        });
        setIsAuthenticated(true);
        return true;
      },
      selectCampus: async (campusId) => {
        setSelectedCampusId(campusId);
        setUser((current) => (current ? { ...current, campus_id: campusId } : current));
        if (apiEnabled && token) {
          const updatedUser = await apiClient.setCampus(token, campusId);
          setUser(updatedUser);
        }
      },
      logout: () => {
        setIsAuthenticated(false);
        setToken(null);
        setUser(null);
      }
    }),
    [campuses, isAuthenticated, otpCooldownSeconds, phone, requestCount, selectedCampus, selectedCampusId, token, user, userName]
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
