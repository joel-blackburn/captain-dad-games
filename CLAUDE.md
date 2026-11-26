# Captain Dad Games website

Static site for captaindad.games (Vercel, deploys from `main`). No build step: edit the HTML, CSS and JS directly.

## Rules
- Brand: Captain Dad design system (navy #0b2a5b, sky #33c3ff, gold #ffc90a, red #ff4d4d, cream #fff3e0; Baloo 2 ExtraBold headings, Nunito body). Use the logo files in `assets/img/` as supplied.
- Kids first: short, encouraging copy; big touch targets (44px+); no ads, no tracking, no sign-ups.
- The home hero is live Three.js (`assets/js/island.js`). It must never cover the text: `layout()` fits the island into the space right of `.hero-copy`. Keep the still `hero.jpg` / `hero_mobile.jpg` fallbacks in step with the 3D scene.
- Coin hunt: gold CD coins (`assets/img/coin.png`) are ONLY used for the hunt (hidden coins, Coin hunt chip, Coins found counter, Coin hunt panel, Coin Collector badge); don't use coins as decoration. 5 `.hidden-coin` buttons site-wide (ids in `site.js` COINS; found ids are saved in `stars` for older saves). Progress is saved in localStorage key `captainDadGames_v1` only. The `?` help button (`.tip`) explains the hunt.
- The contact email is assembled in `site.js` on click; never put the address in the HTML.
- Test changes in a headless browser at phone (390), tablet (820) and desktop (1280+) widths before pushing.
- Caching: assets revalidate on every visit (vercel.json), and every `/assets/...` link carries `?v=N`. When you change an image, script or stylesheet, bump N everywhere (HTML and JS) so browsers that cached the old copy get the new one.
