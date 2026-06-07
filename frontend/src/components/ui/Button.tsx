import { clsx } from 'clsx';
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, icon, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={clsx(
          'inline-flex items-center justify-center font-semibold rounded-2xl transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-primary-500/30',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
          'active:scale-[0.97]',
          {
            'bg-primary-600 text-white hover:bg-primary-700 shadow-sm hover:shadow-md': variant === 'primary',
            'bg-zinc-100 text-zinc-900 hover:bg-zinc-200': variant === 'secondary',
            'border-2 border-zinc-200 text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50': variant === 'outline',
            'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100': variant === 'ghost',
            'bg-red-500 text-white hover:bg-red-600 shadow-sm': variant === 'danger',
          },
          {
            'h-9 px-4 text-sm gap-1.5': size === 'sm',
            'h-11 px-5 text-sm gap-2': size === 'md',
            'h-12 px-6 text-base gap-2': size === 'lg',
            'h-14 px-8 text-base gap-2.5': size === 'xl',
          },
          className
        )}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : icon ? (
          icon
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
