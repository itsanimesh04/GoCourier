import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { saveJSON } from '../../lib/persist';

const STORAGE_KEY = 'gcs-profile';

export const AVATAR_PRESETS = [
  { id: 'avatar-1', url: 'https://api.dicebear.com/9.x/adventurer/png?seed=Rohan' },
  { id: 'avatar-2', url: 'https://api.dicebear.com/9.x/adventurer/png?seed=Ananya' },
  { id: 'avatar-3', url: 'https://api.dicebear.com/9.x/adventurer/png?seed=Vikram' },
  { id: 'avatar-4', url: 'https://api.dicebear.com/9.x/adventurer/png?seed=Priya' },
  { id: 'avatar-5', url: 'https://api.dicebear.com/9.x/adventurer/png?seed=Arjun' },
  { id: 'avatar-6', url: 'https://api.dicebear.com/9.x/adventurer/png?seed=Meera' },
  { id: 'avatar-7', url: 'https://api.dicebear.com/9.x/adventurer/png?seed=Kabir' },
  { id: 'avatar-8', url: 'https://api.dicebear.com/9.x/adventurer/png?seed=Isha' },
] as const;

export type AvatarId = (typeof AVATAR_PRESETS)[number]['id'];

export interface ProfileState {
  name: string;
  email: string;
  phone: string;
  campusId: string;
  avatarId: AvatarId;
}

const initialState: ProfileState = {
  name: 'Student',
  email: '',
  phone: '',
  campusId: '',
  avatarId: 'avatar-1',
};

function persist(state: ProfileState) {
  saveJSON(STORAGE_KEY, state);
}

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    hydrateProfile(_state, action: PayloadAction<Partial<ProfileState>>) {
      const next = { ...initialState, ...action.payload };
      if (!AVATAR_PRESETS.some((a) => a.id === next.avatarId)) next.avatarId = 'avatar-1';
      return next;
    },
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

export const { hydrateProfile, updateProfile, setAvatarId } = profileSlice.actions;

export const selectProfile = (state: { profile: ProfileState }) => state.profile;

export function getAvatarUrl(avatarId: string) {
  return AVATAR_PRESETS.find((a) => a.id === avatarId)?.url ?? AVATAR_PRESETS[0].url;
}

export default profileSlice.reducer;
