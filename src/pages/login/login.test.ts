import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import router from '../../router/router';
import type { User } from '../../services/auth';
import { LoginPage } from './login';

const mockControllerMethods = vi.hoisted(() => ({
  singin: vi.fn(),
}));

vi.mock('./login-controller', () => {
  return {
    LoginController: class {
      singin = mockControllerMethods.singin;
    },
  };
});

vi.mock('../../router/router', () => ({
  default: {
    go: vi.fn(),
  },
}));

vi.mock('../../components/form/form', () => {
  return {
    Form: class {
      constructor() {}
      validate = vi.fn(() => ({ isValid: false, submitObject: {} }));
    },
  };
});

vi.mock('./login.hbs?raw', () => ({
  default: '',
}));

describe('LoginPage Component', () => {
  let page: LoginPage;

  beforeEach(() => {
    mockControllerMethods.singin.mockReset();
    vi.mocked(router.go).mockReset();

    page = new LoginPage();
    vi.mocked(page.validate).mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('onSubmit() execution proxy', () => {
    it('should forward user credentials straight to controller.singin method when called directly', () => {
      const mockUser: User = { login: 'alex_doe', password: 'password123' };

      page.onSubmit(mockUser);

      expect(mockControllerMethods.singin).toHaveBeenCalledWith(mockUser);
      expect(mockControllerMethods.singin).toHaveBeenCalledTimes(1);
    });
  });

  describe('Submit Events (`submit`) & Validation Handling', () => {
    it('should invoke onSubmit with parsed credentials if the form validation validates successfully', () => {
      const mockUser: User = {
        login: 'valid_user',
        password: 'securePassword',
      };
      const preventDefaultSpy = vi.fn();

      vi.mocked(page.validate).mockReturnValue({
        isValid: true,
        submitObject: mockUser,
      });

      const onSubmitSpy = vi.spyOn(page, 'onSubmit');

      const mockEvent = {
        preventDefault: preventDefaultSpy,
      } as unknown as Event;

      page['events'].submit(mockEvent);

      expect(preventDefaultSpy).toHaveBeenCalledTimes(1);
      expect(page.validate).toHaveBeenCalledTimes(1);
      expect(onSubmitSpy).toHaveBeenCalledWith(mockUser);
      expect(mockControllerMethods.singin).toHaveBeenCalledWith(mockUser);
    });

    it('should prevent default form behavior but block controller submission if form validation checks return false', () => {
      const preventDefaultSpy = vi.fn();

      vi.mocked(page.validate).mockReturnValue({
        isValid: false,
        submitObject: {},
      });

      const onSubmitSpy = vi.spyOn(page, 'onSubmit');

      const mockEvent = {
        preventDefault: preventDefaultSpy,
      } as unknown as Event;

      page['events'].submit(mockEvent);

      expect(preventDefaultSpy).toHaveBeenCalledTimes(1);
      expect(page.validate).toHaveBeenCalledTimes(1);
      expect(onSubmitSpy).not.toHaveBeenCalled();
      expect(mockControllerMethods.singin).not.toHaveBeenCalled();
    });
  });

  describe('Click Events (`click`) & Navigation Redirects', () => {
    it('should completely ignore navigation routing workflows if click targets do not possess a sign-up identifier identity', () => {
      const mockEvent = {
        target: {
          id: 'unrelated-login-submit-button-layout',
        } as unknown,
      } as Event;

      page['events'].click(mockEvent);

      expect(router.go).not.toHaveBeenCalled();
    });

    it('should safely bypass click processing cycles if target is missing or not a structural HTMLElement instance', () => {
      const mockEvent = {
        target: null,
      } as unknown as Event;

      expect(() => page['events'].click(mockEvent)).not.toThrow();
      expect(router.go).not.toHaveBeenCalled();
    });
  });
});
