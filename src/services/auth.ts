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
  await loginAPIInstance.post('auth/signin', { data });

  return loginAPIInstance.get('auth/user');
}

export function getUser() {
  return loginAPIInstance.get('auth/user');
}

export async function logout() {
  await loginAPIInstance.post('auth/logout');

  store.setState('userProfile', {});
  store.setState('chats', []);
}

export async function checkUser() {
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
}
