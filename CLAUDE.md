# Captain Dad Games website

Static site for captaindad.games (Vercel, deploys from `main`). No build step: edit the HTML, CSS and JS directly.

## Rules
- Brand: Captain Dad design system (navy #0b2a5b, sky #33c3ff, gold #ffc90a, red #ff4d4d, cream #fff3e0; Baloo 2 ExtraBold headings, Nunito body). Use the logo files in `assets/img/` as supplied.
- Kids first: short, encouraging copy; big touch targets (44px+); no ads, no tracking, no sign-ups.
- The home hero is live Three.js (`assets/js/island.js`). It must never cover the text: `layout()` fits the island into the space right of `.hero-copy`. Keep the still `hero.jpg` / `hero_mobile.jpg` fallbacks in step with the 3D scene.
- Star hunt: 5 `.hidden-star` buttons site-wide (ids in `site.js` STARS). Progress is saved in localStorage key `captainDadGames_v1` only.
- The contact email is assembled in `site.js` on click; never put the address in the HTML.
- Test changes in a headless browser at phone (390), tablet (820) and desktop (1280+) widths before pushing.
