import { clsx } from 'clsx';
import { SelectHTMLAttributes, forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, id, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-zinc-700">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={id}
            className={clsx(
              'w-full h-12 pl-4 pr-10 rounded-2xl border-2 bg-white text-zinc-900',
              'transition-all duration-200 appearance-none cursor-pointer',
              'hover:border-zinc-300',
              'focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 focus:outline-none',
              error
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10'
                : 'border-zinc-200',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
        </div>
        {error && (
          <p className="text-sm text-red-500 animate-in">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
