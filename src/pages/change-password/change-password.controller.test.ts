import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ChangePasswordController } from './change-password.controller';
import type { Indexed } from '../../utils/helpers';

interface UpdatePasswordPayload {
  oldPassword: unknown;
  newPassword: unknown;
}

const mockApiMethods = vi.hoisted(() => ({
  updatePassword: vi.fn<(payload: UpdatePasswordPayload) => Promise<unknown>>(),
}));

vi.mock('../profile/profile.api', () => {
  return {
    ProfileAPI: class {
      updatePassword = mockApiMethods.updatePassword;
    },
  };
});

vi.mock('../../decorators/handle-error', () => ({
  handleError:
    () => (_target: unknown, _key: string, descriptor: PropertyDescriptor) =>
      descriptor,
  errorHandlerDefault: vi.fn(),
}));

describe('ChangePasswordController', () => {
  let controller: ChangePasswordController;

  beforeEach(() => {
    controller = new ChangePasswordController();

    mockApiMethods.updatePassword.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully extract password criteria from data array and forward it to api.updatePassword', async () => {
    const mockInputData: Indexed = {
      old_password: 'CurrentSecurePassword123!',
      new_password: 'FreshBrandNewPassword2026$',
      new_password_more: 'FreshBrandNewPassword2026$',
    };
    const mockApiResponse = {
      status: 'OK',
      reason: 'Password updated successfully',
    };

    mockApiMethods.updatePassword.mockResolvedValue(mockApiResponse);

    const result = await controller.updatePassword(mockInputData);

    expect(mockApiMethods.updatePassword).toHaveBeenCalledWith({
      oldPassword: 'CurrentSecurePassword123!',
      newPassword: 'FreshBrandNewPassword2026$',
    });
    expect(mockApiMethods.updatePassword).toHaveBeenCalledTimes(1);

    expect(result).toEqual(mockApiResponse);
  });

  it('should allow runtime exception rejections to bubble up naturally when api.updatePassword fails', async () => {
    const mockInputData: Indexed = {
      old_password: 'WrongPasswordAttempt',
      new_password: 'ValidNewPassword1',
    };
    const mockError = new Error(
      '400 - Incorrect old password verification value'
    );

    mockApiMethods.updatePassword.mockRejectedValue(mockError);

    await expect(controller.updatePassword(mockInputData)).rejects.toThrow(
      '400 - Incorrect old password verification value'
    );
  });
});
