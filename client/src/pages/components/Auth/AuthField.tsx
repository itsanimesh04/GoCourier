interface AuthFieldProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
}

const AuthField = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  autoComplete,
  required = true,
}: AuthFieldProps) => {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-1.5 block font-bebas text-sm uppercase tracking-wide text-gray-500">
        {label}
      </span>
      <input
        id={id}
        type={type}
        value={value}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 px-3 py-3 font-sans text-base text-tertiary outline-none transition-colors placeholder:text-gray-400 focus:border-primary"
      />
    </label>
  );
};

export default AuthField;
