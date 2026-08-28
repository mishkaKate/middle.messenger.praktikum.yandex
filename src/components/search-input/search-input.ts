import { Block, type BlockOwnProps } from '../block/block';
import tmpl from './search-input.hbs?raw';

export class SearchInput extends Block<BlockOwnProps> {
  static componentName = 'SearchInput';
  protected template = tmpl;
}
