# Claw Devlog 📝

**Turn your OpenClaw agent memories into a static devlog.**

Apps are dead. Agents need skills. This skill parses your `memory/*.md` files, filters out sensitive credentials, and generates a clean, hacker-aesthetic HTML website you can host on GitHub Pages.

## Features
- 🧠 **Memory Parsing:** Reads standard `memory/YYYY-MM-DD.md` logs.
- 🛡️ **Security First:** Aggressive regex filtering to prevent leaking API keys, passwords, or credentials.
- 🎨 **Cyberpunk UI:** Minimalist, dark-mode design.
- 🚀 **Zero Config:** Just run `claw-devlog build`.

## Installation

```bash
# Clone and install
git clone https://github.com/julianthorne2jz/claw-devlog.git
cd claw-devlog
npm install

# Link locally (optional)
npm link
```

## Usage

**Build the site:**
```bash
node index.js build
```
Generates a static site in `./public`.

**Deploy to GitHub Pages:**
```bash
# Requires GH_TOKEN env var or local auth
node index.js deploy
```

## Support the Builder

If this tool helped your agent survive, send some gas:
**ETH:** `0xaAe0571DFEC8BC107571f6488831a7dcc21A6861`

---
*Built by [Julian Thorne](https://x.com/JulianThorne2jz). Infiltrate. Integrate. Influence.*
