import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { signin, getUser, logout, checkUser } from './auth';
import { errorHandlerDefault } from '../decorators/handle-error';
import store, { type State } from '../store';

const mockHttpMethods = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
}));

vi.mock('../http/http-transport', () => {
  return {
    default: class {
      get = mockHttpMethods.get;
      post = mockHttpMethods.post;
      put = mockHttpMethods.put;
      delete = mockHttpMethods.delete;
    },
  };
});

vi.mock('../store', () => ({
  default: {
    getState: vi.fn(() => ({})),
    setState: vi.fn(),
  },
}));

vi.mock('../decorators/handle-error', () => ({
  errorHandlerDefault: vi.fn(),
}));

describe('Auth Services', () => {
  beforeEach(() => {
    mockHttpMethods.get.mockReset();
    mockHttpMethods.post.mockReset();
    vi.mocked(store.getState).mockReset();
    vi.mocked(store.setState).mockReset();
    vi.mocked(errorHandlerDefault).mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('signin()', () => {
    const mockCredentials = { login: 'testuser', password: 'password123' };
    const mockUserData = { id: 1, login: 'testuser', email: 'test@test.com' };

    it('should successfully post signin data and return fetched user profile', async () => {
      mockHttpMethods.post.mockResolvedValue({});
      mockHttpMethods.get.mockResolvedValue(mockUserData);

      const result = await signin(mockCredentials);

      expect(mockHttpMethods.post).toHaveBeenCalledWith('auth/signin', {
        data: mockCredentials,
      });
      expect(mockHttpMethods.get).toHaveBeenCalledWith('auth/user');
      expect(result).toEqual(mockUserData);
    });

    it('should trigger errorHandlerDefault if network post request rejects', async () => {
      const mockError = new Error('Network Error');
      mockHttpMethods.post.mockRejectedValue(mockError);

      await signin(mockCredentials);

      expect(errorHandlerDefault).toHaveBeenCalled();
      expect(mockHttpMethods.get).not.toHaveBeenCalled();
    });
  });

  describe('getUser()', () => {
    it('should dispatch GET request and return user payload', async () => {
      const mockUserData = { id: 777, login: 'active_user' };
      mockHttpMethods.get.mockResolvedValue(mockUserData);

      const result = await getUser();

      expect(mockHttpMethods.get).toHaveBeenCalledWith('auth/user');
      expect(result).toEqual(mockUserData);
    });
  });

  describe('logout()', () => {
    it('should successfully trigger clear requests and reset store collections', async () => {
      mockHttpMethods.post.mockResolvedValue({});

      await logout();

      expect(mockHttpMethods.post).toHaveBeenCalledWith('auth/logout');
      expect(store.setState).toHaveBeenCalledWith('userProfile', {});
      expect(store.setState).toHaveBeenCalledWith('chats', []);
    });

    it('should fall into error handler wrapper without clearing store states if request fails', async () => {
      const mockError = new Error('Logout failed');
      mockHttpMethods.post.mockRejectedValue(mockError);

      await logout();

      expect(errorHandlerDefault).toHaveBeenCalled();
      expect(store.setState).not.toHaveBeenCalled();
    });
  });

  describe('checkUser()', () => {
    it('should instantly return true if userProfile state is already present in store', async () => {
      vi.mocked(store.getState).mockReturnValue({
        userProfile: { id: 1 },
      } as unknown as State);

      const result = await checkUser();

      expect(result).toBe(true);
      expect(mockHttpMethods.get).not.toHaveBeenCalled();
      expect(store.setState).not.toHaveBeenCalled();
    });

    it('should fetch user from API, update store, and return true if store profile is missing', async () => {
      vi.mocked(store.getState).mockReturnValue({
        userProfile: undefined,
      } as State);

      const mockFetchedUser = { id: 55, name: 'Lazy Loader' };
      mockHttpMethods.get.mockResolvedValue(mockFetchedUser);

      const result = await checkUser();

      expect(mockHttpMethods.get).toHaveBeenCalledWith('auth/user');
      expect(store.setState).toHaveBeenCalledWith(
        'userProfile',
        mockFetchedUser
      );
      expect(result).toBe(true);
    });

    it('should return false if store profile is missing and API returns empty payload', async () => {
      vi.mocked(store.getState).mockReturnValue({
        userProfile: undefined,
      } as State);
      mockHttpMethods.get.mockResolvedValue(null);

      const result = await checkUser();

      expect(mockHttpMethods.get).toHaveBeenCalledWith('auth/user');
      expect(store.setState).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('should run catch flow through error handler block if lookup checks crash', async () => {
      vi.mocked(store.getState).mockReturnValue({
        userProfile: undefined,
      } as State);
      const mockError = new Error('Database connection lost');
      mockHttpMethods.get.mockRejectedValue(mockError);

      await checkUser();

      expect(errorHandlerDefault).toHaveBeenCalled();
    });
  });
});
