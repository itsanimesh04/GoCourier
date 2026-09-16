import { Outlet } from "react-router-dom"
import FixedBottomRightStack from "./components/FixedBottomRightStack"
import Footer from "./components/Footer"
import Header from "./components/Header"

const Layout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-bg font-sans text-fg">
      <Header />
      <main className="flex-1 w-full min-h-[calc(100vh-140px)]">
        <Outlet />
      </main>
      <Footer />
      <FixedBottomRightStack />
    </div>
  )
}

export default Layout