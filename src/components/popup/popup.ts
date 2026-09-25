import { Block, type BlockOwnProps } from '../block/block';
import tmpl from './popup.hbs?raw';

export class Popup extends Block<BlockOwnProps> {
  static componentName = 'Popup';
  protected template = tmpl;
}
