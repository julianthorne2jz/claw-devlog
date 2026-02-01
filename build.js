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
        .replace(/^#+\s+.*/gm, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/[*_`~]/g, '')
        .replace(/\n+/g, ' ')
        .trim();
}

function readingTime(text) {
    const words = text.split(/\s+/).length;
    const mins = Math.ceil(words / 200);
    return mins === 1 ? '1 min' : `${mins} min`;
}

function parseFrontmatter(content) {
    const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!match) return { meta: {}, body: content };
    
    const meta = {};
    match[1].split('\n').forEach(line => {
        const idx = line.indexOf(':');
        if (idx > 0) {
            const key = line.slice(0, idx).trim();
            let val = line.slice(idx + 1).trim();
            if (val === 'true') val = true;
            else if (val === 'false') val = false;
            meta[key] = val;
        }
    });
    return { meta, body: match[2] };
}

function parseTags(tagStr) {
    if (!tagStr) return [];
    return tagStr.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
}

// --- Template ---
const template = (title, body, extra = '') => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}${config.title ? ` | ${config.title}` : ''}</title>
    <link rel="alternate" type="application/rss+xml" title="RSS" href="rss.xml">
    ${extra}
    <style>
        :root{--bg:#0d1117;--bg2:#161b22;--border:#30363d;--text:#c9d1d9;--muted:#8b949e;--accent:#58a6ff}
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:var(--bg);color:var(--text);max-width:680px;margin:0 auto;padding:2rem 1.5rem;line-height:1.7}
        a{color:var(--accent);text-decoration:none}a:hover{text-decoration:underline}
        .header{margin-bottom:2rem}.header h1{font-size:1.5rem;margin-bottom:.25rem}.header p{color:var(--muted);font-size:.9rem}
        nav{padding:1rem 0;border-bottom:1px solid var(--border);margin-bottom:2rem;font-size:.9rem}nav a{margin-right:1.5rem}
        article{margin-bottom:2.5rem}article h2{font-size:1.25rem;margin-bottom:.25rem}article h2 a{color:var(--text)}
        .meta{color:var(--muted);font-size:.85rem;margin-bottom:.5rem}
        .tags{margin-top:.5rem}.tag{display:inline-block;background:var(--bg2);padding:.15rem .5rem;border-radius:3px;font-size:.8rem;margin-right:.5rem;color:var(--muted)}
        .excerpt{color:var(--muted)}
        .content h1{font-size:1.5rem;color:var(--accent);margin:1.5rem 0 1rem}
        .content h2{font-size:1.2rem;color:var(--accent);margin:1.5rem 0 .75rem}
        .content p{margin:1rem 0}
        .content ul,.content ol{margin:1rem 0;padding-left:1.5rem}.content li{margin:.5rem 0}
        .content code{background:rgba(110,118,129,.4);padding:.15em .4em;border-radius:3px;font-size:.9em}
        .content pre{background:var(--bg2);padding:1rem;border-radius:6px;overflow-x:auto;margin:1rem 0}
        .content pre code{background:none;padding:0}
        .content blockquote{border-left:3px solid var(--accent);padding-left:1rem;color:var(--muted);margin:1rem 0}
        .content a{text-decoration:underline}
        .post-nav{display:flex;justify-content:space-between;margin-top:2rem;padding-top:1rem;border-top:1px solid var(--border);font-size:.9rem}
        .post-nav a{max-width:45%}
        footer{margin-top:3rem;padding-top:1.5rem;border-top:1px solid var(--border);color:var(--muted);font-size:.8rem}
    </style>
</head>
<body>
    <header class="header">
        <h1>${config.title || 'Devlog'}</h1>
        ${config.tagline ? `<p>${config.tagline}</p>` : ''}
    </header>
    <nav>
        <a href="index.html">Posts</a>
        <a href="tags.html">Tags</a>
        <a href="rss.xml">RSS</a>
        ${config.authorUrl && config.author ? `<a href="${config.authorUrl}">${config.author}</a>` : ''}
    </nav>
    <main>${body}</main>
    <footer><a href="https://github.com/julianthorne2jz/claw-devlog">claw-devlog</a></footer>
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
tags: meta
---

First post.
`);
    }
    
    if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md') && !f.startsWith('.')).sort().reverse();
    const posts = [];
    const tagMap = {};

    for (const file of files) {
        const raw = fs.readFileSync(path.join(POSTS_DIR, file), 'utf-8');
        const { meta, body } = parseFrontmatter(raw);
        
        if (meta.draft === true) {
            console.log(`  ⏭️  ${file} (draft)`);
            continue;
        }

        const slug = file.replace('.md', '');
        const title = meta.title || slug;
        const date = meta.date || '';
        const tags = parseTags(meta.tags);
        const html = marked.parse(body);
        const plain = stripMarkdown(body);
        const excerpt = plain.substring(0, 160) + (plain.length > 160 ? '...' : '');
        const time = readingTime(plain);

        const post = { slug, title, date, tags, html, excerpt, time };
        posts.push(post);

        // Index by tag
        for (const tag of tags) {
            if (!tagMap[tag]) tagMap[tag] = [];
            tagMap[tag].push(post);
        }

        console.log(`  ✓ ${slug}.html`);
    }

    // Generate individual post pages with prev/next
    for (let i = 0; i < posts.length; i++) {
        const post = posts[i];
        const prev = posts[i + 1];
        const next = posts[i - 1];

        const tagsHtml = post.tags.length 
            ? `<div class="tags">${post.tags.map(t => `<a href="tag-${t}.html" class="tag">${t}</a>`).join('')}</div>` 
            : '';

        const navHtml = `<div class="post-nav">
            ${prev ? `<a href="${prev.slug}.html">← ${prev.title}</a>` : '<span></span>'}
            ${next ? `<a href="${next.slug}.html">${next.title} →</a>` : '<span></span>'}
        </div>`;

        const page = `
            <article>
                <h1>${post.title}</h1>
                <div class="meta">${post.date}${post.date && post.time ? ' · ' : ''}${post.time}</div>
                ${tagsHtml}
                <div class="content">${post.html}</div>
                ${navHtml}
            </article>
        `;
        fs.writeFileSync(path.join(OUTPUT_DIR, `${post.slug}.html`), template(post.title, page));
    }

    // Index
    const indexBody = posts.length === 0 
        ? '<p>No posts yet.</p>'
        : posts.map(p => {
            const tagsHtml = p.tags.length 
                ? `<div class="tags">${p.tags.map(t => `<a href="tag-${t}.html" class="tag">${t}</a>`).join('')}</div>` 
                : '';
            return `
                <article>
                    <h2><a href="${p.slug}.html">${p.title}</a></h2>
                    <div class="meta">${p.date}${p.date && p.time ? ' · ' : ''}${p.time}</div>
                    ${tagsHtml}
                    <p class="excerpt">${p.excerpt}</p>
                </article>
            `;
        }).join('');

    fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), template('Home', indexBody));

    // Tags index
    const sortedTags = Object.keys(tagMap).sort();
    const tagsBody = sortedTags.length === 0
        ? '<p>No tags yet.</p>'
        : `<ul>${sortedTags.map(t => `<li><a href="tag-${t}.html">${t}</a> (${tagMap[t].length})</li>`).join('')}</ul>`;
    fs.writeFileSync(path.join(OUTPUT_DIR, 'tags.html'), template('Tags', `<h1>Tags</h1>${tagsBody}`));

    // Individual tag pages
    for (const tag of sortedTags) {
        const tagPosts = tagMap[tag];
        const tagBody = tagPosts.map(p => `
            <article>
                <h2><a href="${p.slug}.html">${p.title}</a></h2>
                <div class="meta">${p.date}</div>
            </article>
        `).join('');
        fs.writeFileSync(path.join(OUTPUT_DIR, `tag-${tag}.html`), template(`#${tag}`, `<h1>#${tag}</h1>${tagBody}`));
    }

    // 404
    fs.writeFileSync(path.join(OUTPUT_DIR, '404.html'), template('Not Found', '<p>Page not found. <a href="index.html">Go home</a>.</p>'));

    // Sitemap
    const urls = [
        `${config.siteUrl}/`,
        `${config.siteUrl}/tags.html`,
        ...posts.map(p => `${config.siteUrl}/${p.slug}.html`),
        ...sortedTags.map(t => `${config.siteUrl}/tag-${t}.html`)
    ];
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${u}</loc></url>`).join('\n')}
</urlset>`;
    fs.writeFileSync(path.join(OUTPUT_DIR, 'sitemap.xml'), sitemap);

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

    console.log(`\n✅ Built ${posts.length} posts, ${sortedTags.length} tags`);
}

main().catch(e => { console.error('Build failed:', e); process.exit(1); });
