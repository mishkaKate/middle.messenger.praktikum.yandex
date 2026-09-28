import {
  handleError,
  errorHandlerDefault,
} from '../../decorators/handle-error';
import type { Indexed } from '../../utils/helpers';
import { ProfileAPI } from '../profile/profile.api';

const api = new ProfileAPI();

export class ChangePasswordController {
  @handleError(errorHandlerDefault)
  public async updatePassword(data: Indexed) {
    return api.updatePassword({
      oldPassword: data.old_password,
      newPassword: data.new_password,
    });
  }
}
