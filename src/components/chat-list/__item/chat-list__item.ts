import { ChatsController } from '../../../pages/main/chats-controller';
import { Block, type BlockOwnProps } from '../../block/block';
import tmpl from './chat-list__item.hbs?raw';

export type Props = BlockOwnProps & {
  avatar?: string | null;
};
export class ChatListItem extends Block<Props> {
  static componentName = 'ChatListItem';
  protected template = tmpl;
  protected conntroller = new ChatsController();

  constructor(props: Props) {
    super(props.avatar ? props : { ...props, avatar: './public/favicon.svg' });
  }

  protected events = {
    click: (e: Event) => {
      if (
        e.target instanceof HTMLElement &&
        e.target?.className === 'chat-item-block'
      ) {
        this.conntroller.setActiveChat(e.target.id);
      }
    },
  };
}
