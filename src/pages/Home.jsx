import { MessageCircle, ShoppingBag, Sparkles, Sprout } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import Button from '../components/Button.jsx';
import cloverHero from '../assets/images/clover-hero.jpg';
import { FEATURE_SHORTCUTS, PRIMARY_CTA } from '../config/navigation';
import { HERO_SHAPE } from '../config/heroShape';
import usePlaceholderFeature from '../hooks/usePlaceholderFeature';
import usePageTitle from '../hooks/usePageTitle';

const SHORTCUT_ICONS = {
  shop: ShoppingBag,
  chatbot: MessageCircle,
  finder: Sprout,
  personality: Sparkles,
};

export default function Home() {
  usePageTitle('Grow Your World');
  const showComingSoon = usePlaceholderFeature();

  return (
    <>
      <Navbar />
      <main id="main" className="hero">

        <div className="hero__content">
          <h1 className="hero__title">
            Grow Your <span className="hero__highlight">World</span> with Clovera
          </h1>
          <p className="hero__text">
            Discover the perfect plants for your lifestyle, learn how to care for them,
            explore their benefits, and build a greener space that feels uniquely yours.
          </p>

          <div className="shortcuts">
            <ul className="shortcuts__list">
              {FEATURE_SHORTCUTS.map(({ id, label }) => {
                const Icon = SHORTCUT_ICONS[id];
                return (
                  <li key={id}>
                    <button type="button" className="shortcut" onClick={() => showComingSoon(id)}>
                      <span className="shortcut__circle"><Icon size={24} strokeWidth={1.5} aria-hidden="true" /></span>
                      <span className="shortcut__label">{label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <Button variant="outline" className="shortcuts__cta" onClick={() => showComingSoon(PRIMARY_CTA.id)}>
              {PRIMARY_CTA.label}
            </Button>
          </div>
        </div>

        <div className="hero__media">
          <svg
            viewBox={`0 0 ${HERO_SHAPE.width} ${HERO_SHAPE.height}`}
            preserveAspectRatio="xMaxYMin meet"
            role="img"
            aria-label="Dew-covered clover leaves with one bright three-leaf clover in the centre"
          >
            <defs>
              <clipPath id="hero-blob">
                <path d={HERO_SHAPE.path} />
              </clipPath>
            </defs>
            <image
              href={cloverHero}
              x="0"
              y="0"
              width={HERO_SHAPE.width}
              height={HERO_SHAPE.height}
              preserveAspectRatio="xMidYMid slice"
              clipPath="url(#hero-blob)"
            />
          </svg>
        </div>
      </main>
    </>
  );
}
