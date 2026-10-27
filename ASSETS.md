# Clovera: Asset inventory

## Files you need to replace or supply

| Asset name | Type | File location | Used in | Status |
|---|---|---|---|---|
| `clover-hero.jpg` | Photo (hero and auth background) | `src/assets/images/clover-hero.jpg` | Home hero image, Login left panel, Sign Up right panel (and mobile banners) | **Placeholder.** Generated illustration, not your Figma photo. Replace it. |
| `clovera-logo-icon.svg` | Logo icon (sprout) | `src/assets/images/clovera-logo-icon.svg` | Navbar logo, Login and Sign Up logo mark | Redrawn approximation of the Figma sprout. Replace with your exported logo if it differs. |
| `favicon.svg` | Favicon | `public/favicon.svg` | Browser tab | Same sprout drawing. Replace together with the logo. |

## Assets that need no file

| Asset | Type | Where it comes from | Used in |
|---|---|---|---|
| "Clovera" wordmark | Text | Plain text next to the logo icon (Poppins 500), `src/components/Logo.jsx` | Navbar |
| Google "G" | Inline SVG | `src/components/GoogleIcon.jsx` (drawn in sage green to match Figma) | Login |
| UI icons (bag, chat, sprout, sparkles, mail, user, password, eye, menu, close, log out) | Icon library | `lucide-react` npm package | Navbar, Home shortcuts, forms |
| Poppins font | Font | `@fontsource/poppins` npm package, installed by `npm install` | All screens |

## Original sources

- `clover-hero.jpg`: the original is in your Figma file (the clover photo). I could not extract it from the screenshots, so the project ships with a generated placeholder (drawn with Python, no third-party image). The Figma photo's own license is yours to confirm.
- `clovera-logo-icon.svg` and `favicon.svg`: drawn from the screenshots; no external source.

## How to replace an asset (no code changes)

1. In Figma, select the photo and export it as **JPG** (2x). For the logo, export the sprout as **SVG**.
2. Name the file exactly as in the table above.
3. Copy it into the folder shown in "File location", overwriting the existing file.
4. Restart `npm run dev` (or run `npm run build` again).

Recommended `clover-hero.jpg`: portrait, at least 1600 × 2000 px, under 400 KB. It is cropped with `object-fit: cover`, so keep the bright clover near the centre. The Home page cuts it with a curved edge defined in `src/pages/Home.jsx` (`#hero-blob`).

If you want a different filename, change the import in `src/pages/Home.jsx` and in `src/components/AuthLayout.jsx`.
