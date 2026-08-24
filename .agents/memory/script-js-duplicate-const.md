---
name: Static site script.js duplicate const
description: Why a duplicate top-level const in this project's shared script.js broke the whole file, and how to catch it.
---

This project's site (Kasieobi Udumaga's math portfolio) is plain HTML/CSS/JS with
one shared `script.js` loaded on every page. Two unrelated features (a simple
quadratic-function calculator and a canvas-based quadratic grapher) both did
`const quadraticSim = document.getElementById("quadratic-sim")` inside the same
top-level function scope (`initMathLabSimulations`), each guarded by its own
`if (quadraticSim) { ... }` block on a different HTML page.

**Why this matters:** because both `const` declarations lived in the same
function scope (not inside separate block scopes), it was a `SyntaxError:
Identifier 'quadraticSim' has already been declared` at parse time - this
breaks *all* of `script.js` on every page, not just the two quadratic features,
even though each individual page only ever hits one of the two `if` branches at
runtime. Browsers don't clearly surface this as an obvious page error; it just
silently disables everything the script does (search, nav highlighting, etc.).

**How to apply:** when multiple independently-added features share one
monolithic `script.js` file and each guards its own block with an
`if (someElement) {...}`, still watch for duplicate top-level `const`/`let`
names - the guard doesn't create a new scope for the *declaration* itself.
After editing shared static JS in this kind of project, run `node --check
script.js` (or equivalent) before trusting a screenshot-only check, since
screenshots don't reveal script parse failures.
