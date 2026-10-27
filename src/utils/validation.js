const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function emailError(email) {
  if (!email.trim()) return 'Enter your email address.';
  if (!EMAIL_RE.test(email.trim())) return 'Enter a valid email, like you@example.com.';
  return '';
}

export function validateLogin({ email, password }) {
  const errors = {};
  const e = emailError(email);
  if (e) errors.email = e;
  if (!password) errors.password = 'Enter your password.';
  return errors;
}

export function validateSignUp({ username, email, password, confirmPassword }) {
  const errors = {};
  const name = username.trim();
  if (!name) errors.username = 'Enter a username.';
  else if (name.length < 3) errors.username = 'Use at least 3 characters.';
  else if (name.length > 30) errors.username = 'Use 30 characters or fewer.';

  const e = emailError(email);
  if (e) errors.email = e;

  if (!password) errors.password = 'Create a password.';
  else if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    errors.password = 'Use at least 8 characters with a letter and a number.';
  }

  if (!confirmPassword) errors.confirmPassword = 'Confirm your password.';
  else if (confirmPassword !== password) errors.confirmPassword = "Passwords don't match.";
  return errors;
}
