import router from '../../router/router';
import store from '../../store';
import type { Indexed } from '../../utils/helpers';
import { ChatsAPI } from '../main/chats.api';
import { LoginAPI } from './login.api';

const loginApi = new LoginAPI();
const chatsApi = new ChatsAPI();

export class LoginController {
  public async singin(data: Indexed) {
    const user = await loginApi.request(data);
    store.setState('userProfile', user);

    const chats = chatsApi.request();
    store.setState('chats', chats);
    router.go('/messenger');
  }
}
