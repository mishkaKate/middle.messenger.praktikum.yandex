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

      if (e.target && e.target.id === 'add-chat-button') {
        this.controller.addChat();
      }
    },
  };
}
