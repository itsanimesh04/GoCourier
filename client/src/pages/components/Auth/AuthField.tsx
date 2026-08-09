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
      <span className="mb-1.5 block font-sans text-sm uppercase tracking-wide text-muted">
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
        className="w-full rounded-xl border border-border bg-surface px-3 py-3 font-sans text-base text-fg outline-none transition-colors placeholder:text-muted focus:border-primary"
      />
    </label>
  );
};

export default AuthField;
