"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ThemeApplier from "@/components/ThemeApplier";

export default function AppWrapper({ children }) {
  const [isThemeReady, setIsThemeReady] = useState(false);

  return (
    <>
      {!isThemeReady && (
        <div className="fixed inset-0 flex items-center justify-center bg-white z-[9999]">
          <div className="text-xl font-semibold text-gray-600 animate-pulse">
            Loading Web Store...
          </div>
        </div>
      )}

      <ThemeApplier onReady={() => setIsThemeReady(true)} />

      {isThemeReady && (
        <>
          <Navbar />
          {children}
          <Footer />
        </>
      )}
    </>
  );
}
