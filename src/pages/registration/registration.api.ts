import { BaseAPI } from '../../api';
import HTTPTransport from '../../http/http-transport';
import type { Indexed } from '../../utils/helpers';

const registartionAPIInstance = new HTTPTransport();

export class ReagistartionAPI extends BaseAPI {
  create(user: Indexed): void {
    registartionAPIInstance.post('auth/signup', { data: user });
  }
}
