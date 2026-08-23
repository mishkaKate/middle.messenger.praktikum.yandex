import { Block, type BlockOwnProps } from '../../components/block/block';
import tpl from './profile-page.hbs?raw';

export class ProfilePage extends Block<BlockOwnProps> {
  protected template = tpl;
}
