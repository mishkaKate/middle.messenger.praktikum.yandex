import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mapUserToProps, ProfilePage } from './profile-page';
import { logout } from '../../services/auth';
import router from '../../router/router';
import { getImageSource } from '../../utils/helpers';
import type { BlockProps, EventListType } from '../../components/block/block';
import type { ProfileController } from './profile.page.controller';
import type { State } from '../../store';

const mockControllerMethods = vi.hoisted(() => ({
  updateProfileAvatar: vi.fn(),
}));

interface MockConnectedComponent {
  Component: new (...args: unknown[]) => {
    controller: ProfileController;
    events: EventListType;
  };
  mapper: (state: State) => Record<string, string>;
}

vi.mock('./profile.page.controller', () => {
  return {
    ProfileController: class {
      updateProfileAvatar = mockControllerMethods.updateProfileAvatar;
    },
  };
});

vi.mock('../../router/router', () => ({
  default: {
    go: vi.fn(),
  },
}));

vi.mock('../../services/auth', () => ({
  logout: vi.fn(),
}));

vi.mock('../../utils/helpers', () => ({
  getImageSource: vi.fn(
    (_avatar: string) => `https://ya-praktikum.tech{avatar}`
  ),
}));

vi.mock('../../components/block/block', () => ({
  Block: class {
    props: BlockProps;
    constructor(props: BlockProps) {
      this.props = props;
    }
  },
}));

vi.mock('../../utils/connect', () => ({
  connect: (
    component: unknown,
    mapper: unknown
  ): { Component: unknown; mapper: unknown } => {
    return { Component: component, mapper };
  },
}));

vi.mock('./profile-page.hbs?raw', () => ({
  default: '',
}));

describe('ProfilePageComponent & mapUserToProps', () => {
  const connectedWrapper = ProfilePage as unknown as MockConnectedComponent;

  const RawComponent = connectedWrapper.Component;

  beforeEach(() => {
    vi.mocked(logout).mockReset();
    vi.mocked(router.go).mockReset();
    mockControllerMethods.updateProfileAvatar.mockReset();
    vi.mocked(getImageSource).mockClear();

    document.body.innerHTML = '';
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('mapUserToProps()', () => {
    it('should map full user state profiles with formatted avatar URL address', () => {
      const mockState = {
        userProfile: {
          first_name: 'Иван',
          second_name: 'Иванов',
          display_name: 'Vanya',
          email: 'vanya@test.ru',
          phone: '79991112233',
          avatar: 'avatar_path.png',
          login: 'vanya_login',
        },
      };

      const props = mapUserToProps(mockState as State);

      expect(props).toEqual({
        name: 'Иван',
        surname: 'Иванов',
        displayName: 'Vanya',
        email: 'vanya@test.ru',
        phone: '79991112233',
        avatar: 'https://ya-praktikum.tech{avatar}',
        login: 'vanya_login',
      });
      expect(getImageSource).toHaveBeenCalledWith('avatar_path.png');
    });

    it('should fallback to default generic favicon layout if userProfile is missing', () => {
      const mockState = { userProfile: undefined };

      const props = mapUserToProps(mockState as State);

      expect(props).toEqual({
        name: '',
        surname: '',
        displayName: '',
        email: '',
        phone: '',
        avatar: '/public/favicon.svg',
        login: '',
      });
    });

    it('should fallback to default generic favicon if getImageSource returns an empty value', () => {
      vi.mocked(getImageSource).mockReturnValue(''); // Хелпер вернул пустоту
      const mockState = {
        userProfile: { avatar: 'broken_link.png' },
      };

      const props = mapUserToProps(mockState as State);
      expect(props.avatar).toBe('/public/favicon.svg');
    });
  });

  describe('DOM Events handling wrappers', () => {
    describe('change events', () => {
      it('should execute updateProfileAvatar if target identity matches avatar input field and form node exists', () => {
        const instance = new RawComponent({});

        const formElement = document.createElement('form');
        formElement.id = 'avatar-form';

        const inputElement = document.createElement('input');
        inputElement.type = 'file';
        inputElement.name = 'avatar';
        inputElement.id = 'avatar';

        formElement.appendChild(inputElement);
        document.body.appendChild(formElement);

        const mockEvent = {
          target: inputElement,
        } as unknown as Event;

        if (instance.events.change) {
          instance.events.change(mockEvent);
        }

        expect(mockControllerMethods.updateProfileAvatar).toHaveBeenCalledWith(
          expect.any(FormData)
        );
        expect(mockControllerMethods.updateProfileAvatar).toHaveBeenCalledTimes(
          1
        );
      });

      it('should skip upload logic if form is missing or is not an instance of HTMLFormElement', () => {
        const instance = new RawComponent({});

        const brokenForm = document.createElement('div');
        brokenForm.id = 'avatar-form';
        document.body.appendChild(brokenForm);

        const inputElement = document.createElement('input');
        inputElement.id = 'avatar';

        const mockEvent = {
          target: inputElement,
        } as unknown as Event;

        if (instance.events.change) {
          instance.events.change(mockEvent);
        }

        expect(
          mockControllerMethods.updateProfileAvatar
        ).not.toHaveBeenCalled();
      });

      it('should completely ignore changes triggered from other elements', () => {
        const instance = new RawComponent({});
        const mockEvent = {
          target: { id: 'username-input' } as unknown,
        } as Event;

        if (instance.events.change) {
          instance.events.change(mockEvent);
        }

        expect(
          mockControllerMethods.updateProfileAvatar
        ).not.toHaveBeenCalled();
      });
    });
  });
});
