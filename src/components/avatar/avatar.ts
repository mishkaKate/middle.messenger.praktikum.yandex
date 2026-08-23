import { Block, type BlockOwnProps } from '../block/block';
import avatarTmpl from './avatar.hbs?raw';

type Props = BlockOwnProps;

export class Avatar extends Block<Props> {
  static componentName = 'Avatar';
  protected template = avatarTmpl;
}
