import { BrowserRouter, Routes, Route } from 'react-router-dom'
import CatalogThemeSync from './components/CatalogThemeSync'
import { AppBootstrap, RequireAuth } from './components/AppBootstrap'
import { AddonCustomizeProvider } from './components/AddonCustomizeSheet'
import Home from './pages/Home'
import Layout from './Layout'
import ProductPage from './pages/ProductPage'
import CartPage from './pages/CartPage'
import ResturantPage from './pages/ResturantPage'
import ProfilePage from './pages/ProfilePage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import CheckoutPage from './pages/CheckoutPage'
import CustomRequestPage from './pages/CustomRequestPage'
import ExtrasListingPage from './pages/ExtrasListingPage'
import FoodListingPage from './pages/FoodListingPage'
import ParcelRequestPage from './pages/ParcelRequestPage'

const App = () => {
  return (
    <AppBootstrap>
      <AddonCustomizeProvider>
        <BrowserRouter>
          <CatalogThemeSync />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="food" element={<FoodListingPage />} />
              <Route path="food/restaurants/:id" element={<ResturantPage />} />
              <Route path="food/foods/:id" element={<ProductPage />} />
              <Route path="extras" element={<ExtrasListingPage />} />
              <Route element={<RequireAuth />}>
                <Route path="extras/custom-request" element={<CustomRequestPage />} />
                <Route path="extras/parcel" element={<ParcelRequestPage />} />
                <Route path="cart" element={<CartPage />} />
                <Route path="checkout" element={<CheckoutPage />} />
                <Route path="profile" element={<ProfilePage />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AddonCustomizeProvider>
    </AppBootstrap>
  )
}

export default App
