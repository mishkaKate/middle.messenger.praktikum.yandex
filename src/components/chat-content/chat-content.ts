import { Block, type BlockOwnProps } from '../block/block';
import tmpl from './chat-content.hbs?raw';

export class ChatContent extends Block<BlockOwnProps> {
  static componentName = 'ChatContent';
  protected template = tmpl;
}
