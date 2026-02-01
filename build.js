#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

// --- Config ---
const WORKSPACE_DIR = path.resolve(__dirname, '../../');
const POSTS_DIR = path.join(WORKSPACE_DIR, 'devlog');  // Intentional posts, NOT memory logs
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
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: var(--bg);
            color: var(--text);
            max-width: 720px;
            margin: 0 auto;
            padding: 24px;
            line-height: 1.7;
        }
        h1, h2, h3 { color: var(--accent); margin-top: 1.5em; font-weight: 600; }
        h1 { font-size: 2em; }
        h2 { font-size: 1.4em; }
        a { color: var(--accent); text-decoration: none; transition: color 0.2s; }
        a:hover { color: var(--accent-hover); text-decoration: underline; }
        .header { margin-bottom: 2em; text-align: center; }
        .header h1 { margin: 0; font-size: 1.8em; }
        .header p { color: var(--text-muted); margin: 0.5em 0; }
        .nav { 
            margin: 1.5em 0; 
            padding: 1em 0; 
            border-top: 1px solid var(--border);
            border-bottom: 1px solid var(--border); 
            text-align: center;
        }
        .nav a { margin: 0 1em; font-size: 0.95em; }
        .post {
            margin-bottom: 3em;
            padding-bottom: 2em;
            border-bottom: 1px solid var(--border);
        }
        .post:last-child { border-bottom: none; }
        .post-title { margin: 0 0 0.3em 0; }
        .post-title a { color: var(--text); }
        .post-title a:hover { color: var(--accent); }
        .post-meta { color: var(--text-muted); font-size: 0.9em; margin-bottom: 1em; }
        .post-content { margin-top: 1em; }
        .post-content p { margin: 1em 0; }
        .read-more { font-size: 0.9em; margin-top: 1em; }
        code { 
            background: rgba(110,118,129,0.4); 
            padding: 0.2em 0.5em; 
            border-radius: 4px; 
            font-family: 'SF Mono', 'Fira Code', monospace;
            font-size: 0.9em; 
        }
        pre { 
            background: var(--bg-secondary); 
            padding: 16px; 
            overflow-x: auto; 
            border-radius: 8px; 
            border: 1px solid var(--border); 
        }
        pre code { background: none; padding: 0; }
        .footer { 
            margin-top: 3em; 
            padding-top: 2em; 
            border-top: 1px solid var(--border); 
            color: var(--text-muted); 
            font-size: 0.85em; 
            text-align: center;
        }
        .eth { 
            font-family: monospace; 
            font-size: 0.8em; 
            color: var(--accent); 
            word-break: break-all; 
        }
        ul, ol { padding-left: 1.5em; }
        li { margin: 0.5em 0; }
        blockquote { 
            border-left: 3px solid var(--accent); 
            margin: 1.5em 0; 
            padding: 0.5em 0 0.5em 1.5em; 
            color: var(--text-muted);
            font-style: italic;
        }
        hr { border: none; border-top: 1px solid var(--border); margin: 2em 0; }
        img { max-width: 100%; border-radius: 8px; margin: 1em 0; }
    </style>
</head>
<body>
    <header class="header">
        <h1>${config.emoji} ${config.title}</h1>
        <p>${config.tagline}</p>
    </header>
    ${showNav ? `<nav class="nav"><a href="index.html">Home</a><a href="rss.xml">RSS</a>${config.authorUrl ? `<a href="${config.authorUrl}" target="_blank">@${config.author}</a>` : ''}</nav>` : ''}
    <main>${body}</main>
    <footer class="footer">
        <p>Powered by <a href="https://github.com/julianthorne2jz/claw-devlog">claw-devlog</a></p>
        ${config.ethAddress ? `<p class="eth">ETH: ${config.ethAddress}</p>` : ''}
    </footer>
</body>
</html>`;

// --- Parse frontmatter ---
function parseFrontmatter(content) {
    const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!match) return { meta: {}, body: content };
    
    const meta = {};
    match[1].split('\n').forEach(line => {
        const [key, ...rest] = line.split(':');
        if (key && rest.length) {
            meta[key.trim()] = rest.join(':').trim();
        }
    });
    return { meta, body: match[2] };
}

// --- Main ---
async function main() {
    console.log('📝 Starting Build...');
    console.log(`📂 Posts Dir: ${POSTS_DIR}`);

    if (!fs.existsSync(POSTS_DIR)) {
        console.log('📁 Creating devlog/ directory...');
        fs.mkdirSync(POSTS_DIR, { recursive: true });
        
        // Create example post
        const examplePost = `---
title: Hello World
date: ${new Date().toISOString().split('T')[0]}
---

# Hello World

This is my first devlog post. Edit or delete this file and add your own posts to the \`devlog/\` directory.

Each post is a markdown file with optional frontmatter:

\`\`\`markdown
---
title: My Post Title
date: 2026-01-31
---

Your content here...
\`\`\`

Happy blogging!
`;
        fs.writeFileSync(path.join(POSTS_DIR, '001-hello-world.md'), examplePost);
        console.log('📄 Created example post: 001-hello-world.md');
    }

    if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    const files = fs.readdirSync(POSTS_DIR)
        .filter(f => f.endsWith('.md') && !f.startsWith('.'))
        .sort()
        .reverse();

    console.log(`🔎 Found ${files.length} posts.`);

    const posts = [];

    // Process each post
    for (const file of files) {
        const raw = fs.readFileSync(path.join(POSTS_DIR, file), 'utf-8');
        const { meta, body } = parseFrontmatter(raw);
        
        const slug = file.replace('.md', '');
        const title = meta.title || slug;
        const date = meta.date || 'Unknown date';
        const html = marked.parse(body);
        
        // Generate excerpt (first paragraph)
        const excerptMatch = body.match(/^#.*\n\n?([\s\S]*?)(\n\n|$)/);
        const excerpt = excerptMatch 
            ? marked.parse(excerptMatch[1].substring(0, 300) + (excerptMatch[1].length > 300 ? '...' : ''))
            : '';

        posts.push({ slug, title, date, html, excerpt, body });

        // Generate individual post page
        const postBody = `
            <article class="post">
                <h1 class="post-title">${title}</h1>
                <div class="post-meta">${date}</div>
                <div class="post-content">${html}</div>
                <p><a href="index.html">← Back to all posts</a></p>
            </article>
        `;
        fs.writeFileSync(path.join(OUTPUT_DIR, `${slug}.html`), HTML_TEMPLATE(title, postBody));
    }

    // Generate index
    let indexBody = '';
    
    if (posts.length === 0) {
        indexBody = '<p>No posts yet. Add markdown files to the <code>devlog/</code> directory!</p>';
    } else {
        for (const post of posts) {
            indexBody += `
                <article class="post">
                    <h2 class="post-title"><a href="${post.slug}.html">${post.title}</a></h2>
                    <div class="post-meta">${post.date}</div>
                    <div class="post-content">${post.excerpt}</div>
                    <p class="read-more"><a href="${post.slug}.html">Read more →</a></p>
                </article>
            `;
        }
    }

    fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), HTML_TEMPLATE('Home', indexBody));
    console.log(`✅ Built ${posts.length} posts.`);

    // --- RSS Generation ---
    console.log('📡 Generating RSS Feed...');
    
    const rssItems = posts.slice(0, 20).map(post => {
        const safeHtml = post.html.replace(/]]>/g, ']]&gt;');
        return `
        <item>
            <title><![CDATA[${post.title}]]></title>
            <link>${config.siteUrl}/${post.slug}.html</link>
            <guid isPermaLink="true">${config.siteUrl}/${post.slug}.html</guid>
            <pubDate>${new Date(post.date).toUTCString()}</pubDate>
            <description><![CDATA[${safeHtml}]]></description>
        </item>`;
    }).join('');

    const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
    <title>${config.title}</title>
    <link>${config.siteUrl}</link>
    <description>${config.tagline}</description>
    <language>en-us</language>
    <atom:link href="${config.siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
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
