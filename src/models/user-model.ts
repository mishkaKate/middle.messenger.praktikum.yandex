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

export function createUser(user: UserProfile) {
  console.log(`Create user ${JSON.stringify(user)} `);
}

export function loginUser(user: User) {
  console.log(`Login user login ${user.login} and password ${user.password} `);
}

export function changeUserPassword(user: User) {
  console.log(`Change user password with ${JSON.stringify(user)} `);
}

export function changeUserProfile(profile: UserProfile) {
  console.log(
    `Change user ${profile.login} profile with ${JSON.stringify(profile)} `
  );
}
