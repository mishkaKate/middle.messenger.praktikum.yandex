import { Block, type BlockOwnProps } from '../../components/block/block';
import tpl from './profile-page.hbs?raw';

type Props = BlockOwnProps & {
  avatar: string;
  name: string;
  surname: string;
  phone: string;
  email: string;
};

export class ProfilePage extends Block<Props> {
  protected template = tpl;
}
