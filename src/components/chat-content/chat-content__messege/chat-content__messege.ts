import { Block, type BlockOwnProps } from '../../block/block';
import tmpl from './chat-content__messege.hbs?raw';

export class ChatContentMessege extends Block<BlockOwnProps> {
  static componentName = 'ChatContentMessege';
  protected template = tmpl;
}
