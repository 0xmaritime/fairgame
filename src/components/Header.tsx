import Link from 'next/link';
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-gray-900">
          Fair Game Price Index
        </Link>
        <nav className="hidden md:block">
          <ul className="flex space-x-4">
            <li>
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                Home
              </Link>
            </li>
            <li>
              <Link href="/reviews" className="text-gray-600 hover:text-gray-900">
                All Reviews
              </Link>
            </li>
            {/* About link can be added here later */}
          </ul>
        </nav>
        {/* Mobile menu button can be added here later */}
      </div>
    </header>
  );
};

export default Header;
