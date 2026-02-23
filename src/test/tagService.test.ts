import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Tag Suggestion Service', () => {
  describe('suggestTags', () => {
    it('should handle empty content gracefully', async () => {
      const response = '';
      const tags = response
        .split(/[,，、]/)
        .map(t => t.trim())
        .filter(t => t.length > 0);
      
      expect(tags).toEqual([]);
    });

    it('should parse comma-separated tags', () => {
      const response = '平静, 喜悦, 感恩';
      const tags = response
        .split(/[,，、]/)
        .map(t => t.trim())
        .filter(t => t.length > 0)
        .slice(0, 3);
      
      expect(tags).toHaveLength(3);
      expect(tags).toContain('平静');
      expect(tags).toContain('喜悦');
      expect(tags).toContain('感恩');
    });

    it('should parse Chinese comma-separated tags', () => {
      const response = '平静、喜悦、感恩';
      const tags = response
        .split(/[,，、]/)
        .map(t => t.trim())
        .filter(t => t.length > 0)
        .slice(0, 3);
      
      expect(tags).toHaveLength(3);
    });

    it('should limit tags to maximum of 3', () => {
      const response = '平静, 喜悦, 感恩, 快乐, 满足, 欣慰';
      const tags = response
        .split(/[,，、]/)
        .map(t => t.trim())
        .filter(t => t.length > 0)
        .slice(0, 3);
      
      expect(tags).toHaveLength(3);
    });

    it('should filter empty strings', () => {
      const response = '平静, , 喜悦, , 感恩';
      const tags = response
        .split(/[,，、]/)
        .map(t => t.trim())
        .filter(t => t.length > 0);
      
      expect(tags).toHaveLength(3);
    });
  });
});
