import { Block, type BlockOwnProps } from '../block/block';
import tmpl from './link.hbs?raw';

export class Link extends Block<BlockOwnProps> {
    static componentName = 'Link';
    protected template = tmpl;
}
