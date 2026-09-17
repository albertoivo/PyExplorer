import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Sitemap Integrity', () => {
  const sitemapPath = path.resolve(__dirname, '../../public/sitemap.xml');

  it('should exist', () => {
    expect(fs.existsSync(sitemapPath)).toBe(true);
  });

  it('should have the correct Base URL', () => {
    const content = fs.readFileSync(sitemapPath, 'utf-8');
    expect(content).toContain('https://pyexplorer.com.br');
    expect(content).not.toContain('https://pyexplorer-cd32d.web.app');
  });

  it('should include key static routes across languages', () => {
    const content = fs.readFileSync(sitemapPath, 'utf-8');
    // Default Portuguese homepage
    expect(content).toContain('<loc>https://pyexplorer.com.br</loc>');
    expect(content).toContain('<loc>https://pyexplorer.com.br/en</loc>');
    expect(content).toContain('<loc>https://pyexplorer.com.br/es</loc>');
    expect(content).toContain('<loc>https://pyexplorer.com.br/hi</loc>');

    // Auth pages (login/register) must NOT be in the sitemap (they have noindex)
    expect(content).not.toContain('<loc>https://pyexplorer.com.br/login</loc>');
    expect(content).not.toContain('<loc>https://pyexplorer.com.br/register</loc>');

    const expectedRoutes = [
      '/learn',
      '/about'
    ];

    expectedRoutes.forEach(route => {
      expect(content).toContain(`<loc>https://pyexplorer.com.br${route}</loc>`);
      expect(content).toContain(`<loc>https://pyexplorer.com.br/en${route}</loc>`);
      expect(content).toContain(`<loc>https://pyexplorer.com.br/es${route}</loc>`);
      expect(content).toContain(`<loc>https://pyexplorer.com.br/hi${route}</loc>`);
    });
  });

  it('should include dynamic article routes across languages', () => {
    const content = fs.readFileSync(sitemapPath, 'utf-8');
    expect(content).toContain('<loc>https://pyexplorer.com.br/learn/o-que-e-python</loc>');
    expect(content).toContain('<loc>https://pyexplorer.com.br/en/learn/o-que-e-python</loc>');
    expect(content).toContain('<loc>https://pyexplorer.com.br/es/learn/o-que-e-python</loc>');
    expect(content).toContain('<loc>https://pyexplorer.com.br/hi/learn/o-que-e-python</loc>');
  });

  it('should include reciprocal xhtml:link alternates for all languages', () => {
    const content = fs.readFileSync(sitemapPath, 'utf-8');
    expect(content).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"');
    expect(content).toContain('<xhtml:link rel="alternate" hreflang="pt"');
    expect(content).toContain('<xhtml:link rel="alternate" hreflang="en"');
    expect(content).toContain('<xhtml:link rel="alternate" hreflang="es"');
    expect(content).toContain('<xhtml:link rel="alternate" hreflang="hi"');
    expect(content).toContain('<xhtml:link rel="alternate" hreflang="x-default"');
  });

  it('should be valid XML structure', () => {
    const content = fs.readFileSync(sitemapPath, 'utf-8');
    expect(content.trim().startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(content).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
    expect(content.trim().endsWith('</urlset>'));
  });
});
