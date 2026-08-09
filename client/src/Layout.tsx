import { Outlet } from "react-router-dom"
import Footer from "./components/Footer"
import Header from "./components/Header"
import StickyCampusBatch from "./components/StickyCampusBatch"

const Layout = () => {
  return (
    <div className="min-h-screen bg-bg font-sans text-fg">
      <Header />
      <Outlet />
      <Footer />
      <StickyCampusBatch />
    </div>
  )
}

export default Layout