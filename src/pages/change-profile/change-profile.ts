import { Form } from '../../components/form/form';
import { changeUserProfile, type UserProfile } from '../../models/user-model';
import tpl from './change-profile-page.hbs?raw';

export class ChangeProfilePage extends Form<UserProfile> {
  protected template = tpl;

  onSubmit = (res: UserProfile) => {
    changeUserProfile(res);
  };
}
