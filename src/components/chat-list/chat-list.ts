import { Block, type BlockOwnProps } from '../block/block';
import tmpl from './chat-list.hbs?raw';

export class ChatList extends Block<BlockOwnProps> {
  static componentName = 'ChatList';
  protected template = tmpl;
}
