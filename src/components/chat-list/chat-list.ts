import type { State } from '../../store';
import { connect } from '../../utils/connect';
import { getImageSource } from '../../utils/helpers';
import { Block, type BlockOwnProps } from '../block/block';
import tmpl from './chat-list.hbs?raw';

class ChatListComponent extends Block<BlockOwnProps> {
  static componentName = 'ChatList';
  protected template = tmpl;
}

export function mapStateToProps(state: State) {
  return {
    chats:
      state.chats?.map((chat) => ({
        ...chat,
        avatar: chat.avatar ? getImageSource(chat.avatar) : '',
      })) || [],
  };
}

export const ChatList = connect(ChatListComponent, mapStateToProps);
