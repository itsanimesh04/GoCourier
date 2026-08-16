import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import authService from '../../services/auth.service';
import { apiErrorMessage } from '../../apis/clientApi';
import type { User } from '../../utils/types';

interface AuthState {
  user: User | null;
  status: 'idle' | 'loading' | 'ready';
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  status: 'idle',
  error: null,
};

export const bootstrapAuth = createAsyncThunk('auth/bootstrap', async () => {
  const res = await authService.me();
  return res.data.data.user;
});

export const loginUser = createAsyncThunk(
  'auth/login',
  async (payload: { identifier: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await authService.login(payload.identifier, payload.password);
      return res.data.data.user;
    } catch (error) {
      return rejectWithValue(apiErrorMessage(error));
    }
  }
);

export const signupUser = createAsyncThunk(
  'auth/signup',
  async (
    payload: { name: string; password: string; email?: string; phone?: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await authService.signup(payload);
      return res.data.data.user;
    } catch (error) {
      return rejectWithValue(apiErrorMessage(error));
    }
  }
);

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  await authService.logout().catch(() => undefined);
});

export const setUserCampus = createAsyncThunk(
  'auth/setCampus',
  async (campusId: string, { rejectWithValue }) => {
    try {
      const res = await authService.setCampus(campusId);
      return res.data.data;
    } catch (error) {
      return rejectWithValue(apiErrorMessage(error));
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(bootstrapAuth.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(bootstrapAuth.fulfilled, (state, action) => {
        state.status = 'ready';
        state.user = action.payload;
        state.error = null;
      })
      .addCase(bootstrapAuth.rejected, (state) => {
        state.status = 'ready';
        state.user = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.error = (action.payload as string) ?? 'Login failed';
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.error = null;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.error = (action.payload as string) ?? 'Signup failed';
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
      })
      .addCase(setUserCampus.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const selectAuthUser = (state: { auth: AuthState }) => state.auth.user;
export const selectAuthStatus = (state: { auth: AuthState }) => state.auth.status;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;

export default authSlice.reducer;
