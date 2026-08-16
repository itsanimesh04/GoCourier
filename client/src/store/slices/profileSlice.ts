import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

const STORAGE_KEY = 'gcs-profile';

export const AVATAR_PRESETS = [
  { id: 'avatar-1', url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Rohan' },
  { id: 'avatar-2', url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Ananya' },
  { id: 'avatar-3', url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Vikram' },
  { id: 'avatar-4', url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Priya' },
  { id: 'avatar-5', url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Arjun' },
  { id: 'avatar-6', url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Meera' },
  { id: 'avatar-7', url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Kabir' },
  { id: 'avatar-8', url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Isha' },
] as const;

export type AvatarId = (typeof AVATAR_PRESETS)[number]['id'];

export interface ProfileState {
  name: string;
  email: string;
  phone: string;
  campusId: string;
  avatarId: AvatarId;
}

function loadPersisted(): Partial<ProfileState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Partial<ProfileState>;
  } catch {
    return {};
  }
}

function persist(state: ProfileState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

const persisted = typeof window !== 'undefined' ? loadPersisted() : {};

const initialState: ProfileState = {
  name: persisted.name ?? 'Student',
  email: persisted.email ?? '',
  phone: persisted.phone ?? '',
  campusId: persisted.campusId ?? '',
  avatarId:
    persisted.avatarId && AVATAR_PRESETS.some((a) => a.id === persisted.avatarId)
      ? (persisted.avatarId as AvatarId)
      : 'avatar-1',
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    updateProfile(state, action: PayloadAction<Partial<ProfileState>>) {
      Object.assign(state, action.payload);
      persist(state);
    },
    setAvatarId(state, action: PayloadAction<AvatarId>) {
      state.avatarId = action.payload;
      persist(state);
    },
  },
});

export const { updateProfile, setAvatarId } = profileSlice.actions;

export const selectProfile = (state: { profile: ProfileState }) => state.profile;

export function getAvatarUrl(avatarId: string) {
  return (
    AVATAR_PRESETS.find((a) => a.id === avatarId)?.url ?? AVATAR_PRESETS[0].url
  );
}

export default profileSlice.reducer;
