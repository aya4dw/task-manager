import { clsx } from 'clsx';

interface BadgeProps {
  label: string;
  variant?: 'default' | 'priority-low' | 'priority-medium' | 'priority-high' | 'priority-urgent';
  className?: string;
}

export function Badge({ label, variant = 'default', className }: BadgeProps) {
  const variantClasses = {
    'default': 'bg-gray-100 text-gray-800',
    'priority-low': 'bg-green-100 text-green-800',
    'priority-medium': 'bg-yellow-100 text-yellow-800',
    'priority-high': 'bg-orange-100 text-orange-800',
    'priority-urgent': 'bg-red-100 text-red-800',
  };

  return (
    <span 
      className={clsx(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
        variantClasses[variant],
        className
      )}
    >
      {label}
    </span>
  );
}
