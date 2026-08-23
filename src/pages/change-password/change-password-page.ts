import { Form } from '../../components/form/form';
import { changeUserPassword, type User } from '../../models/user-model';
import tpl from './change-password-page.hbs?raw';

export class ChangePasswordPage extends Form<User> {
  protected template = tpl;

  onSubmit = (res: User) => {
    changeUserPassword(res);
  };
}
