import { Link } from 'react-router-dom';
import logoIcon from '../assets/images/clovera-logo-icon.svg';
import { ROUTES } from '../config/routes';

export function LogoMark({ size = 49 }) {
  return (
    <Link to={ROUTES.home} className="logo-mark" aria-label="Clovera home">
      <img src={logoIcon} width={size} height={size} alt="" />
    </Link>
  );
}

export default function Logo() {
  return (
    <Link to={ROUTES.home} className="logo" aria-label="Clovera home">
      <img src={logoIcon} width="49" height="49" alt="" />
      <span>Clovera</span>
    </Link>
  );
}
