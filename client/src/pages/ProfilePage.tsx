import OrdersSection from './components/Profile/OrdersSection';
import ProfileInfo from './components/Profile/ProfileInfo';
import WishlistSection from './components/Profile/WishlistSection';

const ProfilePage = () => {
  return (
    <div className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:py-10 md:px-10">
      <h1 className="mb-6 font-display text-2xl font-bold uppercase tracking-wide text-fg sm:text-3xl">
        Profile
      </h1>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6">
          <ProfileInfo />
          <WishlistSection />
        </div>
        <div className="lg:col-span-2">
          <OrdersSection />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
