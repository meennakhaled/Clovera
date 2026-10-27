import cloverHero from '../assets/images/clover-hero.jpg';

// Split screen from the Figma: photo on one side, form on the other.
// `imageSide="left"` for Login, `"right"` for Sign up.
export default function AuthLayout({ imageSide = 'left', children }) {
  return (
    <div className={`auth auth--image-${imageSide}`}>
      <div className="auth__media" aria-hidden="true">
        <img src={cloverHero} alt="" />
      </div>
      <main id="main" className="auth__panel">
        <div className="auth__content">{children}</div>
      </main>
    </div>
  );
}
