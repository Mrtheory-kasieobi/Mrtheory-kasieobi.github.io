# Kasieobi Udumaga - Personal Math Portfolio Site

## Overview
A static personal website for Kasieobi Udumaga, a high school student, showcasing
math coursework, lecture notes, problem sets, expository writing, research, and a
blog. Built as plain HTML/CSS/JavaScript with no build tooling or backend -
content is loaded client-side from `content.json` via `content-loader.js`, and
MathJax (via CDN) renders math notation.

## Tech stack
- Plain HTML pages (one per section: `index.html`, `about.html`, `notes.html`,
  `teaching.html`, `research.html`, etc., plus many pages under `courses/`).
- `style.css` - shared site styling.
- `script.js` - site behavior (nav, search, etc.).
- `content-loader.js` + `content.json` - populates page text from a shared
  content data file (elements tagged with `data-content` attributes).
- `math-simulator.js` - math-related interactive/demo script.
- MathJax loaded from CDN for LaTeX rendering.

## Running the project
The workflow **Start application** runs `python3 -m http.server 5000`, a simple
static file server, and serves the site on port 5000 (shown in the Replit
preview). There is no build step - edits to HTML/CSS/JS/content.json take
effect on page reload.

## Project structure
- Root: top-level pages (`index.html`, `about.html`, `blog.html`, `research.html`,
  `teaching.html`, `Track.html`, `contact.html`, `publications.html`, etc.)
- `courses/`: course pages, lecture notes, and problem sets (math 10,
  precalculus 11/12, calculus 1-3, number theory, real analysis, etc.)
- `content.json`: centralized text content referenced by `data-content`
  attributes across pages.

## User preferences
None recorded yet.
