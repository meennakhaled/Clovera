import { ROUTES } from './routes';

// Items with a `to` open a real screen.
// Items with `placeholder: true` do NOT have a screen yet: clicking them shows a
// "coming soon" message instead of navigating. When a screen is built, replace
// `placeholder: true` with `to: ROUTES.something` and register the route in App.jsx.
export const NAV_ITEMS = [
  { id: 'home', label: 'Home', to: ROUTES.home },
  { id: 'shop', label: 'Plant Shop', placeholder: true },
  { id: 'chatbot', label: 'Plant Care Chatbot', placeholder: true },
  { id: 'finder', label: 'Find Your Perfect Plant', placeholder: true },
  { id: 'personality', label: 'Plant Personality Test', placeholder: true },
];

// The four round shortcuts under the Home headline.
export const FEATURE_SHORTCUTS = [
  { id: 'shop', label: 'Plant Shop' },
  { id: 'chatbot', label: 'Care Chatbot' },
  { id: 'finder', label: 'Find a Plant' },
  { id: 'personality', label: 'Personality Test' },
];

export const PRIMARY_CTA = { id: 'finder', label: 'Discover Your Plant' };

export const getNavItem = (id) => NAV_ITEMS.find((item) => item.id === id);
