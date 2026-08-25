import { Form } from '../../components/form/form';
import { Input } from '../../components/input/input';
import { changeUserPassword, type ChangePasswordData } from '../../models/user-model';
import tpl from './change-password-page.hbs?raw';

export class ChangePasswordPage extends Form<ChangePasswordData> {
  protected template = tpl;

  onSubmit = (res: ChangePasswordData) => {
    if (res['new_password'] !== res['new_password_more']) {
      this.children.forEach((ch) => {
        if (ch.element()?.children[0]?.getAttribute('name') === 'new_password_more' && ch instanceof Input) {
          ch.setError('Новые пароли не совпадают')
        }
      })
    } else {
      changeUserPassword(res);
    }

  };
}
