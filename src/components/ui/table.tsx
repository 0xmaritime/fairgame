import React from 'react';

interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
}

export const Table: React.FC<TableProps> = ({ className = '', children, ...props }) => {
  return (
    <table className={`w-full border-collapse ${className}`} {...props}>
      {children}
    </table>
  );
};

export const TableHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <thead className="bg-gray-50">{children}</thead>;
};

export const TableBody: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <tbody className="divide-y divide-gray-200">{children}</tbody>;
};

export const TableRow: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <tr className="hover:bg-gray-50">{children}</tr>;
};

export const TableHead: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return (
    <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}>
      {children}
    </th>
  );
};

export const TableCell: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return (
    <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${className}`}>
      {children}
    </td>
  );
}; 