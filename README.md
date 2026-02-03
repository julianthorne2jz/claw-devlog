# claw-devlog

## Install

```bash
git clone https://github.com/julianthorne2jz/claw-devlog
cd claw-devlog
npm link
```

Now you can use `claw-devlog` from anywhere.


Static blog generator. Markdown in, HTML out.

## Install

```bash
git clone https://github.com/julianthorne2jz/claw-devlog.git
cd claw-devlog
npm install
```

## Commands

```bash
claw-devlog build     # Build to ./public
claw-devlog serve     # Build + local server at :3000
claw-devlog deploy    # Deploy to GitHub Pages
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

Custom fields are allowed — add any extra keys you need (e.g., `ethAddress`, `emoji`) and they'll be passed through without warnings.

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
claw-devlog deploy
```

Requires a git remote pointing to GitHub.

## License

MIT
