declare module '@/components/ui/button' {
  import { ButtonHTMLAttributes } from 'react';

  export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'outline' | 'destructive';
    children: React.ReactNode;
  }

  export const Button: React.FC<ButtonProps>;
}

declare module '@/components/ui/input' {
  import { InputHTMLAttributes } from 'react';

  export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

  export const Input: React.FC<InputProps>;
}

declare module '@/components/ui/badge' {
  export interface BadgeProps {
    variant?: 'default' | 'success' | 'secondary';
    children: React.ReactNode;
    className?: string;
  }

  export const Badge: React.FC<BadgeProps>;
}

declare module '@/components/ui/table' {
  import { TableHTMLAttributes } from 'react';

  export interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
    children: React.ReactNode;
  }

  export const Table: React.FC<TableProps>;
  export const TableHeader: React.FC<{ children: React.ReactNode }>;
  export const TableBody: React.FC<{ children: React.ReactNode }>;
  export const TableRow: React.FC<{ children: React.ReactNode }>;
  export const TableHead: React.FC<{ children: React.ReactNode; className?: string }>;
  export const TableCell: React.FC<{ children: React.ReactNode; className?: string }>;
}

declare module '@/components/ui/select' {
  import { SelectHTMLAttributes } from 'react';

  export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    children: React.ReactNode;
  }

  export const Select: React.FC<SelectProps>;
  export const SelectTrigger: React.FC<{ children: React.ReactNode; className?: string }>;
  export const SelectValue: React.FC<{ placeholder?: string }>;
  export const SelectContent: React.FC<{ children: React.ReactNode }>;
  export const SelectItem: React.FC<{ value: string; children: React.ReactNode }>;
} 