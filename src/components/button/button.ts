import { Block, type BlockOwnProps } from '../block/block';
import buttonTpl from './button.hbs?raw';

export class Button extends Block<BlockOwnProps> {
  static componentName = 'Button';
  protected template = buttonTpl;
}
