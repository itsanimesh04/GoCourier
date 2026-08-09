import { campuses, currentUser } from '../../../data/mockData';

function initials(name: string | null): string {
  if (!name) return 'U';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

const ProfileInfo = () => {
  const campus = campuses.find((c) => c.id === currentUser.campus_id);

  return (
    <section className="border border-gray-200 p-4 sm:p-5">
      <div className="mb-5 flex items-center gap-4">
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center bg-primary font-bebas text-2xl text-white sm:h-20 sm:w-20 sm:text-3xl"
          aria-hidden
        >
          {initials(currentUser.name)}
        </div>
        <div className="min-w-0">
          <h2 className="truncate font-bebas text-2xl uppercase text-tertiary sm:text-3xl">
            {currentUser.name}
          </h2>
          <p className="truncate font-sans text-sm text-gray-600">{currentUser.email}</p>
        </div>
      </div>

      <h3 className="mb-3 font-bebas text-xl uppercase text-tertiary">Account</h3>
      <dl className="space-y-3 font-sans text-sm">
        <div>
          <dt className="font-bebas text-xs uppercase text-gray-500">Phone</dt>
          <dd className="text-base text-tertiary">{currentUser.phone}</dd>
        </div>
        <div>
          <dt className="font-bebas text-xs uppercase text-gray-500">Campus</dt>
          <dd className="text-base text-tertiary">
            {campus ? `${campus.name}, ${campus.city}` : '—'}
          </dd>
        </div>
        <div>
          <dt className="font-bebas text-xs uppercase text-gray-500">Role</dt>
          <dd className="text-base capitalize text-tertiary">{currentUser.role}</dd>
        </div>
      </dl>
    </section>
  );
};

export default ProfileInfo;
