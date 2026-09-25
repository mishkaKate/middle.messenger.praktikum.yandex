import { ChatsAPI } from '../pages/main/chats.api';
import store from '../store';

const api = new ChatsAPI();

export async function checkChats() {
  const curChats = store.getState().chats;

  if (!curChats || curChats.length === 0) {
    const chats = await api.request();

    if (chats && chats.length) {
      store.setState('chats', chats);
      store.setState('activeChat', chats[0].id);
    }
  }
}
