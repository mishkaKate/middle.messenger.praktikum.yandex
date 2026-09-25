import store from '../../store';
import { ChatsAPI } from './chats.api';

const api = new ChatsAPI();

export class ChatsController {
  public async getChats() {
    return api.request();
  }

  public async addChat() {
    const chatId = await api.create();

    if (chatId) {
      const chats = await this.getChats();

      store.setState('chats', chats);
    }
  }

  public setActiveChat(id: string) {
    store.setState('activeChat', id);
  }

  public async addChatUser(login: string) {
    const activeChat = store.getState().activeChat;

    if (!activeChat) {
      return;
    }
    const users = await api.getUserByLogin(login);

    if (users && users.length) {
      await api.addUser(activeChat, users[0].id as number);
    }
  }

  public async deleteChatUser(login: string) {
    const activeChat = store.getState().activeChat;

    if (!activeChat) {
      return;
    }
    const users = await api.getUserByLogin(login);

    if (users && users.length) {
      await api.deleteUser(activeChat, users[0].id as number);
    }
  }
}
