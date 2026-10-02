import { Block, type BlockOwnProps } from '../block/block';
import tmpl from './input-image.hbs?raw';

export type Props = BlockOwnProps & {
  name?: string;
  id?: string;
};

export class InputImage extends Block<Props> {
  static componentName = 'InputImage';
  protected template = tmpl;
}
