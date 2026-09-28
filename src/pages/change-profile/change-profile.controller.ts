import {
  handleError,
  errorHandlerDefault,
} from '../../decorators/handle-error';
import type { Indexed } from '../../utils/helpers';
import { ProfileAPI } from '../profile/profile.api';

const api = new ProfileAPI();

export class ChangeProfileController {
  @handleError(errorHandlerDefault)
  public async updateProfile(profile: Indexed) {
    return api.update(profile);
  }
}
