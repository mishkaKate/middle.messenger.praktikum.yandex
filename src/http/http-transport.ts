import type { Indexed } from '../utils/helpers';

export type RequestOptions = {
  method?: string;
  timeout?: number;
  headers?: Indexed;
  data?: Indexed | FormData;
  responseType?: XMLHttpRequestResponseType;
};

type ApiError = {
  request: XMLHttpRequest;
};

const METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
};

const host = 'https://ya-praktikum.tech/api/v2/';

export function isApiError(error: unknown): error is ApiError {
  return (error &&
    typeof error === 'object' &&
    'request' in error &&
    'status' in error &&
    'response' in error) as boolean;
}

function queryStringify(data: Indexed<number | string | boolean>) {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Data must be a non-null object');
  }

  const keys = Object.keys(data);

  if (keys.length === 0) {
    return '';
  }

  return keys.reduce((result, key, index) => {
    if (data[key] === undefined || data[key] === null) {
      return result;
    }

    const encodedKey = encodeURIComponent(key);
    const encodedValue = encodeURIComponent(data[key]);

    const separator = index < keys.length - 1 ? '&' : '';

    return `${result}${encodedKey}=${encodedValue}${separator}`;
  }, '?');
}

export class HTTPTransport {
  get = (url: string, options: RequestOptions = {}) => {
    return this.request(
      url,
      { ...options, method: METHODS.GET },
      options.timeout
    );
  };

  post = (url: string, options: RequestOptions = {}) => {
    return this.request(
      url,
      { ...options, method: METHODS.POST },
      options.timeout
    );
  };

  put = (url: string, options: RequestOptions = {}) => {
    return this.request(
      url,
      { ...options, method: METHODS.PUT },
      options.timeout
    );
  };

  delete = (url: string, options: RequestOptions = {}) => {
    return this.request(
      url,
      { ...options, method: METHODS.DELETE },
      options.timeout
    );
  };

  request = (url: string, options: RequestOptions = {}, timeout = 5000) => {
    const { headers = {}, method, data, responseType } = options;

    return new Promise((resolve, reject) => {
      if (!method) {
        reject(new Error('HTTP method is required'));
        return;
      }

      const xhr = new XMLHttpRequest();
      const isGet = method === METHODS.GET;

      xhr.open(
        method,
        isGet && data && !(data instanceof FormData)
          ? `${host}${url}${queryStringify(data as Indexed<number | string | boolean>)}`
          : `${host}${url}`,
        true
      );

      if (responseType) {
        xhr.responseType = responseType;
      }

      Object.keys(headers).forEach((key) => {
        xhr.setRequestHeader(key, headers[key] as string);
      });

      xhr.withCredentials = true;

      xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
          let response;

          if (xhr.responseType) {
            response = xhr.response;
          } else {
            try {
              const contentType = xhr.getResponseHeader('Content-Type');
              if (contentType && contentType.includes('application/json')) {
                response = JSON.parse(xhr.responseText);
              } else {
                response = xhr.responseText;
              }
            } catch {
              response = xhr.responseText;
            }
          }

          resolve(response);
        } else {
          reject({
            status: xhr.status,
            statusText: xhr.statusText,
            response: xhr.responseText,
            request: xhr,
          });
        }
      };

      xhr.onabort = () =>
        reject({
          reason: 'Request aborted',
          request: xhr,
        });

      xhr.onerror = () =>
        reject({
          reason: 'Network error',
          request: xhr,
        });

      xhr.timeout = timeout;

      xhr.ontimeout = () =>
        reject({
          reason: 'Request timeout',
          timeout: timeout,
          request: xhr,
        });

      if (isGet || !data) {
        xhr.send();
      } else if (data instanceof FormData) {
        xhr.send(data);
      } else if (typeof data === 'object') {
        if (!headers['Content-Type']) {
          xhr.setRequestHeader('Content-Type', 'application/json');
        }
        xhr.send(JSON.stringify(data));
      } else {
        xhr.send(data);
      }
    });
  };
}

export default HTTPTransport;
