export const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      order: vi.fn(() => ({
        then: vi.fn((resolve) => resolve({ data: [], error: null })),
      })),
    })),
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(() => ({
          then: vi.fn((resolve) => resolve({ data: {}, error: null })),
        })),
      })),
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            then: vi.fn((resolve) => resolve({ data: {}, error: null })),
          })),
        })),
      })),
    })),
    delete: vi.fn(() => ({
      eq: vi.fn(() => ({
        then: vi.fn((resolve) => resolve({ error: null })),
      })),
    })),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(() => ({ error: null })),
        remove: vi.fn(() => ({ error: null })),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://example.com/test.jpg' } })),
      })),
    },
  })),
  auth: {
    getUser: vi.fn(() => ({
      data: { user: { id: 'test-user-id' } },
    })),
  },
};

export const mockCreateClient = vi.fn(() => ({}));
