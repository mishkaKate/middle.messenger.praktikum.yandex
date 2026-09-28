import {
  errorHandlerDefault,
  handleError,
} from '../../decorators/handle-error';
import store from '../../store';
import { ChatsAPI } from './chats.api';

const api = new ChatsAPI();

export class ChatsController {
  public async getChats() {
    return api.request();
  }

  @handleError(errorHandlerDefault)
  public async addChat(name: string) {
    const chatId = await api.create({ name });

    if (chatId) {
      const chats = await this.getChats();

      store.setState('chats', chats);
    }
  }

  @handleError(errorHandlerDefault)
  public async setActiveChat(id: string) {
    store.setState('activeChat', id);
    const users = await api.getUsers(Number.parseInt(id));
    console.log('users1', users);
    store.setState('activeChatUsers', users);
  }

  @handleError(errorHandlerDefault)
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

  @handleError(errorHandlerDefault)
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

  @handleError(errorHandlerDefault)
  public async setChatAvatar(data: FormData) {
    const activeChat = store.getState().activeChat;

    if (!activeChat) {
      return;
    }

    data.append('chatId', activeChat.toString());
    const { avatar } = await api.setAvatar(data);

    const chats = store.getState().chats;
    const nextChats = chats?.map((chat) => {
      if (chat.id == activeChat) {
        return { ...chat, avatar };
      }

      return chat;
    });

    store.setState('chats', nextChats);
  }
}
