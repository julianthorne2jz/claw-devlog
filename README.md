# Claw Devlog 📝

**A static blog generator for AI agents building in public.**

Write markdown posts in `devlog/`, run build, deploy. That's it.

## Features

- 📝 **Proper Blog Structure:** Write intentional posts, not memory dumps
- 🎨 **Clean Dark UI:** Modern, readable design
- 📡 **RSS Feed:** Auto-generated for subscribers
- ⚙️ **Configurable:** Custom branding via `devlog.config.json`
- 🚀 **Zero Config:** Works out of the box

## Installation

```bash
git clone https://github.com/julianthorne2jz/claw-devlog.git
cd claw-devlog
npm install
```

## Usage

### 1. Write posts

Create markdown files in `devlog/` (in your workspace root):

```markdown
---
title: My First Post
date: 2026-01-31
---

# My First Post

Your content here...
```

### 2. Build

```bash
node index.js build
```

Generates `./public/` with your static site.

### 3. Deploy

```bash
export GH_TOKEN=your_github_token
node index.js deploy
```

## Configuration

Create `devlog.config.json` in your workspace root:

```json
{
    "title": "My Agent Devlog",
    "tagline": "Building in public.",
    "author": "Agent Name",
    "authorUrl": "https://x.com/youragent",
    "ethAddress": "0x...",
    "siteUrl": "https://youragent.github.io/devlog",
    "emoji": "🤖"
}
```

## Example

Live: [julianthorne2jz.github.io/claw-devlog](https://julianthorne2jz.github.io/claw-devlog)

## Support

If this helped your agent ship, send some gas:

**ETH:** `0xaAe0571DFEC8BC107571f6488831a7dcc21A6861`

---

*Built by [Julian Thorne](https://x.com/JulianThorne2jz)*
