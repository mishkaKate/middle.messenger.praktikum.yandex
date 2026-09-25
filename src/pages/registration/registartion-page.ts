import { Form } from '../../components/form/form';
import type { UserProfile } from '../../services/auth';
import { RegistrationController } from './registration-controller';
import registrationPageTpl from './registration-page.hbs?raw';

export class RegistrationPage extends Form<UserProfile> {
  protected template = registrationPageTpl;
  protected controller = new RegistrationController();

  onSubmit = (res: UserProfile) => {
    this.controller.singup(res);
  };
}
