import { Form } from '../../components/form/form';
import router from '../../router/router';
import type { User } from '../../services/auth';
import { LoginController } from './login-controller';
import tpl from './login.hbs?raw';

export class LoginPage extends Form<User> {
  protected template = tpl;
  protected controller = new LoginController();

  onSubmit = (res: User) => {
    this.controller.singin(res);
  };

  protected events = {
    submit: (e: Event) => {
      e.preventDefault();
      const { isValid, submitObject } = this.validate();

      if (isValid) {
        this.onSubmit(submitObject as User);
      }
    },
    click: (e: Event) => {
      if (e.target instanceof HTMLElement && e.target.id === 'sign-up-button') {
        router.go('/sign-up');
      }
    },
  };
}
