# Sage wedding invitation

A local, static Sinhala–English invitation. All names, dates and the venue are illustrative. No RSVP is sent or stored by this site.

## Preview

Install Node.js, then run `npm run dev`. Open http://127.0.0.1:4173. The finished page has no runtime dependencies. Use an HTTP server rather than opening the HTML directly because the configuration uses JavaScript modules.

## Personalize

Edit `invitation.config.js` for names, date, invitation wording, schedule, venue and WhatsApp number. Keep both date representations consistent. Set `rsvp.number` to an international number with country code, for example the actual recipient’s Sri Lankan number beginning with `94` (omit its local leading zero). Leave it empty for the sample. Valid formatting enables the button; it does not verify that a WhatsApp account exists.

RSVP opens a prefilled WhatsApp message. Guests review and send it themselves. There is no database, automatic submission, or attendance dashboard. Declining hides the party-size field. This demo is explicitly labeled; before using it for a real wedding, update the sample labels in the HTML and video scene as well as the configuration.

## Opening video

The opening screen plays `media/localized-opening.mp4`: the supplied floral opening animation with its embedded wording replaced by the sample wedding details and the couple's Sinhala names. Its first-frame poster is `media/localized-opening-poster.jpg`. The source `assests/opening.mp4` is preserved unchanged. The soundtrack is retained in the encoded file; browser autoplay remains muted.

`localized-video-scene.html` reads the shared configuration and lays out the new text. `media/clean-original-card.png` is the text-free artwork, and `media/original-card-reference.png` is the original reference frame. `scripts/localize-opening.mjs` uses the measured original panel motion, composites the new details behind them, and encodes the MP4. Run `npm run video` after changing the names or date. The completed card can be inspected in `media/localized-card.jpg`.

The earlier alternative design remains available at `media/opening.mp4` (10 seconds, 720 × 1280, silent H.264), with production source `video-scene.html`. Regenerate it using `npm run video:alternative`. Text in both versions is rendered by Chromium for Sinhala shaping, then frames are encoded by FFmpeg.

Run `npm install`, install FFmpeg on PATH and Google Chrome or Microsoft Edge, then run `npm run video`. On other platforms, set `CHROME_PATH` or install Playwright Chromium with `npx playwright install chromium`. A Sinhala-capable system font is required for video production (Windows includes Iskoola Pota); Noto Serif Sinhala is also supported. The website uses locally available Sinhala fonts and the browser’s script fallback. Run the video command after editing details so the MP4 and poster match the page.

## Checks and hosting

`npm test` runs browser checks and writes desktop/mobile screenshots under `artifacts/`. It uses the same browser discovery as video production.

Upload `index.html`, `styles.css`, `app.js`, `falling-flowers.js`, `invitation.config.js`, `media/`, and the images and original `opening.mp4` in `assests/` to any static host, keeping their paths intact. Do not upload node_modules, caches, or test artifacts. Serve MP4 as `video/mp4`. No build, backend, credentials, or deployment service is needed.

The intro autoplays muted, continues automatically when finished and can be dismissed with Escape, and has a manual-play fallback. Reduced-motion visitors go directly to the static invitation. A video error also reveals the page. The original assets have not been altered.

The invitation card displays the original full-color artwork as a static background, without animation or a pale overlay.

A separate falling-flower layer uses assests/flower.jpg across the page. It is decorative, does not intercept clicks, pauses in background tabs, and is hidden for reduced-motion preferences. The card itself stays static.

The opening card shows enlarged Sinhala invitation wording, couple names, and the date. Ceremony time, venue, location, closing wording, and the sample label have been removed from this card.
