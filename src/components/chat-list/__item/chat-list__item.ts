import { Block, type BlockOwnProps } from '../../block/block';
import tmpl from './chat-list__item.hbs?raw';

export class ChatListItem extends Block<BlockOwnProps> {
  static componentName = 'ChatListItem';
  protected template = tmpl;
}
