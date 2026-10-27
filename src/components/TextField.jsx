export default function TextField({ id, label, icon: Icon, error, trailing, ...inputProps }) {
  const errorId = `${id}-error`;
  return (
    <div className="field">
      <label htmlFor={id} className="field__label">{label}</label>
      <div className={`field__control${error ? ' has-error' : ''}`}>
        {Icon && <Icon className="field__icon" size={20} aria-hidden="true" />}
        <input
          id={id}
          className="field__input"
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errorId : undefined}
          {...inputProps}
        />
        {trailing}
      </div>
      {error && <p id={errorId} className="field__error">{error}</p>}
    </div>
  );
}
