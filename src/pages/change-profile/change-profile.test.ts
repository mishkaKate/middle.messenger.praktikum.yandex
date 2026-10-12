import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ChangeProfileController } from './change-profile.controller';
import type { UserProfile } from '../../services/auth';
import type { State } from '../../store';
import { ChangeProfilePage } from './change-profile';

interface MockConnectedComponent {
  Component: new (...args: unknown[]) => {
    onSubmit: (res: UserProfile) => void;
    controller: ChangeProfileController;
  };
  mapper: (state: State) => Record<string, string>;
}

const mockControllerMethods = vi.hoisted(() => ({
  updateProfile: vi.fn<(res: UserProfile) => Promise<unknown>>(),
}));

vi.mock('./change-profile.controller', () => {
  return {
    ChangeProfileController: class {
      updateProfile = mockControllerMethods.updateProfile;
    },
  };
});

vi.mock('../profile/profile-page', () => ({
  mapUserToProps: vi.fn<(state: State) => Record<string, string>>(
    (state: State) => ({
      name: state.userProfile?.first_name ?? '',
    })
  ),
}));

vi.mock('./change-profile-page.hbs?raw', () => ({
  default: '',
}));

vi.mock('../../components/form/form', () => {
  return {
    Form: class<T> {
      protected template: string = '';
      protected validate = vi.fn(() => ({
        isValid: false,
        submitObject: {} as T,
      }));
    },
  };
});

vi.mock('../../utils/connect', () => ({
  connect: <C, M>(component: C, mapper: M) => {
    return { Component: component, mapper } as unknown;
  },
}));

describe('ChangeProfilePage Component', () => {
  const connectedWrapper =
    ChangeProfilePage as unknown as MockConnectedComponent;
  const RawComponent = connectedWrapper.Component;

  let page: InstanceType<MockConnectedComponent['Component']>;

  beforeEach(() => {
    mockControllerMethods.updateProfile.mockReset();
    page = new RawComponent();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('onSubmit() functional mapping pipeline', () => {
    it('should cleanly accept profile data and forward it straight to controller.updateProfile', () => {
      const mockProfile: UserProfile = {
        email: 'developer@example.com',
        login: 'dev_user',
        first_name: 'Alex',
        second_name: 'Code',
        chat_name: 'alexcode',
        phone: '+79998887766',
        password: 'temporaryPassword123',
      };

      page.onSubmit(mockProfile);

      expect(mockControllerMethods.updateProfile).toHaveBeenCalledWith(
        mockProfile
      );
      expect(mockControllerMethods.updateProfile).toHaveBeenCalledTimes(1);
    });
  });

  describe('Component Structure Integration', () => {
    it('should assign a valid instance of ChangeProfileController during element creation', () => {
      expect(page.controller).toBeInstanceOf(ChangeProfileController);
    });

    it('should correctly attach the global mapping configuration strategy during module connection', () => {
      const mapperRef: (state: State) => Record<string, string> =
        connectedWrapper.mapper;
      expect(mapperRef).toBeDefined();
      expect(typeof mapperRef).toBe('function');
    });

    it('should capture its internal raw template source and isolate its string references safely', () => {
      expect(page['template' as keyof typeof page]).toBe('');
    });
  });
});
