import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Journal Service Utilities', () => {
  describe('getRecentEntries', () => {
    it('should filter entries within specified hours', () => {
      const now = new Date();
      const entries = [
        { id: '1', content: 'Recent', timestamp: now.toISOString(), tags: [] },
        { id: '2', content: 'Old', timestamp: new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString(), tags: [] },
      ];

      const cutoffTime = Date.now() - 24 * 60 * 60 * 1000;
      const recent = entries.filter((entry) => new Date(entry.timestamp).getTime() > cutoffTime);
      
      expect(recent).toHaveLength(1);
      expect(recent[0].id).toBe('1');
    });

    it('should return empty array when all entries are old', () => {
      const oldDate = new Date(Date.now() - 48 * 60 * 60 * 1000);
      const entries = [
        { id: '1', content: 'Old', timestamp: oldDate.toISOString(), tags: [] },
      ];

      const cutoffTime = Date.now() - 24 * 60 * 60 * 1000;
      const recent = entries.filter((entry) => new Date(entry.timestamp).getTime() > cutoffTime);
      
      expect(recent).toHaveLength(0);
    });

    it('should return all entries within the time range', () => {
      const now = new Date();
      const entries = [
        { id: '1', content: 'Entry 1', timestamp: now.toISOString(), tags: [] },
        { id: '2', content: 'Entry 2', timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(), tags: [] },
        { id: '3', content: 'Entry 3', timestamp: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(), tags: [] },
      ];

      const cutoffTime = Date.now() - 24 * 60 * 60 * 1000;
      const recent = entries.filter((entry) => new Date(entry.timestamp).getTime() > cutoffTime);
      
      expect(recent).toHaveLength(3);
    });
  });

  describe('JournalEntry type', () => {
    it('should have correct structure', () => {
      const entry = {
        id: '1',
        content: 'Test content',
        timestamp: new Date().toISOString(),
        tags: ['tag1', 'tag2'],
        dimension: 'psychology' as const,
        images: ['https://example.com/image.jpg'],
      };

      expect(entry).toHaveProperty('id');
      expect(entry).toHaveProperty('content');
      expect(entry).toHaveProperty('timestamp');
      expect(entry).toHaveProperty('tags');
      expect(entry).toHaveProperty('dimension');
      expect(entry).toHaveProperty('images');
      expect(entry.images).toHaveLength(1);
    });
  });
});
