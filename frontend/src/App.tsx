import { Navigate, Route, Routes } from 'react-router-dom';
import {
  CampusScreen,
  CartScreen,
  CheckoutScreen,
  EmptyStatesScreen,
  ErrorStatesScreen,
  ExtrasHomeScreen,
  ExtrasCartScreen,
  CustomRequestScreen,
  ParcelRequestScreen,
  RequestStatusScreen,
  QuoteReviewScreen,
  HomeScreen,
  OrderConfirmationScreen,
  OrdersScreen,
  OrderTrackingScreen,
  OnboardingScreen,
  SignupScreen,
  LoginScreen,
  ProfileScreen,
  RestaurantMenuScreen,
  SplashScreen,
  HomePage,
  PaymentLoadingScreen
} from './pages';

export function App() {
  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/splash" element={<SplashScreen />} />
        <Route path="/onboarding" element={<OnboardingScreen />} />
        <Route path="/auth/signup" element={<SignupScreen />} />
        <Route path="/auth/login" element={<LoginScreen />} />
        <Route path="/auth/phone" element={<Navigate to="/auth/login" replace />} />
        <Route path="/auth/otp" element={<Navigate to="/auth/login" replace />} />
        <Route path="/campus" element={<CampusScreen />} />
        <Route path="/food" element={<HomeScreen />} />
        <Route path="/food/restaurants/:id" element={<RestaurantMenuScreen />} />
        <Route path="/extras" element={<ExtrasHomeScreen />} />
        <Route path="/extras/cart" element={<ExtrasCartScreen />} />
        <Route path="/extras/request/new" element={<CustomRequestScreen />} />
        <Route path="/extras/parcel/new" element={<ParcelRequestScreen />} />
        <Route path="/extras/requests/:id" element={<RequestStatusScreen />} />
        <Route path="/extras/requests/:id/quote" element={<QuoteReviewScreen />} />
        <Route path="/home" element={<Navigate to="/food" replace />} />
        <Route path="/restaurants/:id" element={<RestaurantMenuScreen />} />
        <Route path="/cart" element={<CartScreen />} />
        <Route path="/checkout" element={<CheckoutScreen />} />
        <Route path="/orders" element={<OrdersScreen />} />
        <Route path="/profile" element={<ProfileScreen />} />
        <Route path="/payment/loading" element={<PaymentLoadingScreen />} />
        <Route path="/orders/:id/confirmed" element={<OrderConfirmationScreen />} />
        <Route path="/orders/:id/tracking" element={<OrderTrackingScreen />} />
        <Route path="/states/empty" element={<EmptyStatesScreen />} />
        <Route path="/states/errors" element={<ErrorStatesScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
