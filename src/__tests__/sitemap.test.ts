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
    expect(content).not.toContain('https://pyexplorer-cd32d.firebaseapp.com');
  });

  it('should include key static routes', () => {
    const content = fs.readFileSync(sitemapPath, 'utf-8');
    const expectedRoutes = [
      '/',
      '/login',
      '/register',
      '/learn',
      '/certificate',
      '/about',
      '/game',
      '/profile',
      '/rewards'
    ];

    expectedRoutes.forEach(route => {
      expect(content).toContain(`<loc>https://pyexplorer.com.br${route}</loc>`);
    });
  });

  it('should include dynamic article routes', () => {
    const content = fs.readFileSync(sitemapPath, 'utf-8');
    // Check for at least one known article from learnData.ts
    expect(content).toContain('/learn/o-que-e-python');
  });

  it('should be valid XML structure', () => {
    const content = fs.readFileSync(sitemapPath, 'utf-8');
    expect(content.trim().startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(content).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(content.trim().endsWith('</urlset>')).toBe(true);
  });
});
