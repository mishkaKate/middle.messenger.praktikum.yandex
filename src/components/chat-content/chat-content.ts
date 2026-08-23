import { sendMessege } from '../../models/messege-model';
import { Block, type BlockOwnProps } from '../block/block';
import tmpl from './chat-content.hbs?raw';

export class ChatContent extends Block<BlockOwnProps> {
  static componentName = 'ChatContent';
  protected template = tmpl;

  protected events = {
    click: (e: Event) => {
      if (e.target instanceof HTMLButtonElement) {
        if (
          e.target.id === 'chat-content-send' &&
          this.refs.input.children[0] instanceof HTMLInputElement &&
          this.refs.input.children[0].value !== ''
        ) {
          sendMessege(this.refs.input.children[0].value);
        }
      }
    },
  };
}
