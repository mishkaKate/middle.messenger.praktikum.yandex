import { Form } from '../../components/form/form';
import { createUser, type UserProfile } from '../../models/user-model';
import registrationPageTpl from './registration-page.hbs?raw';

export class RegistrationPage extends Form<UserProfile> {
  protected template = registrationPageTpl;

  onSubmit = (res: UserProfile) => {
    createUser(res);
  };
}
