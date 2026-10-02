import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ChangeProfileController } from './change-profile.controller';

const mockApiMethods = vi.hoisted(() => ({
  update: vi.fn(),
}));

vi.mock('../profile/profile.api', () => {
  return {
    ProfileAPI: class {
      update = mockApiMethods.update;
    },
  };
});

vi.mock('../../decorators/handle-error', () => ({
  handleError:
    () => (_target: unknown, _key: string, descriptor: PropertyDescriptor) =>
      descriptor,
  errorHandlerDefault: vi.fn(),
}));

describe('ChangeProfileController', () => {
  let controller: ChangeProfileController;

  beforeEach(() => {
    controller = new ChangeProfileController();

    mockApiMethods.update.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully forward the profile data payload to api.update and return its response', async () => {
    const mockProfileData = {
      first_name: 'Alex',
      second_name: 'Smith',
      display_name: 'AlexS',
      login: 'alexsmith',
      email: 'alex@example.com',
      phone: '+79991112233',
    };
    const mockApiResponse = { id: 123, ...mockProfileData };

    mockApiMethods.update.mockResolvedValue(mockApiResponse);

    const result = await controller.updateProfile(mockProfileData);

    expect(mockApiMethods.update).toHaveBeenCalledWith(mockProfileData);
    expect(mockApiMethods.update).toHaveBeenCalledTimes(1);

    expect(result).toEqual(mockApiResponse);
  });

  it('should allow errors to bubble up naturally when api.update rejects', async () => {
    const mockProfileData = { login: 'invalid_user' };
    const mockError = new Error('Conflict: Login already taken');

    mockApiMethods.update.mockRejectedValue(mockError);

    await expect(controller.updateProfile(mockProfileData)).rejects.toThrow(
      'Conflict: Login already taken'
    );
  });
});
