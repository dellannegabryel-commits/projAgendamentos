import { clsx } from 'clsx';
import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, icon, rightIcon, id, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-zinc-700">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={id}
            className={clsx(
              'w-full h-12 px-4 rounded-2xl border-2 bg-white text-zinc-900 placeholder:text-zinc-400',
              'transition-all duration-200',
              'hover:border-zinc-300',
              'focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 focus:outline-none',
              error
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10'
                : 'border-zinc-200',
              icon && 'pl-11',
              rightIcon && 'pr-11',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="text-sm text-red-500 animate-in">{error}</p>
        )}
        {hint && !error && (
          <p className="text-sm text-zinc-400">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
