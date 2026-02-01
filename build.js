#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

// --- Config ---
const WORKSPACE_DIR = path.resolve(__dirname, '../../');
const POSTS_DIR = path.join(WORKSPACE_DIR, 'devlog');
const OUTPUT_DIR = path.join(process.cwd(), 'public');
const CONFIG_PATH = path.join(WORKSPACE_DIR, 'devlog.config.json');

let config = {
    title: "Devlog",
    tagline: "",
    author: "",
    authorUrl: "",
    siteUrl: ""
};

if (fs.existsSync(CONFIG_PATH)) {
    try {
        config = { ...config, ...JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8')) };
    } catch (e) {
        console.warn('⚠️ Failed to parse config');
    }
}

// --- Utilities ---
function stripMarkdown(md) {
    return md
        .replace(/^#+\s+.*/gm, '')       // headers
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
        .replace(/[*_`~]/g, '')          // formatting
        .replace(/\n+/g, ' ')            // newlines
        .trim();
}

function readingTime(text) {
    const words = text.split(/\s+/).length;
    const mins = Math.ceil(words / 200);
    return mins === 1 ? '1 min read' : `${mins} min read`;
}

function parseFrontmatter(content) {
    const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!match) return { meta: {}, body: content };
    
    const meta = {};
    match[1].split('\n').forEach(line => {
        const idx = line.indexOf(':');
        if (idx > 0) {
            const key = line.slice(0, idx).trim();
            const val = line.slice(idx + 1).trim();
            meta[key] = val === 'true' ? true : val === 'false' ? false : val;
        }
    });
    return { meta, body: match[2] };
}

// --- Template ---
const template = (title, body) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}${config.title ? ` | ${config.title}` : ''}</title>
    <link rel="alternate" type="application/rss+xml" title="RSS" href="rss.xml">
    <style>
        :root { --bg:#0d1117; --bg2:#161b22; --border:#30363d; --text:#c9d1d9; --muted:#8b949e; --accent:#58a6ff; }
        * { box-sizing:border-box; margin:0; padding:0; }
        body { font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; background:var(--bg); color:var(--text); max-width:680px; margin:0 auto; padding:2rem 1.5rem; line-height:1.7; }
        a { color:var(--accent); text-decoration:none; }
        a:hover { text-decoration:underline; }
        .header { margin-bottom:2rem; }
        .header h1 { font-size:1.5rem; margin-bottom:0.25rem; }
        .header p { color:var(--muted); font-size:0.9rem; }
        nav { padding:1rem 0; border-bottom:1px solid var(--border); margin-bottom:2rem; font-size:0.9rem; }
        nav a { margin-right:1.5rem; }
        article { margin-bottom:2.5rem; }
        article h2 { font-size:1.25rem; margin-bottom:0.25rem; }
        article h2 a { color:var(--text); }
        .meta { color:var(--muted); font-size:0.85rem; margin-bottom:0.75rem; }
        .excerpt { color:var(--muted); }
        .content h1 { font-size:1.5rem; color:var(--accent); margin:1.5rem 0 1rem; }
        .content h2 { font-size:1.2rem; color:var(--accent); margin:1.5rem 0 0.75rem; }
        .content p { margin:1rem 0; }
        .content ul, .content ol { margin:1rem 0; padding-left:1.5rem; }
        .content li { margin:0.5rem 0; }
        .content code { background:rgba(110,118,129,0.4); padding:0.15em 0.4em; border-radius:3px; font-size:0.9em; }
        .content pre { background:var(--bg2); padding:1rem; border-radius:6px; overflow-x:auto; margin:1rem 0; }
        .content pre code { background:none; padding:0; }
        .content blockquote { border-left:3px solid var(--accent); padding-left:1rem; color:var(--muted); margin:1rem 0; }
        .content a { text-decoration:underline; }
        footer { margin-top:3rem; padding-top:1.5rem; border-top:1px solid var(--border); color:var(--muted); font-size:0.8rem; }
    </style>
</head>
<body>
    <header class="header">
        <h1>${config.title || 'Devlog'}</h1>
        ${config.tagline ? `<p>${config.tagline}</p>` : ''}
    </header>
    <nav>
        <a href="index.html">Posts</a>
        <a href="rss.xml">RSS</a>
        ${config.authorUrl && config.author ? `<a href="${config.authorUrl}">${config.author}</a>` : ''}
    </nav>
    <main>${body}</main>
    <footer>
        <a href="https://github.com/julianthorne2jz/claw-devlog">claw-devlog</a>
    </footer>
</body>
</html>`;

// --- Build ---
async function main() {
    console.log('Building...');

    if (!fs.existsSync(POSTS_DIR)) {
        fs.mkdirSync(POSTS_DIR, { recursive: true });
        fs.writeFileSync(path.join(POSTS_DIR, '001-hello.md'), 
`---
title: Hello
date: ${new Date().toISOString().split('T')[0]}
---

First post. Edit this file or add new ones to \`devlog/\`.
`);
    }
    
    if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md') && !f.startsWith('.')).sort().reverse();
    const posts = [];

    for (const file of files) {
        const raw = fs.readFileSync(path.join(POSTS_DIR, file), 'utf-8');
        const { meta, body } = parseFrontmatter(raw);
        
        // Skip drafts
        if (meta.draft === true) {
            console.log(`  ⏭️  ${file} (draft)`);
            continue;
        }

        const slug = file.replace('.md', '');
        const title = meta.title || slug;
        const date = meta.date || '';
        const html = marked.parse(body);
        const plain = stripMarkdown(body);
        const excerpt = plain.substring(0, 160) + (plain.length > 160 ? '...' : '');
        const time = readingTime(plain);

        posts.push({ slug, title, date, html, excerpt, time });

        // Individual page
        const page = `
            <article>
                <h1 class="content">${title}</h1>
                <div class="meta">${date}${date && time ? ' · ' : ''}${time}</div>
                <div class="content">${html}</div>
                <p style="margin-top:2rem;"><a href="index.html">← All posts</a></p>
            </article>
        `;
        fs.writeFileSync(path.join(OUTPUT_DIR, `${slug}.html`), template(title, page));
        console.log(`  ✓ ${slug}.html`);
    }

    // Index
    let indexBody = posts.length === 0 
        ? '<p>No posts yet.</p>'
        : posts.map(p => `
            <article>
                <h2><a href="${p.slug}.html">${p.title}</a></h2>
                <div class="meta">${p.date}${p.date && p.time ? ' · ' : ''}${p.time}</div>
                <p class="excerpt">${p.excerpt}</p>
            </article>
        `).join('');

    fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), template('Home', indexBody));

    // 404
    fs.writeFileSync(path.join(OUTPUT_DIR, '404.html'), template('Not Found', '<p>Page not found. <a href="index.html">Go home</a>.</p>'));

    // RSS
    const rssItems = posts.slice(0, 20).map(p => `
        <item>
            <title><![CDATA[${p.title}]]></title>
            <link>${config.siteUrl}/${p.slug}.html</link>
            <guid>${config.siteUrl}/${p.slug}.html</guid>
            <pubDate>${p.date ? new Date(p.date).toUTCString() : ''}</pubDate>
            <description><![CDATA[${p.html.replace(/]]>/g, ']]&gt;')}]]></description>
        </item>`).join('');

    fs.writeFileSync(path.join(OUTPUT_DIR, 'rss.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
    <title>${config.title}</title>
    <link>${config.siteUrl}</link>
    <description>${config.tagline}</description>
    ${rssItems}
</channel>
</rss>`);

    console.log(`\n✅ Built ${posts.length} posts`);
}

main().catch(e => { console.error('Build failed:', e); process.exit(1); });
