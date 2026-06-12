export default function Input({
  label,
  id,
  error,
  helpText,
  className = '',
  required = false,
  ...props
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-300">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <input
        id={id}
        {...props}
        className={`w-full px-4 py-2.5 rounded-xl bg-white/5 border text-white placeholder-gray-500 text-sm
          transition-all duration-200 outline-none
          focus:bg-white/8 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-white/10'}
        `}
      />
      {error && <p className="text-xs text-red-400 flex items-center gap-1">{error}</p>}
      {helpText && !error && <p className="text-xs text-gray-500">{helpText}</p>}
    </div>
  );
}

export function Select({ label, id, error, helpText, className = '', required = false, children, ...props }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-300">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <select
        id={id}
        {...props}
        className={`w-full px-4 py-2.5 rounded-xl bg-gray-800 border text-white text-sm
          transition-all duration-200 outline-none
          focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-red-500' : 'border-white/10'}
        `}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-400">{error}</p>}
      {helpText && !error && <p className="text-xs text-gray-500">{helpText}</p>}
    </div>
  );
}
