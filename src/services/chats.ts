import { ChatsAPI } from '../pages/main/chats.api';
import router from '../router/router';
import store, { type Message } from '../store';
import { WebSocketClient } from './websocket-client';

const api = new ChatsAPI();

export type SoketMessage = {
  content: string;
  id: number;
  time: string;
  type: string; //if message it is for show
  user_id: number;
};

export async function checkChats(pathname: string) {
  const curChats = store.getState().chats;

  if (!curChats || curChats.length === 0) {
    const chats = await api.request();

    if (chats && chats.length) {
      store.setState('chats', chats);
    }
  }

  setActiveChat(pathname);
}

export async function getChatUsers() {
  const chatId = store.getState().activeChat;

  if (chatId) {
    const users = await api.getUsers(chatId);

    store.setState('activeChatUsers', users);
  }
}

async function setActiveChat(pathname: string) {
  const chatId = getChatId(pathname);

  if (!chatId) {
    const { id } = (store.getState().chats || [])[0];

    if (id) {
      router.go(`/messenger/${id}`);
    }
  } else {
    const { token } = await api.getToken(chatId);
    const { userProfile } = store.getState();
    if (userProfile?.id && typeof token === 'string') {
      const { ws } = store.getState();
      if (ws) {
        ws.close();
      }

      const wsClient = new WebSocketClient(userProfile?.id, chatId, token);
      const users = await api.getUsers(Number.parseInt(chatId));
      store.setState('activeChat', chatId);
      store.setState('activeChatUsers', users);
      store.setState('ws', wsClient);
    }
  }
}

function getChatId(pathname: string) {
  const segments = pathname.split('/').filter(Boolean);

  if (segments[0] === 'messenger' && segments[1]) {
    return segments[1];
  }

  return null;
}

export function sendMessege(message: string) {
  const { ws } = store.getState();

  if (ws) {
    ws.send(message);
  }
}

export function formatSoketMessage(message: SoketMessage): Message | undefined {
  const { userProfile, activeChatUsers } = store.getState();

  if (!userProfile || !activeChatUsers) {
    return;
  }

  const date = new Date(message.time);
  const author = activeChatUsers.find((user) => user.id == message.user_id);

  return {
    id: message.id,
    content: message.content,
    time: date.toLocaleTimeString('ru', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    author: author ? author.login : 'Unknown',
    modificator: message.user_id == userProfile.id ? 'my' : '',
  };
}

export async function getUnreadMessages() {
  const { activeChat } = store.getState();

  if (!activeChat) {
    return;
  }

  const res = await api.getUnreadMessages(activeChat);
  return res.unread_count;
}
