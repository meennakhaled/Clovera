import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';
import AuthLayout from '../components/AuthLayout.jsx';
import { LogoMark } from '../components/Logo.jsx';
import TextField from '../components/TextField.jsx';
import PasswordField from '../components/PasswordField.jsx';
import Button from '../components/Button.jsx';
import GoogleIcon from '../components/GoogleIcon.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { ROUTES } from '../config/routes';
import { validateLogin } from '../utils/validation';
import { preloadGoogleScript } from '../services/googleAuth';
import { env } from '../config/env';
import usePageTitle from '../hooks/usePageTitle';

export default function Login() {
  usePageTitle('Login');
  const { login, loginWithGoogle, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(null); // 'email' | 'google' | null

  useEffect(() => {
    if (!env.useMockApi && env.googleClientId) preloadGoogleScript().catch(() => {});
  }, []);

  if (isAuthenticated) return <Navigate to={ROUTES.home} replace />;

  const onChange = (event) => {
    const { name, value } = event.target;
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((e) => ({ ...e, [name]: undefined }));
    setFormError('');
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    const found = validateLogin(values);
    setErrors(found);
    if (Object.keys(found).length) {
      document.getElementById(Object.keys(found)[0])?.focus();
      return;
    }
    setBusy('email');
    setFormError('');
    try {
      await login({ email: values.email.trim(), password: values.password });
      navigate(ROUTES.home, { replace: true });
    } catch (error) {
      setFormError(error.status === 401 ? 'Email or password is incorrect.' : error.message);
      setBusy(null);
    }
  };

  const onGoogle = async () => {
    setBusy('google');
    setFormError('');
    try {
      await loginWithGoogle();
      navigate(ROUTES.home, { replace: true });
    } catch (error) {
      if (error.code === 'GOOGLE_CANCELLED') showToast(error.message);
      else setFormError(error.message);
      setBusy(null);
    }
  };

  return (
    <AuthLayout imageSide="left">
      <LogoMark />
      <h1 className="auth__title">
        Hello There,<br />Welcome to <span className="auth__brand">Clovera</span>
      </h1>

      {location.state?.notice && <p className="form-notice" role="status">{location.state.notice}</p>}

      <form className="auth__form" onSubmit={onSubmit} noValidate>
        <TextField
          id="email" name="email" label="Email" type="email" icon={Mail}
          placeholder="you@example.com" autoComplete="email" inputMode="email"
          value={values.email} onChange={onChange} error={errors.email}
        />
        <PasswordField
          id="password" name="password" label="Password" placeholder="Enter your password"
          autoComplete="current-password" value={values.password} onChange={onChange} error={errors.password}
        />
        <div className="auth__forgot">
          <button type="button" className="link-button" onClick={() => showToast('Password reset needs the backend. It will be available once the API is connected.')}>
            Forgot password?
          </button>
        </div>

        {formError && <p className="form-alert" role="alert">{formError}</p>}

        <Button type="submit" block loading={busy === 'email'} disabled={busy === 'google'}>Sign in</Button>
        <Button type="button" variant="outline" block loading={busy === 'google'} disabled={busy === 'email'} onClick={onGoogle}>
          <GoogleIcon /> Sign in with Google
        </Button>
      </form>

      <p className="auth__switch">
        Don&apos;t have an account? <Link to={ROUTES.signup}>Sign up</Link>
      </p>
    </AuthLayout>
  );
}
