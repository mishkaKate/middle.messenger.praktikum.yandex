import { errorHandlerDefault } from '../decorators/handle-error';
import HTTPTransport from '../http/http-transport';
import store from '../store';
import type { Indexed } from '../utils/helpers';

const loginAPIInstance = new HTTPTransport();

export type User = { login: string; password: string };

export type UserProfile = {
  email: string;
  login: string;
  first_name: string;
  second_name: string;
  chat_name: string;
  phone: string;
  password: string;
};

export type ChangePasswordData = {
  login: string;
  old_password: string;
  new_password: string;
  new_password_more: string;
};

export async function signin(data: Indexed) {
  try {
    await loginAPIInstance.post('auth/signin', { data });

    return loginAPIInstance.get('auth/user');
  } catch {
    errorHandlerDefault();
  }
}

export function getUser() {
  try {
    return loginAPIInstance.get('auth/user');
  } catch {
    errorHandlerDefault();
  }
}

export async function logout() {
  try {
    await loginAPIInstance.post('auth/logout');

    store.setState('userProfile', {});
    store.setState('chats', []);
  } catch {
    errorHandlerDefault();
  }
}

export async function checkUser() {
  try {
    if (!store.getState().userProfile) {
      const user = await getUser();

      if (user) {
        store.setState('userProfile', user);
        return true;
      } else {
        return false;
      }
    }

    return true;
  } catch {
    errorHandlerDefault();
  }
}
