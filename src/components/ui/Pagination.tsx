import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
}

export default function Pagination({ currentPage, totalPages, basePath }: PaginationProps) {
  const prevPage = currentPage > 1 ? currentPage - 1 : null;
  const nextPage = currentPage < totalPages ? currentPage + 1 : null;

  return (
    <div className="flex items-center justify-center gap-4">
      {prevPage && (
        <Link
          href={`${basePath}&page=${prevPage}`}
          className="flex items-center gap-1 px-4 py-2 border rounded-md hover:bg-gray-100"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Link>
      )}
      
      <span className="px-4 py-2">
        Page {currentPage} of {totalPages}
      </span>

      {nextPage && (
        <Link
          href={`${basePath}&page=${nextPage}`}
          className="flex items-center gap-1 px-4 py-2 border rounded-md hover:bg-gray-100"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}
