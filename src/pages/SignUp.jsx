import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Mail, User } from 'lucide-react';
import AuthLayout from '../components/AuthLayout.jsx';
import { LogoMark } from '../components/Logo.jsx';
import TextField from '../components/TextField.jsx';
import PasswordField from '../components/PasswordField.jsx';
import Button from '../components/Button.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { ROUTES } from '../config/routes';
import { validateSignUp } from '../utils/validation';
import usePageTitle from '../hooks/usePageTitle';

export default function SignUp() {
  usePageTitle('Sign up');
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  if (isAuthenticated) return <Navigate to={ROUTES.home} replace />;

  const onChange = (event) => {
    const { name, value } = event.target;
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((e) => ({ ...e, [name]: undefined }));
    setFormError('');
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    const found = validateSignUp(values);
    setErrors(found);
    if (Object.keys(found).length) {
      document.getElementById(Object.keys(found)[0])?.focus();
      return;
    }
    setBusy(true);
    setFormError('');
    try {
      const result = await register({
        username: values.username.trim(),
        email: values.email.trim(),
        password: values.password,
        confirmPassword: values.confirmPassword,
      });
      if (result?.user) navigate(ROUTES.home, { replace: true });
      else navigate(ROUTES.login, { replace: true, state: { notice: 'Account created. Log in to continue.' } });
    } catch (error) {
      // ASP.NET Core validation errors arrive as { errors: { Email: ['...'] } }.
      if (error.details && typeof error.details === 'object') {
        const mapped = {};
        Object.entries(error.details).forEach(([key, messages]) => {
          const field = key.charAt(0).toLowerCase() + key.slice(1);
          if (field in values) mapped[field] = Array.isArray(messages) ? messages[0] : String(messages);
        });
        if (Object.keys(mapped).length) setErrors(mapped);
      }
      setFormError(error.status === 409 ? 'An account with this email already exists. Try logging in.' : error.message);
      setBusy(false);
    }
  };

  return (
    <AuthLayout imageSide="right">
      <LogoMark />
      <h1 className="auth__title">Create an account</h1>

      <form className="auth__form" onSubmit={onSubmit} noValidate>
        <TextField
          id="username" name="username" label="Username" icon={User}
          placeholder="Your username" autoComplete="username"
          value={values.username} onChange={onChange} error={errors.username}
        />
        <TextField
          id="email" name="email" label="Email" type="email" icon={Mail}
          placeholder="you@example.com" autoComplete="email" inputMode="email"
          value={values.email} onChange={onChange} error={errors.email}
        />
        <PasswordField
          id="password" name="password" label="Password" placeholder="At least 8 characters"
          autoComplete="new-password" value={values.password} onChange={onChange} error={errors.password}
        />
        <PasswordField
          id="confirmPassword" name="confirmPassword" label="Confirm Password" placeholder="Repeat your password"
          autoComplete="new-password" value={values.confirmPassword} onChange={onChange} error={errors.confirmPassword}
        />

        {formError && <p className="form-alert" role="alert">{formError}</p>}

        <Button type="submit" block loading={busy}>Sign up</Button>
      </form>

      <p className="auth__switch">
        Already have an account? <Link to={ROUTES.login}>Login</Link>
      </p>
    </AuthLayout>
  );
}
