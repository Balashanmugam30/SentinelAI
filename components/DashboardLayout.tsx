'use client';

import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-sentinel-bg">
      <Navbar />
      <Sidebar />
      <main className="pt-16 lg:pl-64 overflow-y-auto">
        <div className="p-4 sm:p-6 pb-20 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
