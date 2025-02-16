import React from 'react';
import { NavLink } from 'react-router-dom';
import { BarChart, Users, Shield, Battery as Category, Settings, Globe, DollarSign, Lock, FileText } from 'lucide-react';

interface AdminSidebarProps {
  showMobileMenu: boolean;
}

const menuItems = [
  { icon: BarChart, label: 'Dashboard', path: '/admin' },
  { icon: Users, label: 'Users', path: '/admin/users' },
  { icon: Shield, label: 'Content', path: '/admin/content' },
  { icon: Category, label: 'Categories', path: '/admin/categories' },
  { icon: FileText, label: 'Pages', path: '/admin/pages' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
  { icon: Globe, label: 'SEO', path: '/admin/seo' },
  { icon: DollarSign, label: 'Ads', path: '/admin/ads' },
  { icon: Lock, label: 'OAuth', path: '/admin/oauth' }
];

export function AdminSidebar({ showMobileMenu }: AdminSidebarProps) {
  return (
    <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#1a1b2e]/95 backdrop-blur-lg border-r border-pink-500/20 transform transition-transform duration-300 md:relative md:translate-x-0 ${
      showMobileMenu ? 'translate-x-0' : '-translate-x-full'
    }`}>
      <div className="h-full overflow-y-auto pt-20 md:pt-4">
        <div className="sticky top-4 p-4">
          <h2 className="text-xl font-bold text-white mb-6 px-4">Admin Panel</h2>
          <nav className="space-y-2">
            {menuItems.map(({ icon: Icon, label, path }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) => `
                  flex items-center px-4 py-3 rounded-lg transition-colors
                  ${isActive 
                    ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white' 
                    : 'text-gray-400 hover:bg-[#1a1b2e] hover:text-white'}
                `}
              >
                <Icon size={20} className="mr-3" />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </aside>
  );
}