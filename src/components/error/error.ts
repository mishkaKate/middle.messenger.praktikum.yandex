import { Block, type BlockOwnProps } from '../block/block';
import tmpl from './error.hbs?raw';

type Props = BlockOwnProps & { text: string };

export class Error extends Block<Props> {
  static componentName = 'Error';
  protected template = tmpl;
}
