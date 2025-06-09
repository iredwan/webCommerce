"use client";

import { useEffect, useState } from "react";
import { useGetWebColorsQuery } from "@/features/webColor/webColorApiSlice";

export default function ThemeApplier({ onReady }) {
  const { data: response, isSuccess } = useGetWebColorsQuery();
  const [applied, setApplied] = useState(false);

  const applyTheme = (theme) => {
    if (!theme) return;

    document.documentElement.style.setProperty('--color-primary', theme.primaryColor);
    document.documentElement.style.setProperty('--color-secondary', theme.secondaryColor);
    document.documentElement.style.setProperty('--color-accent', theme.accentColor);
    document.documentElement.style.setProperty('--color-background', theme.backgroundColor);
    document.documentElement.style.setProperty('--color-text', theme.textColor);

    setApplied(true);
    onReady?.();
  };

  // Apply theme from localStorage first (fallback)
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme) {
      applyTheme(JSON.parse(storedTheme));
    }
  }, []);

  // Then update theme from API if available
  useEffect(() => {
    if (isSuccess && response?.status && response?.data) {
      applyTheme(response.data);
      localStorage.setItem("theme", JSON.stringify(response.data));
    }
  }, [isSuccess, response]);

  return null;
}
