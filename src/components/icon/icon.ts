import { Block, type BlockOwnProps } from '../block/block';
import tmpl from './icon.hbs?raw';

export type Props = BlockOwnProps & { source?: string };

export class Icon extends Block<Props> {
  static componentName = 'Icon';
  protected template = tmpl;
}
