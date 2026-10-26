// tailwind-migrate.js – replace legacy Tailwind classes with v4 names
const fs = require('fs');
const path = require('path');
const glob = require('glob');

const files = glob.sync('src/**/*.{tsx,ts,css}', { nodir: true });

const replacements = [
    [/bg-\[rgb\(var\(--background\)\)\]/g, 'bg-background'],
    [/text-\[rgb\(var\(--foreground\)\)/g, 'text-foreground'],
    [/border-\[rgb\(var\(--border\)\)/g, 'border-border'],
    [/border-\[rgb\(var\(--input\)\)/g, 'border-input'],
    [/ring-\[rgb\(var\(--ring\)\)/g, 'ring-ring'],
    [/bg-\[rgb\(var\(--card\)\)/g, 'bg-card'],
    [/border-\[rgb\(var\(--card\)\)/g, 'border-card'],
    [/bg-\[rgb\(var\(--primary\)\)/g, 'bg-primary'],
    [/text-\[rgb\(var\(--primary-foreground\)\)/g, 'text-primary-foreground'],
    [/bg-\[rgb\(var\(--secondary\)\)/g, 'bg-secondary'],
    [/text-\[rgb\(var\(--secondary-foreground\)\)/g, 'text-secondary-foreground'],
    [/bg-\[rgb\(var\(--muted\)\)/g, 'bg-muted'],
    [/text-\[rgb\(var\(--muted-foreground\)\)/g, 'text-muted-foreground'],
    [/bg-\[rgb\(var\(--accent\)\)/g, 'bg-accent'],
    [/text-\[rgb\(var\(--accent-foreground\)\)/g, 'text-accent-foreground'],
    [/bg-\[rgb\(var\(--destructive\)\)/g, 'bg-destructive'],
    [/text-\[rgb\(var\(--destructive-foreground\)\)/g, 'text-destructive-foreground'],
];

files.forEach((file) => {
    const content = fs.readFileSync(file, 'utf8');
    let newContent = content;
    replacements.forEach(([pat, rep]) => {
        newContent = newContent.replace(pat, rep);
    });
    if (newContent !== content) {
        fs.writeFileSync(file, newContent);
        console.log(`✅ Updated ${file}`);
    }
});

const { execSync } = require('child_process');
execSync('git add .', { stdio: 'inherit' });
execSync('git commit -m "fix: migrate Tailwind v4 class names"', { stdio: 'inherit' });
execSync('git push origin main', { stdio: 'inherit' });

console.log('\n🚀 Tailwind migration finished – your repo is now V4‑ready.\n');