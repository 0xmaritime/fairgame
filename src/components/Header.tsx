import Link from 'next/link';
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-gray-900">
          Fair Game Price Index
        </Link>
        <nav className="flex items-center space-x-6">
          <Link href="/" className="text-gray-600 hover:text-gray-900">
            Home
          </Link>
          <Link href="/reviews" className="text-gray-600 hover:text-gray-900">
            All Reviews
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
