import { ChatsController } from '../../pages/main/chats-controller';
import { Block, type BlockOwnProps } from '../block/block';
import tmpl from './modal.hbs?raw';

export class Modal extends Block<BlockOwnProps> {
  static componentName = 'Modal';
  protected template = tmpl;
  protected controller = new ChatsController();

  events = {
    submit: (e: Event) => {
      if (e.target instanceof HTMLFormElement) {
        if (e.target.id === 'add-user-dialog-form') {
          const input = document.getElementById(
            'modal-input-add-user-dialog'
          ) as HTMLInputElement;

          if (input?.value) {
            this.controller.addChatUser(input.value);

            const dialog = document.getElementById(
              'add-user-dialog'
            ) as HTMLDialogElement;
            dialog.hidePopover();
          }
        }

        if (e.target.id === 'delete-user-dialog-form') {
          const input = document.getElementById(
            'modal-input-delete-user-dialog'
          ) as HTMLInputElement;
          if (input.value) {
            this.controller.deleteChatUser(input.value);

            const dialog = document.getElementById(
              'delete-user-dialog'
            ) as HTMLDialogElement;
            dialog.hidePopover();
          }
        }
      }
    },
  };
}
