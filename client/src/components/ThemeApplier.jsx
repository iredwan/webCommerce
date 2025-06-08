"use client";
import { useEffect } from "react";
import { useGetWebColorsQuery } from "@/features/webColor/webColorApiSlice";

export default function ThemeApplier() {
  const { data: response, isSuccess } = useGetWebColorsQuery();

  useEffect(() => {
    
    // If API call is successful and we have data, update the colors
    if (isSuccess && response && response.status && response.data) {
      const theme = response.data;
      if (theme) {
        document.documentElement.style.setProperty('--color-primary', theme.primaryColor);
        document.documentElement.style.setProperty('--color-secondary', theme.secondaryColor);
        document.documentElement.style.setProperty('--color-accent', theme.accentColor);
        document.documentElement.style.setProperty('--color-background', theme.backgroundColor);
        document.documentElement.style.setProperty('--color-text', theme.textColor);
        
      }
    }
  }, [response, isSuccess]);

  return null;
}