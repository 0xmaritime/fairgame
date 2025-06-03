import Link from 'next/link';
import React from 'react';

export default function Navigation() {
  return (
    <nav>
      <ul className="flex space-x-4">
        <li>
          <Link href="/">Home</Link>
        </li>
        <li>
          <Link href="/reviews">Reviews</Link>
        </li>
        {/* Add other navigation links as needed */}
      </ul>
    </nav>
  );
}
