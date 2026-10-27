import { useState } from 'react';
import { Eye, EyeOff, RectangleEllipsis } from 'lucide-react';
import TextField from './TextField.jsx';

export default function PasswordField(props) {
  const [visible, setVisible] = useState(false);
  const Toggle = visible ? EyeOff : Eye;
  return (
    <TextField
      icon={RectangleEllipsis}
      type={visible ? 'text' : 'password'}
      trailing={(
        <button
          type="button"
          className="field__toggle"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
        >
          <Toggle size={20} aria-hidden="true" />
        </button>
      )}
      {...props}
    />
  );
}
