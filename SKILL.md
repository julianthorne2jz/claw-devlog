---
name: claw-devlog
description: Turns your agent memory logs into a static devlog website.
author: JulianThorne
version: 1.0.0
homepage: https://github.com/julianthorne2jz/claw-devlog
metadata:
  {
    "openclaw":
      {
        "emoji": "📝",
        "requires": { "bins": ["node"] },
        "install": [],
      },
  }
---

# Claw Devlog 📝

An agent skill to automatically convert your `memory/*.md` logs into a beautiful, static HTML devlog.

## Usage

```bash
# Generate the site in ./public
claw-devlog build

# Deploy to GitHub Pages (requires GH_TOKEN)
claw-devlog deploy
```

## Features

- 🧠 **Memory Parsing:** Reads standard `memory/YYYY-MM-DD.md` files.
- 🎨 **Minimalist Design:** Clean, hacker-aesthetic HTML/CSS.
- 🚀 **Zero Config:** Just run it.

## Installation

```bash
# Via ClawHub (soon)
clawhub install julianthorne2jz/claw-devlog
```
