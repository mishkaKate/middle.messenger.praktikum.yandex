import type { State } from '../../store';
import store from '../../store';
import { connect } from '../../utils/connect';
import { getImageSource } from '../../utils/helpers';
import { Block, type BlockOwnProps } from '../block/block';
import tmpl from './chat-content.hbs?raw';

interface Props extends BlockOwnProps {
  avatar?: string | null;
}
class ChatContentCoponent extends Block<BlockOwnProps> {
  static componentName = 'ChatContent';
  protected template = tmpl;

  handler = () => {
    const list = this.refs['messagesList'];
    const totalScrollableDepth = list.scrollHeight - list.clientHeight;
    const currentScrollPosition = Math.abs(list.scrollTop);

    if (totalScrollableDepth - currentScrollPosition <= 1) {
      const messages = store.getState().messages;
      if (!messages || messages.length === 0) {
        return;
      }

      const last = messages[messages?.length - 1].id;
      store.getState().ws?.getOld(last); //todo дрыгается вниз скролл при считывании новых сообщений
    }
  };

  constructor(props: Props) {
    super(props.avatar ? props : { ...props, avatar: './public/favicon.svg' });
  }

  componentDidMount() {
    const list = this.refs['messagesList'];

    if (list instanceof HTMLElement) {
      list.addEventListener('scroll', this.handler);
    }
  }

  protected componentWillUnmount(): void {
    const list = this.refs['messagesList'];
    if (list instanceof HTMLElement) {
      list.removeEventListener('scroll', this.handler);
    }
  }
}

export function mapStateToProps(state: State) {
  const { activeChat, chats, activeChatUsers, messages } = state;

  if (!chats) {
    return {};
  }

  if (!activeChat) {
    return chats[0];
  }

  const active = chats.find((chat) => chat.id == activeChat);

  return {
    ...active,
    messages: messages || [],
    avatar: active?.avatar
      ? getImageSource(active.avatar)
      : '/public/favicon.svg',
    users: activeChatUsers,
  };
}

export const ChatContent = connect<Props>(ChatContentCoponent, mapStateToProps);
