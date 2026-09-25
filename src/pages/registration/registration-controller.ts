import router from '../../router/router';
import type { Indexed } from '../../utils/helpers';
import { ReagistartionAPI } from './registration.api';

const api = new ReagistartionAPI();

export class RegistrationController {
  public async singup(data: Indexed) {
    await api.create(data);
    router.go('/messenger');
  }
}
