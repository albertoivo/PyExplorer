const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BASE_URL = 'https://pyexplorer-cd32d.firebaseapp.com';
const TARGET_FILE = path.resolve(__dirname, '../public/sitemap.xml');
const APP_FILE = path.resolve(__dirname, '../src/App.tsx');
const LEARN_DATA_FILE = path.resolve(__dirname, '../src/data/learnData.ts');

// Priority and frequency rules
const RULES = {
    '/': { priority: '1.0', changefreq: 'weekly' },
    '/game': { priority: '0.9', changefreq: 'weekly' },
    '/learn': { priority: '0.9', changefreq: 'weekly' },
    '/learn/:slug': { priority: '0.8', changefreq: 'monthly' },
    'default': { priority: '0.5', changefreq: 'monthly' } // Info/Auth/Protected
};

function getLastModDate(filePath) {
    try {
        const command = `git log -1 --format=%cd --date=format:%Y-%m-%d "${filePath}"`;
        const output = execSync(command, { encoding: 'utf-8' }).trim();
        if (output) return output;

        const stats = fs.statSync(filePath);
        return stats.mtime.toISOString().split('T')[0];
    } catch (e) {
        return new Date().toISOString().split('T')[0];
    }
}

function getArticleSlugs() {
    const content = fs.readFileSync(LEARN_DATA_FILE, 'utf-8');
    const slugRegex = /slug:\s*['"]([^'"]+)['"]/g;
    const slugs = [];
    let match;
    while ((match = slugRegex.exec(content)) !== null) {
        slugs.push(match[1]);
    }
    return slugs;
}

// Improved Regex to handle wrapped components and different quote styles
function parseRoutesAndComponents() {
    const content = fs.readFileSync(APP_FILE, 'utf-8');
    const routes = [];

    // Strategy: Match path first, then look at the element content
    // Supports path="..." or path='...'
    const routeRegex = /<Route\s+path=["']([^"']+)["']\s+element=\{([^}]+)\}/g;
    let match;

    while ((match = routeRegex.exec(content)) !== null) {
        const routePath = match[1];
        const elementContent = match[2];

        // Find the "main" component. It's usually the one that matches *Page
        // or just the inner-most significant component.
        // Heuristic: Look for components ending in "Page" or specific known components.
        const componentMatch = elementContent.match(/<(\w+)/g);
        let componentName = null;

        if (componentMatch) {
            // If multiple components (wrappers), prioritize the one that looks like a page
            // e.g. <ProtectedRoute><GamePage /></ProtectedRoute> -> [ProtectedRoute, GamePage]
            const components = componentMatch.map(s => s.replace('<', ''));
            const pageComponent = components.find(c => c.endsWith('Page'));
            componentName = pageComponent || components[components.length - 1]; // Fallback to last one
        }

        if (componentName) {
            routes.push({ path: routePath, component: componentName });
        }
    }

    return routes;
}

function resolveComponentPath(componentName, appContent) {
    // Check standard import
    let importRegex = new RegExp(`import\\s+(?:\\{\\s*${componentName}\\s*\\}|${componentName})\\s+from\\s+['"]([^'"]+)['"]`);
    let match = importRegex.exec(appContent);
    if (match) return match[1];

    // Check lazy import
    const lazyRegex = new RegExp(`const\\s+${componentName}\\s*=\\s*lazy\\([^)]*import\\(['"]([^'"]+)['"]\\)`);
    match = lazyRegex.exec(appContent);
    if (match) return match[1];

    return null;
}

function generateSitemap() {
    const appContent = fs.readFileSync(APP_FILE, 'utf-8');
    const detectedRoutes = parseRoutesAndComponents();
    const urls = [];

    // 1. Process Detected Routes
    for (const route of detectedRoutes) {
        if (route.path === '/learn/:slug') continue; // Handle separately

        const relativePath = resolveComponentPath(route.component, appContent);
        let lastmod = new Date().toISOString().split('T')[0];

        if (relativePath) {
            // Resolve relative path to absolute file path
            // relativePath is usually like './pages/HomePage'
            let fullPath = path.resolve(path.dirname(APP_FILE), relativePath);

            // Add extension if missing
            if (!fs.existsSync(fullPath) && fs.existsSync(fullPath + '.tsx')) fullPath += '.tsx';
            else if (!fs.existsSync(fullPath) && fs.existsSync(fullPath + '.ts')) fullPath += '.ts';
            else if (!fs.existsSync(fullPath) && fs.existsSync(fullPath + '/index.tsx')) fullPath += '/index.tsx';

            if (fs.existsSync(fullPath)) {
                lastmod = getLastModDate(fullPath);
            }
        }

        const rule = RULES[route.path] || RULES['default'];

        urls.push({
            loc: `${BASE_URL}${route.path}`,
            lastmod,
            changefreq: rule.changefreq,
            priority: rule.priority
        });
    }

    // 2. Dynamic Articles (/learn/:slug)
    const articleLastMod = getLastModDate(LEARN_DATA_FILE);
    const slugs = getArticleSlugs();
    const articleRule = RULES['/learn/:slug'];

    for (const slug of slugs) {
        urls.push({
            loc: `${BASE_URL}/learn/${slug}`,
            lastmod: articleLastMod,
            changefreq: articleRule.changefreq,
            priority: articleRule.priority
        });
    }

    // 3. Generate XML
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    fs.writeFileSync(TARGET_FILE, xml);
    console.log(`Sitemap generated at ${TARGET_FILE} with ${urls.length} URLs`);
}

generateSitemap();
