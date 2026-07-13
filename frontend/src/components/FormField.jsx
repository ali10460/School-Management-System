import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

/**
 * A form field wrapper that displays labels and validation errors with a consistent style.
 */
const FormField = ({ label, error, required, children, className = '', hint }) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {children}
      </div>
      {error && (
        <p className="mt-1 flex items-center gap-1 text-xs text-red-500 dark:text-red-400 animate-fade-in">
          <ExclamationCircleIcon className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="mt-1 text-xs text-surface-400">{hint}</p>
      )}
    </div>
  );
};

export default FormField;
