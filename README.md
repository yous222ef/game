# Picture Duel — Liar or Truthful?

Responsive, buildless two-player bluffing game for GitHub Pages. The interface can switch between English and Arabic, including RTL layout.

## Current game flow

1. Player 1 starts as the describer. Roles alternate every round.
2. The describer reveals the picture and privately chooses **truth** or **lie**.
3. The picture remains visible to the describer during the 60-second description phase.
4. The same picture remains visible during the full **90-second question phase**. The describer keeps the phone while the other player asks questions aloud.
5. The question phase ends automatically at 1:30, or early when the describer presses **No more questions**.
6. The picture disappears completely. The phone is handed to the guesser, who sees only two very large buttons: **LIAR** and **TRUTHFUL**.
7. After the verdict, the guesser sees the real picture, whether the verdict was correct, and both score changes. Only then do they start the next round as the new describer.
8. The first player whose score reaches **5 or more** wins. Scores may go below zero.

## Scoring

| Describer | Guesser verdict | Describer | Guesser |
| --- | --- | ---: | ---: |
| Lied | Truthful | +2 | -1 |
| Lied | Liar | -1 | +1 |
| Told truth | Truthful | 0 | +1 |
| Told truth | Liar | +1 | -1 |

## Names and language

Player names are deliberately not stored. Every page refresh starts with `Player 1` and `Player 2`. Names can be changed on the start screen or in **Game settings** between active timed phases.

The top language button switches the complete game interface between English and Arabic without resetting the current match or timer. The language preference itself is saved locally.

## Pictures

Put image files in `images/` and list them in `images.txt`, one path per line. At least 10 unique paths are required. Blank lines and `#` comments are ignored. HTTPS URLs are also supported where the remote host permits loading.

## GitHub Pages

Put `index.html` at the repository root. In GitHub: **Settings → Pages → Deploy from a branch → main → /(root)**. No build step is required.

For local testing:

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000`. With Node.js installed, run:

```sh
npm test
```
