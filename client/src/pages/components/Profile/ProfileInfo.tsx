import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store';
import { selectCampuses } from '../../../store/slices/catalogSlice';
import { setUserCampus } from '../../../store/slices/authSlice';
import {
  AVATAR_PRESETS,
  getAvatarUrl,
  selectProfile,
  setAvatarId,
  updateProfile,
  type AvatarId,
} from '../../../store/slices/profileSlice';
import { setSelectedCampusId } from '../../../store/slices/uiSlice';
import { cn } from '../../../utils/utils';

const ProfileInfo = () => {
  const profile = useAppSelector(selectProfile);
  const campuses = useAppSelector(selectCampuses);
  const dispatch = useAppDispatch();
  const [editing, setEditing] = useState(false);
  const [pickingAvatar, setPickingAvatar] = useState(false);
  const [draft, setDraft] = useState(profile);

  const campus = campuses.find((c) => c.id === profile.campusId);
  const startEdit = () => {
    setDraft(profile);
    setEditing(true);
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(
      updateProfile({
        name: draft.name.trim(),
        email: draft.email.trim(),
        phone: draft.phone.trim(),
        campusId: draft.campusId,
      })
    );
    dispatch(setSelectedCampusId(draft.campusId));
    if (draft.campusId) void dispatch(setUserCampus(draft.campusId));
    setEditing(false);
  };

  const fieldClass =
    'mt-1 w-full rounded-xl border border-border bg-surface-2 px-3 py-2 font-sans text-sm text-fg outline-none focus:border-primary';

  return (
    <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
      <div className="mb-5 flex items-start gap-4">
        <button
          type="button"
          onClick={() => setPickingAvatar((v) => !v)}
          className="group relative shrink-0"
          aria-label="Change avatar"
        >
          <img
            src={getAvatarUrl(profile.avatarId)}
            alt=""
            className="h-20 w-20 rounded-2xl border border-border bg-surface-2 object-cover sm:h-24 sm:w-24"
          />
          <span className="absolute inset-x-0 bottom-0 rounded-b-2xl bg-bg/70 py-0.5 text-center font-sans text-[10px] text-fg opacity-0 transition-opacity group-hover:opacity-100">
            Change
          </span>
        </button>
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-display text-xl font-bold uppercase text-fg sm:text-2xl">
            {profile.name}
          </h2>
          <p className="truncate font-sans text-sm text-muted">{profile.email}</p>
          {campus && (
            <span className="mt-2 inline-block rounded-lg bg-primary/15 px-2 py-0.5 font-sans text-xs font-medium text-primary">
              {campus.name}
            </span>
          )}
          {!editing && (
            <button
              type="button"
              onClick={startEdit}
              className="mt-3 block font-sans text-sm font-semibold text-primary hover:opacity-80"
            >
              Edit information
            </button>
          )}
        </div>
      </div>

      {pickingAvatar && (
        <div className="mb-5 rounded-xl border border-border bg-surface-2 p-3">
          <p className="mb-2 font-sans text-xs uppercase text-muted">Choose avatar</p>
          <div className="grid grid-cols-4 gap-2">
            {AVATAR_PRESETS.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => {
                  dispatch(setAvatarId(a.id as AvatarId));
                  setPickingAvatar(false);
                }}
                className={cn(
                  'overflow-hidden rounded-xl border-2 transition-colors',
                  profile.avatarId === a.id
                    ? 'border-primary'
                    : 'border-transparent hover:border-border'
                )}
              >
                <img src={a.url} alt="" className="aspect-square w-full bg-surface object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {editing ? (
        <form onSubmit={save} className="space-y-3">
          <h3 className="font-display text-lg font-semibold uppercase text-fg">
            Edit account
          </h3>
          <label className="block">
            <span className="font-sans text-xs uppercase text-muted">Name</span>
            <input
              type="text"
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              className={fieldClass}
              required
            />
          </label>
          <label className="block">
            <span className="font-sans text-xs uppercase text-muted">Email</span>
            <input
              type="email"
              value={draft.email}
              onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
              className={fieldClass}
              required
            />
          </label>
          <label className="block">
            <span className="font-sans text-xs uppercase text-muted">Phone</span>
            <input
              type="tel"
              value={draft.phone}
              onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
              className={fieldClass}
              required
            />
          </label>
          <label className="block">
            <span className="font-sans text-xs uppercase text-muted">Campus</span>
            <select
              value={draft.campusId}
              onChange={(e) => setDraft((d) => ({ ...d, campusId: e.target.value }))}
              className={fieldClass}
            >
              {campuses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.city}
                </option>
              ))}
            </select>
          </label>
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              className="flex-1 rounded-xl bg-primary py-2 font-sans text-sm font-semibold text-on-primary hover:opacity-90"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-xl border border-border px-4 py-2 font-sans text-sm text-muted hover:text-fg"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <h3 className="mb-3 font-display text-lg font-semibold uppercase text-fg">
            Account
          </h3>
          <dl className="space-y-3 font-sans text-sm">
            <div>
              <dt className="text-xs uppercase text-muted">Phone</dt>
              <dd className="text-fg">{profile.phone}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-muted">Campus</dt>
              <dd className="text-fg">
                {campus ? `${campus.name}, ${campus.city}` : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-muted">Role</dt>
              <dd className="capitalize text-fg">Student</dd>
            </div>
          </dl>
        </>
      )}
    </section>
  );
};

export default ProfileInfo;
