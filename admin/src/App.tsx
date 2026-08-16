import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Layout from "./Layout";
import AuthLayout from "./AuthLayout";
import Login from "./pages/Login";
import Users from "./pages/users/Users";
import Campuses from "./pages/Campuses";
import Restaurants from "./pages/Restaurants";
import MenuItems from "./pages/MenuItems";
import Categories from "./pages/Categories";
import Extras from "./pages/Extras";
import Banners from "./pages/Banners";
import Orders from "./pages/Orders";
import Payments from "./pages/Payments";
import Revenue from "./pages/Revenue";
import Settings from "./pages/Settings";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />

          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/campuses" element={<Campuses />} />
            <Route path="/restaurants" element={<Restaurants />} />
            <Route path="/menu-items" element={<MenuItems />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/extras" element={<Extras />} />
            <Route path="/banners" element={<Banners />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/users" element={<Users />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/revenue" element={<Revenue />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
