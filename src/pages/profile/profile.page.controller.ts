import store from '../../store';
import { ProfileAPI } from '../profile/profile.api';

const api = new ProfileAPI();

export class ProfileController {
    public async updateProfileAvatar(data: FormData) {
        const { avatar } = await api.updateAvatar(data);
        const userProfile = store.getState().userProfile;

        store.setState('userProfile', { ...userProfile, avatar });
    }
}
