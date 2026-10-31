# Picture Duel

A buildless, responsive two-player game. Plain HTML, CSS and JavaScript; no dependencies or accounts. Includes 20 simple SVG demo cards. Replace these with your real picture collection.

## Publish on GitHub Pages

1. Extract the ZIP and upload the contents of `picture-duel` to the root of your GitHub repository. Keep `index.html` at the root.
2. Open repository **Settings → Pages**.
3. Choose **Deploy from a branch**, your branch (usually `main`), and **/(root)**, then Save.
4. Open the Pages URL GitHub provides after deployment.

No build command is needed. All application paths are relative, so repository subpaths work.

Official guide: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Play

- Player 1 is the describer throughout the match. Player 2 is the guesser.
- Reveal starts a 60-second countdown only after the image loads.
- Finish early or let the timer expire. The image is removed for handoff.
- Player 2 starts their own 90-second timer, then chooses one of two large buttons.
- Correct: Player 2 gets one point. Wrong or timeout: Player 1 gets one point.
- See the answer and picture after every round. Ten rounds decide the winner; 5–5 is a draw.
- For equal opportunities, swap names/roles for your next match.
- Fullscreen button uses the browser fullscreen API where supported. The layout also works in an ordinary mobile browser; unsupported browsers display guidance.

## Your pictures and JSON

Put JPG, PNG, WebP or SVG assets inside `images/`. Edit `deck.json`, or import a replacement deck through settings. Use at least 10 pictures with unique, stable IDs. A deck can contain thousands of entries: only the current image loads, rather than the whole collection.

Schema example (abbreviated; add at least 10 entries):

```json
{
  "pictures": [
    {
      "id": "scene-0001",
      "image": "images/scene-0001.webp",
      "options": ["A penguin driving", "A penguin cooking"],
      "alt": "Picture for the describer"
    }
  ],
  "answers": {
    "scene-0001": 0
  }
}
```

`0` means the left button; `1` means the right button. Each picture has its own two labels. Labels are plain text, up to 100 characters. IDs should remain the same when you rename an image, and be globally unique across decks. Relative image paths resolve from the website root folder, even when importing a JSON file from your computer. Importing JSON does not upload its images: host those in the repository or use HTTPS image URLs. Use assets you have permission to publish.

Custom imports are capped at 10 MB. Larger collections can be configured directly in `deck.json`. Avoid embedding image bytes. External image hosts must allow browser access. Broken images show retry/replace controls and are not marked as shown.

## History and persistence

Shown IDs, player names and imported decks are saved in `localStorage`. The game refuses to repeat pictures until you explicitly replay an exhausted deck or clear history in settings. History spans matches and refreshes within the same browser/origin; it does not sync between devices. Clearing browser data clears history. If storage is blocked/full, an on-screen notice explains the limitation. Current match scores/timers are deliberately not resumed after a reload; shown-picture history is retained.

Only IDs/metadata are persisted, not cached image files. This is not an offline app. Answer keys are public in this client-side game; it is designed for friendly local play, not tamper-proof competitive use.

## Local development

Serve the folder (opening `index.html` directly as a file does not support fetching JSON/modules):

```sh
python3 -m http.server 8000
```

Open http://localhost:8000. With Node.js installed, run `npm test` for deck validation, image existence, history exhaustion, scoring and tie checks. No npm install required.

## Verification

- Automated tests: demo deck, local assets, invalid JSON structures, duplicate IDs, unsafe URL schemes, no-repeat selection, exhaustion, ten-round point totals and draws.
- Browser check: start → reveal/timer → hidden handoff → answer buttons/timer → correct feedback/score.
- CSS includes phone and landscape layouts; no physical phone/device compatibility test was performed.
