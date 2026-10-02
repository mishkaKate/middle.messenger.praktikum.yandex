import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RegistrationController } from './registration-controller';
import router from '../../router/router';

const mockApiMethods = vi.hoisted(() => ({
  create: vi.fn(),
}));

vi.mock('./registration.api', () => {
  return {
    ReagistartionAPI: class {
      create = mockApiMethods.create;
    },
  };
});

vi.mock('../../router/router', () => ({
  default: {
    go: vi.fn(),
  },
}));

vi.mock('../../decorators/handle-error', () => ({
  handleError:
    () => (_target: unknown, _key: string, descriptor: PropertyDescriptor) =>
      descriptor,
  errorHandlerDefault: vi.fn(),
}));

describe('RegistrationController', () => {
  let controller: RegistrationController;

  beforeEach(() => {
    controller = new RegistrationController();
    mockApiMethods.create.mockReset();
    vi.mocked(router.go).mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully call api.create with data and navigate to /messenger', async () => {
    const mockUserData = { login: 'newuser', password: 'password123' };
    mockApiMethods.create.mockResolvedValue({}); // Имитируем успешный ответ от API

    await controller.singup(mockUserData);

    expect(mockApiMethods.create).toHaveBeenCalledWith(mockUserData);
    expect(mockApiMethods.create).toHaveBeenCalledTimes(1);
    expect(router.go).toHaveBeenCalledWith('/messenger');
    expect(router.go).toHaveBeenCalledTimes(1);
  });

  it('should allow errors to bubble up if api.create rejects (handled by decorator at runtime)', async () => {
    const mockError = new Error('User already exists');
    mockApiMethods.create.mockRejectedValue(mockError);

    await expect(controller.singup({ email: 'err@test.com' })).rejects.toThrow(
      'User already exists'
    );
    expect(router.go).not.toHaveBeenCalled();
  });
});
