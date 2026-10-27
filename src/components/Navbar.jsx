import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LogOut, Menu, X } from 'lucide-react';
import Logo from './Logo.jsx';
import Button from './Button.jsx';
import { NAV_ITEMS } from '../config/navigation';
import { ROUTES } from '../config/routes';
import { useAuth } from '../context/AuthContext.jsx';
import usePlaceholderFeature from '../hooks/usePlaceholderFeature';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const showComingSoon = usePlaceholderFeature();

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => { if (event.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const firstName = (user?.name || user?.email || '').split(/[\s@]/)[0];

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <Logo />
        <button
          type="button"
          className="navbar__toggle"
          aria-expanded={open}
          aria-controls="site-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
        </button>

        <div id="site-menu" className={`navbar__panel${open ? ' is-open' : ''}`}>
          <nav aria-label="Main">
            <ul className="nav-list">
              {NAV_ITEMS.map((item) => (
                <li key={item.id}>
                  {item.to ? (
                    <NavLink to={item.to} end className={({ isActive }) => `nav-link${isActive ? ' is-active' : ''}`} onClick={() => setOpen(false)}>
                      {item.label}
                    </NavLink>
                  ) : (
                    <button type="button" className="nav-link" onClick={() => { setOpen(false); showComingSoon(item.id); }}>
                      {item.label}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <div className="navbar__actions">
            {isAuthenticated ? (
              <>
                <span className="navbar__user">Hi, {firstName}</span>
                <Button variant="outline" onClick={() => { setOpen(false); logout(); }}>
                  <LogOut size={16} aria-hidden="true" /> Log out
                </Button>
              </>
            ) : (
              <>
                <Button to={ROUTES.login} variant="primary">Login</Button>
                <Button to={ROUTES.signup} variant="outline">Signup</Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
