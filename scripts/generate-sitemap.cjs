const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BASE_URL = 'https://pyexplorer.com.br';
const TARGET_FILE = path.resolve(__dirname, '../public/sitemap.xml');
const APP_FILE = path.resolve(__dirname, '../src/App.tsx');
const LEARN_DATA_FILE = path.resolve(__dirname, '../src/data/learnData.ts');

const LANGUAGES = ['pt', 'en', 'es', 'hi'];

// Priority and frequency rules
const RULES = {
    '/': { priority: '1.0', changefreq: 'weekly' },
    '/learn': { priority: '0.9', changefreq: 'weekly' },
    '/learn/:slug': { priority: '0.8', changefreq: 'monthly' },
    'default': { priority: '0.5', changefreq: 'monthly' }
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
    const slugRegex = /["']?slug["']?:\s*['"]([^'"]+)['"]/g;
    const slugs = [];
    let match;
    while ((match = slugRegex.exec(content)) !== null) {
        slugs.push(match[1]);
    }
    return slugs;
}

function getStaticRoutes() {
    return [
        { path: '/', component: 'HomePage' },
        { path: '/learn', component: 'LearnPage' },
        { path: '/about', component: 'AboutPage' },
        { path: '/python-para-criancas', component: 'HomePage' },
        { path: '/aprender-python-jogando', component: 'HomePage' }
    ];
}

function resolveComponentPath(componentName, appContent) {
    let importRegex = new RegExp(`import\\s+(?:\\{\\s*${componentName}\\s*\\}|${componentName})\\s+from\\s+['"]([^'"]+)['"]`);
    let match = importRegex.exec(appContent);
    if (match) return match[1];

    const lazyRegex = new RegExp(`const\\s+${componentName}\\s*=\\s*lazy\\([\\s\\S]*?import\\(['"]([^'"]+)['"]\\)`);
    match = lazyRegex.exec(appContent);
    if (match) return match[1];

    return null;
}

function getAlternates(cleanPath) {
    const ptUrl = cleanPath === '/' ? BASE_URL : `${BASE_URL}${cleanPath}`;
    const enUrl = `${BASE_URL}/en${cleanPath === '/' ? '' : cleanPath}`;
    const esUrl = `${BASE_URL}/es${cleanPath === '/' ? '' : cleanPath}`;
    const hiUrl = `${BASE_URL}/hi${cleanPath === '/' ? '' : cleanPath}`;

    return [
        { hreflang: 'pt', href: ptUrl },
        { hreflang: 'en', href: enUrl },
        { hreflang: 'es', href: esUrl },
        { hreflang: 'hi', href: hiUrl },
        { hreflang: 'x-default', href: ptUrl }
    ];
}

function getLocalizedUrl(cleanPath, lang) {
    if (lang === 'pt') {
        return cleanPath === '/' ? BASE_URL : `${BASE_URL}${cleanPath}`;
    }
    return `${BASE_URL}/${lang}${cleanPath === '/' ? '' : cleanPath}`;
}

function generateSitemap() {
    const appContent = fs.readFileSync(APP_FILE, 'utf-8');
    const staticRoutes = getStaticRoutes();
    const cleanPages = [];

    // 1. Process Static Routes
    for (const route of staticRoutes) {
        const relativePath = resolveComponentPath(route.component, appContent);
        let lastmod = new Date().toISOString().split('T')[0];

        if (relativePath) {
            let fullPath = path.resolve(path.dirname(APP_FILE), relativePath);
            if (!fs.existsSync(fullPath) && fs.existsSync(fullPath + '.tsx')) fullPath += '.tsx';
            else if (!fs.existsSync(fullPath) && fs.existsSync(fullPath + '.ts')) fullPath += '.ts';
            else if (!fs.existsSync(fullPath) && fs.existsSync(fullPath + '/index.tsx')) fullPath += '/index.tsx';

            if (fs.existsSync(fullPath)) {
                lastmod = getLastModDate(fullPath);
            }
        }

        const rule = RULES[route.path] || RULES['default'];
        cleanPages.push({
            cleanPath: route.path,
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
        cleanPages.push({
            cleanPath: `/learn/${slug}`,
            lastmod: articleLastMod,
            changefreq: articleRule.changefreq,
            priority: articleRule.priority
        });
    }

    // 3. Build Multilingual URLs with Reciprocal Alternates
    const urls = [];
    for (const page of cleanPages) {
        const alternates = getAlternates(page.cleanPath);

        for (const lang of LANGUAGES) {
            urls.push({
                loc: getLocalizedUrl(page.cleanPath, lang),
                alternates,
                lastmod: page.lastmod,
                changefreq: page.changefreq,
                priority: page.priority
            });
        }
    }

    // 4. Generate XML
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
${u.alternates.map(alt => `    <xhtml:link rel="alternate" hreflang="${alt.hreflang}" href="${alt.href}" />`).join('\n')}
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;

    fs.writeFileSync(TARGET_FILE, xml);
    console.log(`Sitemap generated at ${TARGET_FILE} with ${urls.length} multilingual URLs`);
}

generateSitemap();
