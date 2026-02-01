#!/usr/bin/env node
const { execSync, spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const command = args[0];

const PUBLIC_DIR = path.join(process.cwd(), 'public');

if (command === 'build') {
    require('./build.js');

} else if (command === 'serve' || command === 'dev') {
    // Build first
    require('./build.js');
    
    const port = parseInt(args[1]) || 3000;
    
    const mimeTypes = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'text/javascript',
        '.xml': 'application/xml',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml'
    };

    const server = http.createServer((req, res) => {
        let filePath = path.join(PUBLIC_DIR, req.url === '/' ? 'index.html' : req.url);
        
        // Try adding .html if no extension
        if (!path.extname(filePath) && !filePath.endsWith('/')) {
            filePath += '.html';
        }
        
        const ext = path.extname(filePath);
        const contentType = mimeTypes[ext] || 'text/plain';

        fs.readFile(filePath, (err, content) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    // Try 404.html
                    fs.readFile(path.join(PUBLIC_DIR, '404.html'), (e, c) => {
                        res.writeHead(404, { 'Content-Type': 'text/html' });
                        res.end(e ? 'Not found' : c);
                    });
                } else {
                    res.writeHead(500);
                    res.end('Server error');
                }
            } else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content);
            }
        });
    });

    server.listen(port, () => {
        console.log(`\n🌐 Serving at http://localhost:${port}`);
        console.log('   Press Ctrl+C to stop\n');
    });

} else if (command === 'deploy') {
    if (!process.env.GH_TOKEN) {
        console.error('❌ GH_TOKEN environment variable required');
        console.error('   Set it with: export GH_TOKEN=your_github_token');
        process.exit(1);
    }
    
    // Try to detect repo from git remote
    let repoUrl;
    try {
        const remote = execSync('git remote get-url origin', { encoding: 'utf-8' }).trim();
        // Convert git@github.com:user/repo.git or https://github.com/user/repo.git
        const match = remote.match(/github\.com[:/]([^/]+\/[^/]+?)(\.git)?$/);
        if (match) {
            repoUrl = `https://${process.env.GH_TOKEN}@github.com/${match[1]}.git`;
        }
    } catch (e) {
        // No git remote found
    }

    if (!repoUrl) {
        console.error('❌ Could not detect GitHub repo from git remote');
        console.error('   Make sure you have a git remote set up');
        process.exit(1);
    }

    console.log('🚀 Deploying to GitHub Pages...');
    try {
        execSync(`npx gh-pages -d public -r "${repoUrl}"`, { stdio: 'inherit' });
    } catch (e) {
        console.error('Deploy failed:', e.message);
        process.exit(1);
    }

} else {
    console.log(`claw-devlog - Static blog generator

Usage:
  node index.js build     Build the site to ./public
  node index.js serve     Build and serve locally (port 3000)
  node index.js deploy    Deploy to GitHub Pages (requires GH_TOKEN)

Options:
  serve [port]            Use custom port (default: 3000)
`);
}
