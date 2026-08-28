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
}

export function createUser(user: UserProfile) {
  console.log('Create user ', user);
}

export function loginUser(user: User) {
  console.log('Login user', user);
}

export function changeUserPassword(data: ChangePasswordData) {
  console.log('Change user password with data', data);
}

export function changeUserProfile(profile: UserProfile) {
  console.log('Change user profile with data', profile);
}
