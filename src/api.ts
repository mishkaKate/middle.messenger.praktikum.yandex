import type { Indexed } from './utils/helpers';

export class BaseAPI {
  create(_data: Indexed) {
    throw new Error('Not implemented');
  }

  request(_data: Indexed) {
    throw new Error('Not implemented');
  }

  update(_data: Indexed) {
    throw new Error('Not implemented');
  }

  delete(_data: Indexed | number) {
    throw new Error('Not implemented');
  }
}
