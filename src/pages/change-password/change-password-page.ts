import { Form } from '../../components/form/form';
import { Input } from '../../components/input/input';
import type { State } from '../../store';
import { connect } from '../../utils/connect';
import tpl from './change-password-page.hbs?raw';
import { ChangePasswordController } from './change-password.controller';

export type ChangePasswordData = {
  login: string;
  old_password: string;
  new_password: string;
  new_password_more: string;
};
class ChangePasswordPageComponent extends Form<ChangePasswordData> {
  protected template = tpl;
  protected controller = new ChangePasswordController();

  onSubmit = (res: ChangePasswordData) => {
    if (res['new_password'] !== res['new_password_more']) {
      this.children.forEach((ch) => {
        if (
          ch.element()?.children[0]?.getAttribute('name') ===
            'new_password_more' &&
          ch instanceof Input
        ) {
          ch.setError('Новые пароли не совпадают');
        }
      });
    } else {
      this.controller.updatePassword(res);
    }
  };
}

function mapStateToProps(state: State) {
  const { login } = state.userProfile || {};

  return {
    login: login || '',
  };
}

export const ChangePasswordPage = connect(
  ChangePasswordPageComponent,
  mapStateToProps
);
