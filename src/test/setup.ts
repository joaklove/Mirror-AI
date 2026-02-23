import '@testing-library/jest-dom';

vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useNavigate: () => vi.fn(),
  useLocation: () => vi.fn(),
  Link: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id', email: 'test@example.com' },
    loading: false,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
  }),
}));

vi.mock('@/services/journalService', () => ({
  journalService: {
    getEntries: vi.fn().mockResolvedValue([]),
    createEntry: vi.fn().mockResolvedValue({ id: 'test-id' }),
    updateEntry: vi.fn().mockResolvedValue({ id: 'test-id' }),
    deleteEntry: vi.fn().mockResolvedValue(undefined),
    getRecentEntries: vi.fn().mockReturnValue([]),
    uploadImage: vi.fn().mockResolvedValue('https://example.com/image.jpg'),
    deleteImage: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('@/services/tagService', () => ({
  tagService: {
    suggestTags: vi.fn().mockResolvedValue(['平静', '喜悦']),
  },
}));

vi.mock('@/services/quickAnalysisService', () => ({
  quickAnalysisService: {
    analyze: vi.fn().mockResolvedValue('这是一段温暖的分析。'),
  },
}));

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

window.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
