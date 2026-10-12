import { BaseAPI } from '../../api';
import HTTPTransport from '../../http/http-transport';
import type { Indexed } from '../../utils/helpers';

const chatAPIInstance = new HTTPTransport();

export class ChatsAPI extends BaseAPI {
  async request(): Promise<Array<Indexed>> {
    return (await chatAPIInstance.get('chats')) as Array<Indexed>;
  }

  async create(data: { name: string }): Promise<Indexed> {
    return (await chatAPIInstance.post('chats', {
      data: { title: data.name },
    })) as Indexed;
  }

  async getToken(chatId: string): Promise<Indexed> {
    return (await chatAPIInstance.post(`chats/token/${chatId}`)) as Indexed;
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

  async setAvatar(data: FormData): Promise<Indexed> {
    return (await chatAPIInstance.put('chats/avatar', {
      data,
    })) as Indexed;
  }

  async getUsers(id: number): Promise<Array<Indexed>> {
    return (await chatAPIInstance.get(`chats/${id}/users`)) as Array<Indexed>;
  }

  async getUnreadMessages(chatId: number): Promise<Indexed> {
    return (await chatAPIInstance.get(`chats/new/${chatId}`)) as Indexed;
  }
}
