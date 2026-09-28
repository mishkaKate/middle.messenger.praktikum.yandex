import { ChatsController } from '../../pages/main/chats-controller';
import { Block, type BlockOwnProps } from '../block/block';
import tmpl from './modal.hbs?raw';

export class Modal extends Block<BlockOwnProps> {
  static componentName = 'Modal';
  protected template = tmpl;
  protected controller = new ChatsController();

  events = {
    click: (e: Event) => {
      if (e instanceof PointerEvent && e.target instanceof HTMLElement) {
        if (e.target?.parentElement?.id === 'add-user-dialog') {
          const input = document.getElementById(
            'modal-input-add-user-dialog'
          ) as HTMLInputElement;

          if (input?.value) {
            this.controller.addChatUser(input.value);
          }
        }

        if (e.target?.parentElement?.id === 'delete-user-dialog') {
          const input = document.getElementById(
            'modal-input-delete-user-dialog'
          ) as HTMLInputElement;
          if (input.value) {
            this.controller.deleteChatUser(input.value);
          }
        }
      }
    },
  };
}
