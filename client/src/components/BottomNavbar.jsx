import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaRegUser } from "react-icons/fa";
import { FaOpencart } from "react-icons/fa6";
import { CiDeliveryTruck } from "react-icons/ci";
import { motion } from "framer-motion";
import { BsShopWindow } from "react-icons/bs";
import { AiOutlineProduct } from "react-icons/ai";

const navItems = [
  { href: "/", label: "Shop", icon: <BsShopWindow />},
  { href: "/products", label: "Products", icon: <AiOutlineProduct /> },
  { href: "/track-order", label: "Track", icon: <CiDeliveryTruck /> },
  { href: "/cart", label: "Cart", icon: <FaOpencart /> },
  { href: "/profile", label: "Profile", icon: <FaRegUser /> },
];

const BottomNavbar = () => {
  const currentPath = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background border-t border-text rounded-t-lg">
      <ul className="flex justify-between items-center px-2 py-1">
        {navItems.map((item) => {
          const isActive = currentPath === item.href;
          return (
            <li key={item.href} className="flex-1">
              <Link href={item.href} className="flex flex-col items-center justify-center group py-1">
              <motion.div
                animate={isActive ? { scale: 1.2 } : { scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className={`text-xl mb-0.5 transition-colors duration-300 ${isActive ? "text-primary" : "text-text group-hover:text-primary"}`}
                >
                {item.icon}
                </motion.div>
                <span className={`text-xs font-medium transition-colors duration-300 ${isActive ? "text-primary" : "text-text group-hover:text-primary"}`}>
                  {item.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="bottom-navbar-underline"
                    className="h-1 w-1.5 rounded-full bg-primary mt-0.5"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                  />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default BottomNavbar; 