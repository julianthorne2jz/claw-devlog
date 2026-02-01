#!/usr/bin/env node
const { execSync } = require('child_process');
const path = require('path');

const args = process.argv.slice(2);
const command = args[0];

if (command === 'build') {
    require('./build.js');
} else if (command === 'deploy') {
    console.log('🚀 Deploying to GitHub Pages...');
    try {
        // Simple GHPush strategy
        execSync('npx gh-pages -d public -r https://$GH_TOKEN@github.com/julianthorne2jz/devlog.git', { stdio: 'inherit' });
    } catch (e) {
        console.error('Deploy failed:', e.message);
    }
} else {
    console.log('Usage: claw-devlog [build|deploy]');
}
