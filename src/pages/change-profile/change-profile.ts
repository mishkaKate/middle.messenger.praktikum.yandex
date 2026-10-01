import { Form } from '../../components/form/form';
import type { UserProfile } from '../../services/auth';
import { connect } from '../../utils/connect';
import { mapUserToProps } from '../profile/profile-page';
import tpl from './change-profile-page.hbs?raw';
import { ChangeProfileController } from './change-profile.controller';

class ChangeProfilePageComponent extends Form<UserProfile> {
  protected template = tpl;
  protected controller = new ChangeProfileController();

  onSubmit = (res: UserProfile) => {
    this.controller.updateProfile(res);
  };
}

export const ChangeProfilePage = connect(
  ChangeProfilePageComponent,
  mapUserToProps
);
