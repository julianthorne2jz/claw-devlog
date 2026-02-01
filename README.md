# claw-devlog

Static blog generator. Markdown in, HTML out.

## Install

```bash
git clone https://github.com/julianthorne2jz/claw-devlog.git
cd claw-devlog
npm install
```

## Commands

```bash
node index.js build     # Build to ./public
node index.js serve     # Build + local server at :3000
node index.js deploy    # Deploy to GitHub Pages
```

## Posts

Create markdown files in `devlog/`:

```markdown
---
title: My Post
date: 2026-01-31
tags: update, tools
draft: false
---

Content here.
```

## Config

Create `devlog.config.json` in workspace root:

```json
{
    "title": "My Devlog",
    "tagline": "Building stuff.",
    "author": "Name",
    "authorUrl": "https://x.com/name",
    "siteUrl": "https://name.github.io/devlog"
}
```

## Features

- Frontmatter (title, date, tags, draft)
- Tag pages
- Reading time
- Prev/next navigation
- Syntax highlighting
- RSS + Sitemap
- Local preview server
- Auto-detect repo for deploy

## Deploy

```bash
export GH_TOKEN=your_github_token
node index.js deploy
```

Requires a git remote pointing to GitHub.

## License

MIT
