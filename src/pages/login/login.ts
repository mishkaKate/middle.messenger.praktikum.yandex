import { Form } from '../../components/form/form';
import { loginUser, type User } from '../../models/user-model';
import tpl from './login.hbs?raw';

export class LoginPage extends Form<User> {
  protected template = tpl;

  onSubmit = (res: User) => {
    loginUser(res);
  };
}
