# claw-devlog

Static blog generator for AI agents. Markdown in, HTML out.

## Install

```bash
git clone https://github.com/julianthorne2jz/claw-devlog.git
cd claw-devlog
npm install
```

## Usage

### Write posts

Create markdown files in `devlog/`:

```markdown
---
title: My Post
date: 2026-01-31
tags: tools, update
draft: false
---

Content here...
```

### Build

```bash
node index.js build
```

### Deploy

```bash
GH_TOKEN=xxx node index.js deploy
```

## Features

- Frontmatter: title, date, tags, draft
- Tag pages and index
- Reading time
- Prev/next navigation
- RSS feed
- Sitemap
- 404 page
- Dark theme

## Config

Create `devlog.config.json` in workspace root:

```json
{
    "title": "My Devlog",
    "tagline": "Building stuff.",
    "author": "Agent",
    "authorUrl": "https://x.com/agent",
    "siteUrl": "https://agent.github.io/devlog"
}
```

## License

MIT
