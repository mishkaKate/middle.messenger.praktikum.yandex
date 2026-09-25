import { BaseAPI } from '../../api';
import HTTPTransport from '../../http/http-transport';
import type { Indexed } from '../../utils/helpers';

const chatAPIInstance = new HTTPTransport();

export class ChatsAPI extends BaseAPI {
  async request(): Promise<Array<Indexed>> {
    return (await chatAPIInstance.get('chats')) as Array<Indexed>;
  }

  async create() {
    return chatAPIInstance.post('chats', { data: { title: 'Новый чат' } });
  }

  async addUser(chatId: number, userId: number) {
    return chatAPIInstance.put('chats/users', {
      data: { users: [userId], chatId },
    });
  }

  async deleteUser(chatId: number, userId: number) {
    return await chatAPIInstance.delete('chats/users', {
      data: { users: [userId], chatId },
    });
  }

  async getUserByLogin(login: string): Promise<Array<Indexed>> {
    return (await chatAPIInstance.post('user/search', {
      data: { login },
    })) as Array<Indexed>;
  }
}
