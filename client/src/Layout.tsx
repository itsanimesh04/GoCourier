import { Outlet } from "react-router-dom"
import FixedBottomRightStack from "./components/FixedBottomRightStack"
import Footer from "./components/Footer"
import Header from "./components/Header"

const Layout = () => {
  return (
    <div className="min-h-screen bg-bg font-sans text-fg">
      <Header />
      <Outlet />
      <Footer />
      <FixedBottomRightStack />
    </div>
  )
}

export default Layout