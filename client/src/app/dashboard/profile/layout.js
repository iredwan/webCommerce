'use client';
import PrivateRoute from '@/components/PrivateRoute';
import { SidebarProvider } from '@/context/SidebarContext';
import Sidebar from '@/components/Sidebar';

export default function AdminLayout({ children }) {
  return (
    <PrivateRoute
      allowedRoles={[
        'admin',
        'manager',
        'seller',
        'customer',
      ]}
      requireAuth={true}
    >
      <SidebarProvider>
        <div className="min-h-screen bg-white dark:bg-gray-900 flex">
          <Sidebar />
          <main className="flex-1 p-4 sm:p-6 md:p-8 transition-all duration-300 dark:bg-gray-900">
            {children}
          </main>
        </div>
      </SidebarProvider>
    </PrivateRoute>
  );
}
