import { BaseAPI } from '../../api';
import HTTPTransport from '../../http/http-transport';
import type { Indexed } from '../../utils/helpers';

const loginAPIInstance = new HTTPTransport();

export class LoginAPI extends BaseAPI {
  async request(data: Indexed) {
    await loginAPIInstance.post('auth/signin', { data });

    return loginAPIInstance.get('auth/user');
  }
}
