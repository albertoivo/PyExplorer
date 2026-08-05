import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Performance Hints in index.html', () => {
  const indexPath = path.resolve(__dirname, '../../index.html');

  it('should include preconnect for Google Fonts', () => {
    const content = fs.readFileSync(indexPath, 'utf-8');
    expect(content).toContain('<link rel="preconnect" href="https://fonts.googleapis.com"');
  });
});
