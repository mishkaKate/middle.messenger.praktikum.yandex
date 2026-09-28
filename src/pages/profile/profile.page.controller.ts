import {
  errorHandlerDefault,
  handleError,
} from '../../decorators/handle-error';
import store from '../../store';
import { ProfileAPI } from '../profile/profile.api';

const api = new ProfileAPI();

export class ProfileController {
  @handleError(errorHandlerDefault)
  public async updateProfileAvatar(data: FormData) {
    const { avatar } = await api.updateAvatar(data);
    const userProfile = store.getState().userProfile;

    store.setState('userProfile', { ...userProfile, avatar });
  }
}
