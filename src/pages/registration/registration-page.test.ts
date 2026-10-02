import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RegistrationController } from './registration-controller';
import type { UserProfile } from '../../services/auth';
import { RegistrationPage } from './registartion-page';

const mockControllerMethods = vi.hoisted(() => ({
  singup: vi.fn(),
}));

vi.mock('./registration-controller', () => {
  return {
    RegistrationController: class {
      singup = mockControllerMethods.singup;
    },
  };
});

vi.mock('../../components/form/form', () => {
  return {
    Form: class {
      constructor() {}
    },
  };
});

vi.mock('./registration-page.hbs?raw', () => ({
  default: '',
}));

describe('RegistrationPage', () => {
  let page: RegistrationPage;

  beforeEach(() => {
    page = new RegistrationPage();
    mockControllerMethods.singup.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with an instance of RegistrationController', () => {
    expect(page['controller']).toBeInstanceOf(RegistrationController);
  });

  it('should trigger controller.singup when onSubmit is called', () => {
    const mockProfile: UserProfile = {
      email: 'test@example.com',
      login: 'tester',
      first_name: 'John',
      second_name: 'Doe',
      chat_name: 'johndoe',
      phone: '+79991112233',
      password: 'securePassword1',
    };

    page.onSubmit(mockProfile);

    expect(mockControllerMethods.singup).toHaveBeenCalledWith(mockProfile);
    expect(mockControllerMethods.singup).toHaveBeenCalledTimes(1);
  });
});
