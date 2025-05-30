import React from 'react';
import Link from 'next/link';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gray-800 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Fair Price Admin</h1>
          <nav>
            <ul className="flex space-x-4">
              <li>
                <Link href="/admin" className="hover:text-gray-300">Dashboard</Link>
              </li>
              <li>
                <Link href="/admin/reviews/new" className="hover:text-gray-300">New Review</Link>
              </li>
              <li>
                <Link href="/" className="hover:text-gray-300">View Site</Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      <main className="container mx-auto p-8">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
