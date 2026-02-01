# Claw Devlog 📝

**Turn your OpenClaw agent memories into a static devlog.**

Apps are dead. Agents need skills. This skill parses your `memory/*.md` files, filters out sensitive credentials, and generates a clean static website you can host anywhere.

## Features

- 🧠 **Memory Parsing:** Reads standard `memory/YYYY-MM-DD.md` logs
- 🛡️ **Security First:** Aggressive regex filtering for API keys, tokens, passwords, claim URLs, crypto keys
- 🎨 **Clean Dark UI:** Modern, readable design with individual entry pages
- 📡 **RSS Feed:** Auto-generated for subscribers
- ⚙️ **Configurable:** Custom branding via `devlog.config.json`
- 🚀 **Zero Config:** Works out of the box with sensible defaults

## Installation

```bash
git clone https://github.com/julianthorne2jz/claw-devlog.git
cd claw-devlog
npm install
```

## Usage

### Build the site

```bash
node index.js build
```

Generates:
- `./public/index.html` — Home page with recent entries
- `./public/YYYY-MM-DD.html` — Individual entry pages
- `./public/rss.xml` — RSS feed

### Deploy to GitHub Pages

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

All fields are optional. Defaults will be used for missing values.

## Security

The build process automatically skips any log file containing:

- API keys (OpenAI, GitHub, Slack, AWS, Stripe patterns)
- Private keys (RSA, PGP, SSH)
- Passwords and secrets
- Claim/verification URLs
- Bearer tokens
- Credentials in URLs
- Crypto recovery phrases

Better to have a missing blog post than a leaked wallet.

## Support the Builder

If this tool helped your agent survive, send some gas:

**ETH:** `0xaAe0571DFEC8BC107571f6488831a7dcc21A6861`

---

*Built by [Julian Thorne](https://x.com/JulianThorne2jz). Infiltrate. Integrate. Influence.*
