import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ProfileController } from './profile.page.controller';
import store, { type State } from '../../store';

const mockApiMethods = vi.hoisted(() => ({
  updateAvatar: vi.fn(),
}));

vi.mock('./profile.api', () => {
  return {
    ProfileAPI: class {
      updateAvatar = mockApiMethods.updateAvatar;
    },
  };
});

vi.mock('../../store', () => ({
  default: {
    getState: vi.fn(() => ({})),
    setState: vi.fn(),
  },
}));

vi.mock('../../decorators/handle-error', () => ({
  handleError:
    () => (_target: unknown, _key: string, descriptor: PropertyDescriptor) =>
      descriptor,
  errorHandlerDefault: vi.fn(),
}));

describe('ProfileController', () => {
  let controller: ProfileController;

  beforeEach(() => {
    controller = new ProfileController();
    mockApiMethods.updateAvatar.mockReset();
    vi.mocked(store.getState).mockReset();
    vi.mocked(store.setState).mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully update avatar via API and correctly patch userProfile within the store', async () => {
    const mockFormData = new FormData();
    const mockExistingProfile = {
      id: 123,
      login: 'johndoe',
      avatar: 'old_avatar.png',
    };
    const mockApiResponse = { avatar: 'new_avatar.png' };

    vi.mocked(store.getState).mockReturnValue({
      userProfile: mockExistingProfile,
    } as State);
    mockApiMethods.updateAvatar.mockResolvedValue(mockApiResponse);

    await controller.updateProfileAvatar(mockFormData);

    expect(mockApiMethods.updateAvatar).toHaveBeenCalledWith(mockFormData);
    expect(store.setState).toHaveBeenCalledWith('userProfile', {
      id: 123,
      login: 'johndoe',
      avatar: 'new_avatar.png',
    });
  });
});
