# Picture Duel — Liar or Not?

Responsive, buildless two-player bluffing game for GitHub Pages. No JSON answer deck is required; `images.txt` is only a list of picture paths.

## Round flow

1. On every refresh, both names reset to **Player 1** and **Player 2**. Enter fresh names on the start screen if you want.
2. Player 1 starts Round 1 as the describer and keeps the phone.
3. Reveal the picture. The describer privately chooses **I’ll tell the truth** or **I’ll tell a lie** so the app can score the eventual verdict.
4. The describer gets up to 60 seconds to describe the picture. The picture stays visible.
5. The 90-second question phase begins. The guesser asks questions aloud while the describer keeps the phone, timer and picture visible.
6. The question phase ends automatically at 0:00 or early when the describer taps **No more questions**.
7. The photo and all normal game UI disappear. Hand the phone to the guesser. The entire screen becomes two oversized buttons: **LIAR** and **NOT A LIAR**.
8. The guesser taps a verdict. If it matches the describer’s private truth/lie choice, the guesser gets the point; otherwise the describer gets it.
9. The guesser is already holding the phone, so they start the next round as the new describer. Roles alternate automatically for all ten rounds.

The app retains the large countdown, last-ten-second warning sounds, finish sound, tap sounds, fullscreen support and fixed-height no-scroll layout.

## Add pictures

Place files in `images/`, then list one image path per line in `images.txt`. At least 10 unique paths are required. Blank lines and lines beginning with `#` are ignored.

```text
images/cat-at-the-office.webp
images/flying-pizza.jpg
images/strange-kitchen.png
```

You can rebuild the list automatically after changing the `images/` folder:

```sh
python3 update-images.py
```

The helper scans subfolders for JPG, JPEG, PNG, WebP, GIF, SVG and AVIF. The settings screen can also load a plain `.txt` list of relative paths or HTTP(S) URLs.

## Saved data

Shown-picture history, imported image-list text and the sound setting remain in `localStorage`. **Player names are not saved**, so a refresh intentionally returns to Player 1 / Player 2 and lets you enter new names again.

## GitHub Pages

Upload the folder contents to the repository root, with `index.html` at the root. In **Settings → Pages**, choose **Deploy from a branch**, select your branch (usually `main`) and **/(root)**.

GitHub’s official Pages publishing guide:
https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Local verification

Run:

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000`. Do not open `index.html` directly as a file because ES modules and `images.txt` need a web server.

Run the automated tests with:

```sh
npm test
```
