import { Link } from 'react-router-dom';

// variant: 'primary' (filled dark green) | 'outline'
export default function Button({
  variant = 'primary', to, loading = false, block = false, disabled = false, className = '', children, ...rest
}) {
  const classes = ['btn', `btn--${variant}`, block && 'btn--block', className].filter(Boolean).join(' ');
  if (to) {
    return <Link to={to} className={classes} {...rest}>{children}</Link>;
  }
  return (
    <button className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {loading && <span className="spinner" aria-hidden="true" />}
      {children}
    </button>
  );
}
