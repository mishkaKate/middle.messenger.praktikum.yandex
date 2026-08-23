import { Block, type BlockOwnProps } from '../../components/block/block';
import type { chatRecord } from '../../mocks/chats';
import tmpl from './main-page.hbs?raw';

type mainPageProps = BlockOwnProps & {
  chats: chatRecord[];
};

export class MainPage extends Block<mainPageProps> {
  protected template = tmpl;
}
