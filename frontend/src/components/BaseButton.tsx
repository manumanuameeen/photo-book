export interface ButtonProps {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export const BaseButton: React.FC<ButtonProps> = ({ children, variant = "primary", onClick, loading, size = "md", className = '', disabled }) => {
  let style = '';
  const base = 'px-4 py-2 font-semibold rounded-lg transition-colors duration-200 disabled:opacity-50';

  switch (variant) {
    case 'primary':
      style = 'bg-green-700 text-white hover:bg-green-800 shadow-md';
      break;
    case 'secondary':
      style = 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50';
      break;
    case 'danger':
      style = 'bg-red-600 text-white hover:bg-red-700';
      break;
  }

  const sizeStyle = size === 'lg' ? 'text-lg px-6 py-3' : size === 'sm' ? 'text-sm px-3 py-1' : 'text-base';

  return (
    <button className={`${base} ${style} ${sizeStyle} flex items-center justify-center ${className}`} onClick={onClick} disabled={disabled || loading}>
      {loading ? 'Loading...' : children}
    </button>
  );
};