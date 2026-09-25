import type { State } from '../../store';
import { connect } from '../../utils/connect';
import { Block, type BlockOwnProps } from '../block/block';
import tmpl from './chat-content.hbs?raw';

interface Props extends BlockOwnProps {
  avatar?: string | null;
}
class ChatContentCoponent extends Block<BlockOwnProps> {
  static componentName = 'ChatContent';
  protected template = tmpl;

  constructor(props: Props) {
    super(props.avatar ? props : { ...props, avatar: './public/favicon.svg' });
  }
}

export function mapStateToProps(state: State) {
  const { activeChat, chats } = state;

  if (!chats) {
    return {};
  }

  if (!activeChat) {
    return chats[0];
  }

  const active = chats.find((chat) => chat.id == activeChat);

  return {
    ...active,
  };
}

export const ChatContent = connect<Props>(ChatContentCoponent, mapStateToProps);
