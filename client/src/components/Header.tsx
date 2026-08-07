import React, { useState } from "react";
import { FiUser, FiSearch, FiShoppingBag, FiChevronDown } from "react-icons/fi";

export const Header: React.FC = () => {
  const [cartCount, _setCartCount] = useState<number>(0);

  return (
    <header className="w-full bg-primary text-white px-6 py-7 transition-all  font-bebas">
      <div className="mx-auto flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex flex-col justify-center select-none cursor-pointer">
          <span className="text-2xl  tracking-wider  leading-none ">
            GoCourierService
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-6 text-xl  tracking-wide uppercase">
          <a
            href="#restaurants"
            className="hover:opacity-80 transition-opacity"
          >
            Restaurants
          </a>

          {/* Dropdown Menu Item 1 */}
          <div className="relative group cursor-pointer flex items-center gap-1 hover:opacity-80 transition-opacity">
            <span>Cuisines</span>
            <FiChevronDown className="w-4 h-4 stroke-[2.5]" />
          </div>

          {/* Dropdown Menu Item 2 */}
          <div className="relative group cursor-pointer flex items-center gap-1 hover:opacity-80 transition-opacity">
            <span>Meal Deals</span>
            <FiChevronDown className="w-4 h-4 stroke-[2.5]" />
          </div>

          <a href="#fast-food" className="hover:opacity-80 transition-opacity">
            Fast Food
          </a>
        </nav>

        {/* Right Action Icons */}
        <div className="flex items-center space-x-4">
          {/* User Account */}
          <button
            aria-label="Account"
            className="hover:opacity-80 transition-opacity p-1"
          >
            <FiUser className="w-6 h-6 stroke-2" />
          </button>

          {/* Search */}
          <button
            aria-label="Search"
            className="hover:opacity-80 transition-opacity p-1"
          >
            <FiSearch className="w-6 h-6 stroke-2" />
          </button>

          {/* Shopping Cart with Badge */}
          <button
            aria-label="Cart"
            className="relative hover:opacity-80 transition-opacity p-1"
          >
            <FiShoppingBag className="w-6 h-6 stroke-2" />
            <span className="absolute -top-1.5 -right-1.5 bg-white text-[#cc141c] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
