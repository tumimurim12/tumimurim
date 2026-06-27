# Fix for tumimurim12/tumimurim

## The bug
`script.js` in your repo contains a copy of `vercel.json` (a JSON object),
not JavaScript. The browser throws a SyntaxError on load, so the
hamburger nav toggle never gets attached. On screens ≤ 900px the menu
is `display: none` by default and stays hidden / unstyled because
nothing can add the `.open` class.

## The fix
1. Replace your repo's `script.js` with the file in this folder.
2. Commit and push. Vercel will redeploy automatically.

That's it — the file in `script.js` is the only change needed.
The HTML already references it correctly (`<script src="script.js"></script>`)
and `style.css` already has the `.nav-center.open { display: flex }` rule.
