import { Block, type BlockOwnProps } from '../../components/block/block';
import type { chatRecord } from '../../mocks/chats';
import router from '../../router/router';
import { ChatsController } from './chats-controller';
import tmpl from './main-page.hbs?raw';

type mainPageProps = BlockOwnProps & {
  chats: chatRecord[];
};

export class MainPage extends Block<mainPageProps> {
  static componentName = 'MainPage';
  protected template = tmpl;
  protected controller = new ChatsController();

  onProfileClick = () => {
    router.go('/settings');
  };

  protected events = {
    click: (e: Event) => {
      if (!(e.target instanceof HTMLElement)) {
        return;
      }

      if (e.target.id === 'profile-button') {
        this.onProfileClick();
      }
    },
    submit: (e: Event) => {
      e.preventDefault();
      if (e.target instanceof HTMLFormElement && e.target.id === 'chat-name-dialog-form') {
        const input = document.getElementById(
          'modal-input-chat-name-dialog'
        ) as HTMLInputElement;
        if (input.value) {
          this.controller.addChat(input.value);

          const dialog = document.getElementById(
            'chat-name-dialog'
          ) as HTMLDialogElement;
          dialog.hidePopover()
        }
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
          this.controller.setChatAvatar(formData);
        }
      }
    },
  };
}
