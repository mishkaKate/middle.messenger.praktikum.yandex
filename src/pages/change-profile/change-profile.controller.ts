import type { Indexed } from '../../utils/helpers';
import { ProfileAPI } from '../profile/profile.api';

const api = new ProfileAPI();

export class ChangeProfileController {
  public async updateProfile(profile: Indexed) {
    return api.update(profile);
  }
}
