import type { State } from '../../store';
import { connect } from '../../utils/connect';
import { Block, type BlockOwnProps } from '../block/block';
import tmpl from './chat-list.hbs?raw';

class ChatListComponent extends Block<BlockOwnProps> {
  static componentName = 'ChatList';
  protected template = tmpl;
}

function mapStateToProps(state: State) {
  return {
    chats: state.chats || [],
  };
}

export const ChatList = connect(ChatListComponent, mapStateToProps);
