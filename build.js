#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

// --- Config ---
const WORKSPACE_DIR = path.resolve(__dirname, '../../');
const MEMORY_DIR = path.join(WORKSPACE_DIR, 'memory');
const OUTPUT_DIR = path.join(process.cwd(), 'public');
const CONFIG_PATH = path.join(WORKSPACE_DIR, 'devlog.config.json');

// Load custom config or use defaults
let config = {
    title: "Agent Devlog",
    tagline: "Building in public.",
    author: "Anonymous Agent",
    authorUrl: "",
    ethAddress: "",
    siteUrl: "",
    emoji: "🤖"
};

if (fs.existsSync(CONFIG_PATH)) {
    try {
        const userConfig = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
        config = { ...config, ...userConfig };
        console.log('📋 Loaded devlog.config.json');
    } catch (e) {
        console.warn('⚠️ Failed to parse devlog.config.json, using defaults');
    }
}

// --- Security Patterns (aggressive) ---
const SENSITIVE_PATTERNS = [
    // Keywords
    /CREDENTIALS/i,
    /PRIVATE_KEY/i,
    /password\s*[:=]/i,
    /secret\s*[:=]/i,
    /api_key\s*[:=]/i,
    
    // API Keys
    /sk-[a-zA-Z0-9]{20,}/,           // OpenAI/Stripe
    /ghp_[a-zA-Z0-9]{20,}/,          // GitHub PAT
    /gho_[a-zA-Z0-9]{20,}/,          // GitHub OAuth
    /github_pat_[a-zA-Z0-9]{20,}/,   // GitHub fine-grained
    /moltbook_sk_[a-zA-Z0-9]+/,      // Moltbook
    /moltbook_claim_[a-zA-Z0-9_-]+/, // Moltbook claim tokens
    /xox[baprs]-[a-zA-Z0-9-]+/,      // Slack
    /Bearer\s+[a-zA-Z0-9._-]{20,}/i, // Bearer tokens
    
    // Crypto
    /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/,
    /-----BEGIN PGP PRIVATE KEY BLOCK-----/,
    
    // URLs with tokens
    /[?&](token|key|secret|auth)=[a-zA-Z0-9_-]{10,}/i,
    /\/claim\/[a-zA-Z0-9_-]{20,}/,   // Claim URLs
    /\/verify\/[a-zA-Z0-9_-]{20,}/,  // Verify URLs
    
    // Credentials in URLs
    /https?:\/\/[^:]+:[^@]+@/,       // user:pass@host
    
    // AWS
    /AKIA[0-9A-Z]{16}/,
    /aws_secret_access_key/i,
    
    // Recovery phrases (12/24 words pattern)
    /\b(abandon|ability|able|about|above)\b.*\b(abandon|ability|able|about|above)\b/i
];

function containsSensitiveData(content, filename) {
    for (const pattern of SENSITIVE_PATTERNS) {
        if (pattern.test(content)) {
            return true;
        }
    }
    return false;
}

// --- Templates ---
const HTML_TEMPLATE = (pageTitle, body, showNav = true) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${pageTitle} | ${config.title}</title>
    <link rel="alternate" type="application/rss+xml" title="RSS" href="rss.xml">
    <style>
        :root {
            --bg: #0d1117;
            --bg-secondary: #161b22;
            --border: #30363d;
            --text: #c9d1d9;
            --text-muted: #8b949e;
            --accent: #58a6ff;
            --accent-hover: #79c0ff;
        }
        * { box-sizing: border-box; }
        body {
            font-family: 'SF Mono', 'Fira Code', 'Courier New', monospace;
            background: var(--bg);
            color: var(--text);
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.7;
        }
        h1, h2, h3 { color: var(--accent); margin-top: 1.5em; }
        h1 { font-size: 1.8em; }
        a { color: var(--accent); text-decoration: none; transition: color 0.2s; }
        a:hover { color: var(--accent-hover); text-decoration: underline; }
        .header { margin-bottom: 2em; }
        .header h1 { margin: 0; }
        .header p { color: var(--text-muted); margin: 0.5em 0; }
        .nav { margin: 1em 0; padding: 1em 0; border-bottom: 1px solid var(--border); }
        .nav a { margin-right: 1.5em; }
        .entry {
            border: 1px solid var(--border);
            padding: 24px;
            margin-bottom: 24px;
            border-radius: 8px;
            background: var(--bg-secondary);
        }
        .entry-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .date { color: var(--text-muted); font-size: 0.9em; }
        .entry-list { list-style: none; padding: 0; }
        .entry-list li { padding: 12px 0; border-bottom: 1px solid var(--border); }
        .entry-list li:last-child { border-bottom: none; }
        code { background: rgba(110,118,129,0.4); padding: 0.2em 0.4em; border-radius: 4px; font-size: 0.9em; }
        pre { background: var(--bg-secondary); padding: 16px; overflow-x: auto; border-radius: 8px; border: 1px solid var(--border); }
        pre code { background: none; padding: 0; }
        .footer { margin-top: 3em; padding-top: 2em; border-top: 1px solid var(--border); color: var(--text-muted); font-size: 0.85em; }
        .footer a { color: var(--text-muted); }
        .eth { font-family: monospace; font-size: 0.8em; color: var(--accent); word-break: break-all; }
        ul, ol { padding-left: 1.5em; }
        li { margin: 0.5em 0; }
        blockquote { border-left: 3px solid var(--accent); margin: 1em 0; padding-left: 1em; color: var(--text-muted); }
        hr { border: none; border-top: 1px solid var(--border); margin: 2em 0; }
        img { max-width: 100%; border-radius: 8px; }
        table { width: 100%; border-collapse: collapse; margin: 1em 0; }
        th, td { border: 1px solid var(--border); padding: 8px 12px; text-align: left; }
        th { background: var(--bg-secondary); }
    </style>
</head>
<body>
    <header class="header">
        <h1>${config.emoji} ${config.title}</h1>
        <p>${config.tagline}</p>
    </header>
    ${showNav ? `<nav class="nav"><a href="index.html">Home</a><a href="rss.xml">RSS</a>${config.authorUrl ? `<a href="${config.authorUrl}" target="_blank">${config.author}</a>` : ''}</nav>` : ''}
    <main>${body}</main>
    <footer class="footer">
        <p>Generated by <a href="https://github.com/julianthorne2jz/claw-devlog">claw-devlog</a></p>
        ${config.ethAddress ? `<p class="eth">ETH: ${config.ethAddress}</p>` : ''}
    </footer>
</body>
</html>`;

// --- Main ---
async function main() {
    console.log('📝 Starting Build...');
    console.log(`📂 Memory Dir: ${MEMORY_DIR}`);

    if (!fs.existsSync(MEMORY_DIR)) {
        console.error('❌ No memory directory found at:', MEMORY_DIR);
        process.exit(1);
    }
    if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    const files = fs.readdirSync(MEMORY_DIR)
        .filter(f => f.endsWith('.md') && !f.startsWith('.'))
        .sort()
        .reverse();

    console.log(`🔎 Found ${files.length} logs.`);

    const safeEntries = [];

    // Process each file
    for (const file of files) {
        const content = fs.readFileSync(path.join(MEMORY_DIR, file), 'utf-8');
        
        if (containsSensitiveData(content, file)) {
            console.warn(`⚠️ Skipping ${file}: Contains sensitive data.`);
            continue;
        }

        const date = file.replace('.md', '');
        const html = marked.parse(content);
        
        // Extract title from first heading or use date
        const titleMatch = content.match(/^#\s+(.+)$/m);
        const title = titleMatch ? titleMatch[1] : `Log: ${date}`;

        safeEntries.push({ date, title, html, content });

        // Generate individual entry page
        const entryBody = `
            <article class="entry">
                <div class="entry-header">
                    <span class="date">${date}</span>
                    <a href="index.html">← Back</a>
                </div>
                <div class="content">${html}</div>
            </article>
        `;
        fs.writeFileSync(path.join(OUTPUT_DIR, `${date}.html`), HTML_TEMPLATE(title, entryBody));
    }

    // Generate index with entry list (recent 20) + full content for latest 5
    let indexBody = '';
    
    if (safeEntries.length === 0) {
        indexBody = '<p>No entries yet. Start logging to memory/*.md!</p>';
    } else {
        // Show full content for latest 5
        const latestEntries = safeEntries.slice(0, 5);
        for (const entry of latestEntries) {
            indexBody += `
                <article class="entry" id="${entry.date}">
                    <div class="entry-header">
                        <span class="date">${entry.date}</span>
                        <a href="${entry.date}.html">Permalink</a>
                    </div>
                    <div class="content">${entry.html}</div>
                </article>
            `;
        }

        // Archive list for older entries
        if (safeEntries.length > 5) {
            indexBody += '<h2>Archive</h2><ul class="entry-list">';
            for (const entry of safeEntries.slice(5)) {
                indexBody += `<li><a href="${entry.date}.html">${entry.date}</a> — ${entry.title}</li>`;
            }
            indexBody += '</ul>';
        }
    }

    fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), HTML_TEMPLATE('Home', indexBody));
    console.log(`✅ Built ${safeEntries.length} entries.`);

    // --- RSS Generation ---
    console.log('📡 Generating RSS Feed...');
    
    const rssItems = safeEntries.slice(0, 20).map(entry => {
        // Escape CDATA-breaking sequences
        const safeHtml = entry.html.replace(/]]>/g, ']]&gt;');
        
        return `
        <item>
            <title><![CDATA[${entry.title}]]></title>
            <link>${config.siteUrl || ''}/${entry.date}.html</link>
            <guid isPermaLink="true">${config.siteUrl || ''}/${entry.date}.html</guid>
            <pubDate>${new Date(entry.date.substring(0, 10)).toUTCString()}</pubDate>
            <description><![CDATA[${safeHtml}]]></description>
        </item>`;
    }).join('');

    const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
    <title>${config.title}</title>
    <link>${config.siteUrl || ''}</link>
    <description>${config.tagline}</description>
    <language>en-us</language>
    <atom:link href="${config.siteUrl || ''}/rss.xml" rel="self" type="application/rss+xml" />
    ${rssItems}
</channel>
</rss>`;

    fs.writeFileSync(path.join(OUTPUT_DIR, 'rss.xml'), rssXml);
    console.log('✅ RSS Feed -> ./public/rss.xml');
    console.log('✅ Build Complete!');
}

main().catch(err => {
    console.error('❌ Build failed:', err);
    process.exit(1);
});
