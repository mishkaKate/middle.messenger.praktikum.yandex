import { Block, type BlockOwnProps } from '../../components/block/block';
import tpl from './error-page.hbs?raw';

type Props = BlockOwnProps & {
  messege: string;
};

export class ErrorPage extends Block<Props> {
  protected template = tpl;
}
