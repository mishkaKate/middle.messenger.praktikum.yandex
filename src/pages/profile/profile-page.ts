import { Block, type BlockOwnProps } from '../../components/block/block';
import router from '../../router/router';
import { logout } from '../../services/auth';
import type { State } from '../../store';
import { connect } from '../../utils/connect';
import { getImageSource } from '../../utils/helpers';
import tpl from './profile-page.hbs?raw';
import { ProfileController } from './profile.page.controller';

type Props = BlockOwnProps & {
  avatar: string;
  name: string;
  surname: string;
  phone: string;
  email: string;
};

class ProfilePageComponent extends Block<Props> {
  static componentName = 'ProfilePage';
  protected template = tpl;
  protected controller = new ProfileController();

  protected events = {
    click: (e: Event) => {
      if (!(e.target instanceof HTMLElement)) {
        return;
      }

      const target = e.target?.id;
      switch (target) {
        case 'logout-button':
          logout();
          router.go('/');
          break;
        case 'profile-change':
        case 'password-change':
          router.go(`/${target}`);
          break;
        case 'chats-button':
          router.go('/messenger');
          break;
      }
    },

    change: (e: Event) => {
      if (!(e.target instanceof HTMLElement)) {
        return;
      }
      if (e.target?.id === 'avatar') {
        const form = document.getElementById('avatar-form');

        if (form instanceof HTMLFormElement) {
          const formData = new FormData(form);
          this.controller.updateProfileAvatar(formData);
        }
      }
    },
  };
}

export function mapUserToProps(state: State) {
  const { first_name, second_name, email, phone, avatar, login } =
    state.userProfile || {};

  return {
    name: first_name || '',
    surname: second_name || '',
    email: email || '',
    phone: phone || '',
    avatar: avatar
      ? getImageSource(avatar) || '/public/favicon.svg'
      : '/public/favicon.svg',
    login: login || '',
  };
}

export const ProfilePage = connect(ProfilePageComponent, mapUserToProps);
