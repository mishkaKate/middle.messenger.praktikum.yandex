import { BaseAPI } from '../../api';
import HTTPTransport from '../../http/http-transport';
import type { Indexed } from '../../utils/helpers';

const profileAPIInstance = new HTTPTransport();

export type Profile = {
  avatar: string;
};

export class ProfileAPI extends BaseAPI {
  async update(data: Indexed) {
    profileAPIInstance.put('user/profile', { data });
  }

  async updatePassword(data: Indexed) {
    profileAPIInstance.put('user/password', { data });
  }

  async updateAvatar(data: FormData): Promise<Profile> {
    const profile = await profileAPIInstance.put('user/profile/avatar', {
      data,
    });

    return profile as Profile;
  }
}
