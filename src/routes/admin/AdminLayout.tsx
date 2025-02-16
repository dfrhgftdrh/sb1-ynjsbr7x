import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminHeader } from './components/AdminHeader';
import { AdminSidebar } from './components/AdminSidebar';
import { AdminGuard } from './components/AdminGuard';
import { Toaster } from 'react-hot-toast';

export function AdminLayout() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-b from-[#1a1b2e] to-[#16172b]">
        <Toaster position="top-right" />
        <AdminHeader onMenuClick={() => setShowMobileMenu(!showMobileMenu)} />
        
        <div className="flex pt-16">
          <AdminSidebar showMobileMenu={showMobileMenu} />
          
          <main className="flex-1 p-8 md:ml-64">
            <Outlet />
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}