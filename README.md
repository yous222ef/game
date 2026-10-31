# Picture Duel

Responsive, buildless two-player picture game for GitHub Pages. Includes 20 simple demo illustrations. No JSON deck, option labels, answer keys, dependencies or accounts are required.

## Play

1. Player 1 starts Round 1, reveals a picture and has 60 seconds to describe it.
2. The picture hides, but Player 1 keeps the phone.
3. Player 1 starts the 90-second answer timer. Player 2 answers aloud without touching the phone.
4. Player 1 watches the timer and tells Player 2 when time is up. If Player 2 answers before time runs out, Player 1 taps **Answer given · judge**.
5. Player 1 sees the picture again and selects **Correct** or **False**.
6. Correct awards the current guesser one point. False or timeout awards the current describer one point.
7. Only after the round ends is the phone handed over. Player 2 starts Round 2 as the new describer, and the roles keep alternating each round.
8. After ten rounds the higher score wins; 5–5 is a draw.

The phone stays with the describer/judge for the entire round. The guesser never needs to touch it. Roles automatically alternate: Player 1 describes odd-numbered rounds and Player 2 describes even-numbered rounds.

The large timer, last-ten-second beeps, finish chime, tap sounds, saved mute control, fullscreen message box and viewport-fit layout are retained. Browser/device audio restrictions may silence audio. Settings and message dialogs can scroll internally on small displays; the game page does not scroll.

## Add pictures—no JSON

Place your files in `images/`, then edit `images.txt`: one image path per line, at least 10 unique paths. Blank lines and lines beginning with `#` are ignored. For example:

```text
images/cat-at-the-office.webp
images/flying-pizza.jpg
images/strange-kitchen.png
```

Or automatically rebuild the list after adding/removing files:

```sh
python3 update-images.py
```

The helper scans `images/`, including subfolders, for JPG, JPEG, PNG, WebP, GIF, SVG and AVIF. Upload both the images and the updated `images.txt` to GitHub. Delete demo images first if you do not want them included.

A runtime image list is needed so the static app knows which files to load. There is no answer metadata to maintain. You can also import a `.txt` list in settings (up to 10 MB); importing paths does not upload images. Relative paths resolve from the website folder. HTTPS image URLs are supported when their hosts permit loading. Only the current picture loads, so large lists do not preload all images.

## History

Shown image paths persist across matches and refreshes in browser localStorage, alongside names, sound preferences and an imported text list. Original demo history migrates to image paths. Old JSON-based custom decks are no longer loaded; add those images to the text list instead.

The game asks before replaying an exhausted deck. History is per browser/origin, does not sync between devices, and is lost if browser data is cleared. Renaming an image makes it a new entry. Current match scores/timers reset on reload. If storage fails, a message explains it. Images themselves are not saved for offline play.

## GitHub Pages

Upload the extracted folder's contents to your repository root, with `index.html` at the root. In **Settings → Pages**, choose **Deploy from a branch**, your branch (usually `main`), and **/(root)**. Save and use the Pages URL GitHub provides. No build step is needed. You can delete the old `deck.json` when upgrading; the app no longer requests it.

Official guide: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

`package.json` is only optional test-runner configuration, not a game deck; it is not used by the website.

## Local development and verification

```sh
python3 -m http.server 8000
```

Open http://localhost:8000. Do not open index.html directly as a file, because ES modules and fetching the image list require a server.

With Node.js installed, run `npm test` (no installation needed). Seven checks cover image-list parsing, local assets, invalid paths, repeat prevention, exhaustion, manual scoring/draws, sound synthesis/muting, and unsupported audio. Browser flow: reveal → hide picture while keeping the phone → describer starts the 90-second spoken-answer timer → describer judges Correct/False → phone changes hands only for the next round. Roles alternate automatically each round. Previous viewport checks covered desktop and portrait/landscape phone-sized frames, not physical phones.
