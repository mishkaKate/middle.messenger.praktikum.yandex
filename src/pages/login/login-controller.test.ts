import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isApiError } from '../../http/http-transport';
import router from '../../router/router';
import store from '../../store';
import { LoginController } from './login-controller';

const mockApiMethods = vi.hoisted(() => ({
  loginRequest: vi.fn(),
  chatsRequest: vi.fn(),
}));

vi.mock('./login.api', () => ({
  LoginAPI: class {
    request = mockApiMethods.loginRequest;
  },
}));

vi.mock('../main/chats.api', () => ({
  ChatsAPI: class {
    request = mockApiMethods.chatsRequest;
  },
}));

vi.mock('../../router/router', () => ({
  default: {
    go: vi.fn(),
  },
}));

vi.mock('../../store', () => ({
  default: {
    setState: vi.fn(),
    getState: vi.fn(() => ({})),
  },
}));

vi.mock('../../http/http-transport', () => ({
  isApiError: vi.fn(),
}));

vi.mock('../../decorators/handle-error', () => ({
  handleError:
    () => (_target: unknown, _key: string, descriptor: PropertyDescriptor) =>
      descriptor,
  errorHandlerDefault: vi.fn(),
}));

describe('LoginController', () => {
  let controller: LoginController;

  beforeEach(() => {
    controller = new LoginController();

    mockApiMethods.loginRequest.mockReset();
    mockApiMethods.chatsRequest.mockReset();
    vi.mocked(router.go).mockReset();
    vi.mocked(store.setState).mockReset();
    vi.mocked(isApiError).mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully log in the user, populate store state with profile and chats data, then redirect to /messenger', async () => {
    const mockCredentials = { login: 'johndoe', password: 'secure123' };
    const mockUserPayload = { id: 1, login: 'johndoe', name: 'John' };
    const mockChatsPromise = Promise.resolve([{ id: 101, title: 'Main Chat' }]);

    mockApiMethods.loginRequest.mockResolvedValue(mockUserPayload);
    mockApiMethods.chatsRequest.mockReturnValue(mockChatsPromise);

    await controller.singin(mockCredentials);

    expect(mockApiMethods.loginRequest).toHaveBeenCalledWith(mockCredentials);
    expect(mockApiMethods.chatsRequest).toHaveBeenCalledTimes(1);

    expect(store.setState).toHaveBeenCalledWith('userProfile', mockUserPayload);
    expect(store.setState).toHaveBeenCalledWith('chats', mockChatsPromise);
    expect(router.go).toHaveBeenCalledWith('/messenger');
  });

  it('should redirect straight to /messenger without updating store values if API rejects with "User already in system" context', async () => {
    const mockCredentials = { login: 'already_in', password: 'password1' };

    const mock400Error = {
      request: {
        status: 400,
        response: JSON.stringify({ reason: 'User already in system' }),
      },
    };

    mockApiMethods.loginRequest.mockRejectedValue(mock400Error);
    vi.mocked(isApiError).mockReturnValue(true);

    await controller.singin(mockCredentials);

    expect(isApiError).toHaveBeenCalledWith(mock400Error);
    expect(router.go).toHaveBeenCalledWith('/messenger');

    expect(store.setState).not.toHaveBeenCalled();
  });

  it('should allow unexpected errors to bubble up out of the method if error criteria do not match existing system sessions', async () => {
    const mockCredentials = { login: 'bad_user', password: 'password1' };
    const mockDifferentApiError = {
      request: {
        status: 401,
        response: JSON.stringify({ reason: 'Incorrect password' }),
      },
    };

    mockApiMethods.loginRequest.mockRejectedValue(mockDifferentApiError);
    vi.mocked(isApiError).mockReturnValue(true);

    await expect(controller.singin(mockCredentials)).rejects.toEqual(
      mockDifferentApiError
    );

    expect(router.go).not.toHaveBeenCalled();
    expect(store.setState).not.toHaveBeenCalled();
  });

  it('should allow standard JavaScript error exceptions to bubble up outwards if they are not classified as API transport errors', async () => {
    const mockCredentials = { login: 'crash_test', password: 'password1' };
    const generalRuntimeError = new Error(
      'Syntax or parsing breakages occurred unexpectedly'
    );

    mockApiMethods.loginRequest.mockRejectedValue(generalRuntimeError);
    vi.mocked(isApiError).mockReturnValue(false);

    await expect(controller.singin(mockCredentials)).rejects.toThrow(
      'Syntax or parsing breakages occurred unexpectedly'
    );

    expect(router.go).not.toHaveBeenCalled();
    expect(store.setState).not.toHaveBeenCalled();
  });
});
