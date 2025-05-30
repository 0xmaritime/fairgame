import Link from 'next/link';

export default function Navigation() {
  return (
    <nav className="bg-gray-800 text-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-4">
            <Link href="/" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
              Home
            </Link>
            <Link href="/reviews" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
              Reviews
            </Link>
          </div>
          <div className="flex items-center">
            <Link href="/admin" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
