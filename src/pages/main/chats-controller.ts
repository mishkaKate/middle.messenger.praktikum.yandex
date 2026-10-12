import {
  errorHandlerDefault,
  handleError,
} from '../../decorators/handle-error';
import router from '../../router/router';
import store from '../../store';
import { ChatsAPI } from './chats.api';

const api = new ChatsAPI();

export class ChatsController {
  public async getChats() {
    return api.request();
  }

  @handleError(errorHandlerDefault)
  public async addChat(name: string) {
    const chat = await api.create({ name });

    if (chat) {
      const chats = await this.getChats();

      store.setState('chats', chats);
      store.setState('activeChat', chat.id);
      store.setState('activeChatUsers', [{ ...store.getState().userProfile }]);
    }
  }

  @handleError(errorHandlerDefault)
  public async setActiveChat(id: string) {
    router.go(`/messenger/${id}`);
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
      this.updateChatUsers();
    }
  }

  @handleError(errorHandlerDefault)
  public async deleteChatUser(login: string) {
    const activeChat = store.getState().activeChat;
    const myLogin = store.getState().userProfile?.login;

    if (myLogin === login) {
      return; //todo реализовать удаление чата через кнопку или если в нем не осталось участников
    }

    if (!activeChat) {
      return;
    }
    const users = await api.getUserByLogin(login);

    if (users && users.length) {
      await api.deleteUser(activeChat, users[0].id as number);
      this.updateChatUsers();
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

  @handleError(errorHandlerDefault)
  async updateChatUsers() {
    const activeChat = store.getState().activeChat;

    if (!activeChat) {
      return;
    }
    const chatUsers = await api.getUsers(activeChat as number);
    store.setState('activeChatUsers', chatUsers);
  }
}
