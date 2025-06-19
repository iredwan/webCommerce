'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function TopProgressBar() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!pathname) return;

    setLoading(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => (prev < 90 ? prev + Math.random() * 5 : prev));
    }, 200);

    // Simulate loading finish shortly after pathname changes
    const timeout = setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 300);
    }, 100);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [pathname]);

  return loading ? (
    <div className="fixed top-0 left-0 right-0 z-[1600] h-[3px] bg-transparent">
      <div
        className="h-full bg-primary origin-left transition-all duration-100 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  ) : null;
}
