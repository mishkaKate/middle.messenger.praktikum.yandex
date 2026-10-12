import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ChangePasswordPage } from './change-password-page';
import { ChangePasswordController } from './change-password.controller';
import { Input } from '../../components/input/input';
import type { ChangePasswordData } from './change-password-page';
import type { State } from '../../store';

interface MockConnectedComponent {
  Component: new (...args: unknown[]) => {
    onSubmit: (res: ChangePasswordData) => void;
    controller: ChangePasswordController;
    children: unknown[];
  };
  mapper: (state: State) => Record<string, string>;
}

const mockControllerMethods = vi.hoisted(() => ({
  updatePassword: vi.fn<(res: ChangePasswordData) => Promise<unknown>>(),
}));

vi.mock('./change-password.controller', () => {
  return {
    ChangePasswordController: class {
      updatePassword = mockControllerMethods.updatePassword;
    },
  };
});

const mockInputMethods = vi.hoisted(() => ({
  setError: vi.fn<(errorText: string) => void>(),
}));

vi.mock('../../components/input/input', () => {
  const MockInputClass = class {
    private _element: HTMLElement;
    constructor({ name }: { name: string }) {
      this._element = document.createElement('div');
      const innerInput = document.createElement('input');
      innerInput.setAttribute('name', name);
      this._element.appendChild(innerInput);
    }
    element() {
      return this._element;
    }
    setError = mockInputMethods.setError;
  };
  return {
    Input: MockInputClass,
  };
});

vi.mock('../../components/form/form', () => {
  return {
    Form: class {
      protected template: string = '';
      public children: unknown[] = [];
      constructor(..._args: unknown[]) {}
    },
  };
});

vi.mock('../../utils/connect', () => ({
  connect: <C, M>(component: C, mapper: M) => {
    return { Component: component, mapper } as unknown;
  },
}));

vi.mock('./change-password-page.hbs?raw', () => ({
  default: '',
}));

describe('ChangePasswordPage Component', () => {
  const connectedWrapper =
    ChangePasswordPage as unknown as MockConnectedComponent;
  const RawComponent = connectedWrapper.Component;
  let page: InstanceType<MockConnectedComponent['Component']>;

  beforeEach(() => {
    mockControllerMethods.updatePassword.mockReset();
    mockInputMethods.setError.mockReset();
    document.body.innerHTML = '';
    page = new RawComponent();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('onSubmit() validation & mapping loops', () => {
    it('should forward data straight to controller.updatePassword if the new passwords match perfectly', () => {
      const mockValidData: ChangePasswordData = {
        login: 'testuser',
        old_password: 'OldPassword123!',
        new_password: 'MatchingPassword2026$',
        new_password_more: 'MatchingPassword2026$',
      };

      page.onSubmit(mockValidData);

      expect(mockControllerMethods.updatePassword).toHaveBeenCalledWith(
        mockValidData
      );
      expect(mockControllerMethods.updatePassword).toHaveBeenCalledTimes(1);
      expect(mockInputMethods.setError).not.toHaveBeenCalled();
    });

    it('should intercept operations and assign a validation error onto the input instance if new passwords mismatch', () => {
      const mockInvalidData: ChangePasswordData = {
        login: 'testuser',
        old_password: 'OldPassword123!',
        new_password: 'FirstNewPassword123!',
        new_password_more: 'MismatchingTypoField456!',
      };

      const correctInputNode = new Input({ name: 'new_password' });
      const mismatchInputNode = new Input({ name: 'new_password_more' });

      page.children = [correctInputNode, mismatchInputNode];
      page.onSubmit(mockInvalidData);

      expect(mockControllerMethods.updatePassword).not.toHaveBeenCalled();
      expect(mockInputMethods.setError).toHaveBeenCalledWith(
        'Новые пароли не совпадают'
      );
      expect(mockInputMethods.setError).toHaveBeenCalledTimes(1);
    });

    it('should gracefully bypass error setting loops if children configurations are not explicit instances of Input', () => {
      const mockInvalidData: ChangePasswordData = {
        login: 'testuser',
        old_password: 'OldPassword123!',
        new_password: 'FirstNewPassword123!',
        new_password_more: 'MismatchingTypoField456!',
      };

      const fakeInputNode = {
        element: () => {
          const container = document.createElement('div');
          const childInput = document.createElement('input');
          childInput.setAttribute('name', 'new_password_more');
          container.appendChild(childInput);
          return container;
        },
        setError: vi.fn(),
      };

      page.children = [fakeInputNode];
      page.onSubmit(mockInvalidData);

      expect(mockControllerMethods.updatePassword).not.toHaveBeenCalled();
      expect(fakeInputNode.setError).not.toHaveBeenCalled();
      expect(mockInputMethods.setError).not.toHaveBeenCalled();
    });
  });

  describe('mapStateToProps() logic profile checks', () => {
    it('should map the user profile login string parameter effectively', () => {
      const mockState: State = {
        userProfile: {
          id: 1,
          email: 'test@example.com',
          login: 'authenticated_user',
          first_name: 'John',
          second_name: 'Doe',
          display_name: 'jd',
          phone: '+79998887766',
          avatar: '',
        },
        chats: [],
        messages: [],
      };

      const mappedProps = connectedWrapper.mapper(mockState);

      expect(mappedProps).toEqual({
        login: 'authenticated_user',
      });
    });

    it('should fallback onto clean string defaults if user data structures are missing inside the store', () => {
      const emptyState: State = {
        userProfile: undefined,
        chats: [],
        messages: [],
      };

      const mappedProps = connectedWrapper.mapper(emptyState);

      expect(mappedProps).toEqual({
        login: '',
      });
    });
  });
});
