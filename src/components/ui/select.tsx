import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({ className = '', children, ...props }) => {
  return (
    <select
      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      {...props}
    >
      {children}
    </select>
  );
};

export const SelectTrigger: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`relative ${className}`}>
      {children}
    </div>
  );
};

export const SelectValue: React.FC<{ placeholder?: string }> = ({ placeholder }) => {
  return <span>{placeholder}</span>;
};

export const SelectContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">{children}</div>;
};

export const SelectItem: React.FC<{ value: string; children: React.ReactNode }> = ({
  value,
  children,
}) => {
  return (
    <option value={value} className="px-3 py-2 hover:bg-gray-100">
      {children}
    </option>
  );
}; 