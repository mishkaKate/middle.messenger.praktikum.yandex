import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { HTTPTransport, isApiError } from './http-transport'; // Adjust the relative import path based on your folder structure
import type { RequestOptions } from './http-transport';

interface MockXHR {
  open: ReturnType<typeof vi.fn>;
  send: ReturnType<typeof vi.fn>;
  setRequestHeader: ReturnType<typeof vi.fn>;
  getResponseHeader: ReturnType<typeof vi.fn>;
  status: number;
  statusText: string;
  responseText: string;
  response: unknown;
  responseType: XMLHttpRequestResponseType;
  withCredentials: boolean;
  timeout: number;
  onload: (() => void) | null;
  onerror: (() => void) | null;
  onabort: (() => void) | null;
  ontimeout: (() => void) | null;
}

describe('HTTPTransport & Helpers', () => {
  let transport: HTTPTransport;
  let mockXhrInstance: MockXHR;

  beforeEach(() => {
    transport = new HTTPTransport();

    mockXhrInstance = {
      open: vi.fn<(method: string, url: string, async: boolean) => void>(),
      send: vi.fn<(body?: Document | XMLHttpRequestBodyInit | null) => void>(),
      setRequestHeader: vi.fn<(key: string, value: string) => void>(),
      getResponseHeader: vi.fn<(header: string) => string | null>(
        () => 'application/json'
      ),
      status: 200,
      statusText: 'OK',
      responseText: '{}',
      response: {},
      responseType: '' as XMLHttpRequestResponseType,
      withCredentials: false,
      timeout: 0,
      onload: null,
      onerror: null,
      onabort: null,
      ontimeout: null,
    };
    class MockXMLHttpRequest {
      static readonly UNSENT = 0;
      static readonly OPENED = 1;
      static readonly HEADERS_RECEIVED = 2;
      static readonly LOADING = 3;
      static readonly DONE = 4;

      constructor() {
        return mockXhrInstance as unknown as MockXMLHttpRequest;
      }
    }

    globalThis.XMLHttpRequest =
      MockXMLHttpRequest as unknown as typeof XMLHttpRequest;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('isApiError() Type Guard', () => {
    it('should accurately identify structurally conforming API error shapes', () => {
      const genuineError = {
        request: {} as XMLHttpRequest,
        status: 400,
        response: 'Bad Request',
      };
      expect(isApiError(genuineError)).toBe(true);
    });

    it('should reject parameter objects missing required validation layout fields', () => {
      const basicError = new Error('Generic breakdown');
      const missingResponse = { request: {} as XMLHttpRequest, status: 500 };

      expect(isApiError(basicError)).toBe(false);
      expect(isApiError(missingResponse)).toBe(false);
      expect(isApiError(null)).toBeNull();
      expect(isApiError('Error String')).toBe(false);
    });
  });

  describe('HTTP Method Wrappers', () => {
    it('should map GET requests, append search parameters, and execute native workflows', async () => {
      const options: RequestOptions = { data: { active: true, count: 5 } };

      const requestPromise = transport.get('users', options);

      if (mockXhrInstance.onload) mockXhrInstance.onload();
      await requestPromise;

      expect(mockXhrInstance.open).toHaveBeenCalledWith(
        'GET',
        'https://ya-praktikum.tech/api/v2/users?active=true&count=5',
        true
      );
      expect(mockXhrInstance.withCredentials).toBe(true);
      expect(mockXhrInstance.send).toHaveBeenCalledTimes(1);
    });

    it('should map POST requests, stringify object structures, and append application headers', async () => {
      const options: RequestOptions = { data: { login: 'alex' } };

      const requestPromise = transport.post('login', options);
      if (mockXhrInstance.onload) mockXhrInstance.onload();
      await requestPromise;

      expect(mockXhrInstance.open).toHaveBeenCalledWith(
        'POST',
        'https://ya-praktikum.tech/api/v2/login',
        true
      );
      expect(mockXhrInstance.setRequestHeader).toHaveBeenCalledWith(
        'Content-Type',
        'application/json'
      );
      expect(mockXhrInstance.send).toHaveBeenCalledWith(
        JSON.stringify({ login: 'alex' })
      );
    });

    it('should map PUT requests and bypass manual header updates if passing FormData containers', async () => {
      const mockFormData = new FormData();
      const options: RequestOptions = { data: mockFormData };

      const requestPromise = transport.put('avatar', options);
      if (mockXhrInstance.onload) mockXhrInstance.onload();
      await requestPromise;

      expect(mockXhrInstance.open).toHaveBeenCalledWith(
        'PUT',
        'https://ya-praktikum.tech/api/v2/avatar',
        true
      );
      expect(mockXhrInstance.setRequestHeader).not.toHaveBeenCalledWith(
        'Content-Type',
        'application/json'
      );
      expect(mockXhrInstance.send).toHaveBeenCalledWith(mockFormData);
    });

    it('should map DELETE requests and process configurations accurately', async () => {
      const requestPromise = transport.delete('chats/12');
      if (mockXhrInstance.onload) mockXhrInstance.onload();
      await requestPromise;

      expect(mockXhrInstance.open).toHaveBeenCalledWith(
        'DELETE',
        'https://ya-praktikum.tech/api/v2/chats/12',
        true
      );
    });
  });

  describe('Response Transformations & Failure Interceptions', () => {
    it('should parse text outputs natively if responseType matches custom format descriptors', async () => {
      mockXhrInstance.responseType = 'json';
      mockXhrInstance.response = { message: 'success_payload' };

      const requestPromise = transport.request('test', {
        method: 'GET',
        responseType: 'json',
      });
      if (mockXhrInstance.onload) mockXhrInstance.onload();

      const response = await requestPromise;
      expect(response).toEqual({ message: 'success_payload' });
    });

    it('should reject with standard structural properties if status indicators confirm server errors', async () => {
      mockXhrInstance.status = 500;
      mockXhrInstance.statusText = 'Internal Server Error';
      mockXhrInstance.responseText = 'Database crashed';

      const requestPromise = transport.request('test', { method: 'GET' });
      if (mockXhrInstance.onload) mockXhrInstance.onload();

      await expect(requestPromise).rejects.toEqual({
        status: 500,
        statusText: 'Internal Server Error',
        response: 'Database crashed',
        request: mockXhrInstance,
      });
    });

    it('should trigger promise rejections if the request aborts', async () => {
      const requestPromise = transport.request('test', { method: 'GET' });
      if (mockXhrInstance.onabort) mockXhrInstance.onabort();

      await expect(requestPromise).rejects.toEqual({
        reason: 'Request aborted',
        request: mockXhrInstance,
      });
    });

    it('should trigger promise rejections if network errors break connections midway', async () => {
      const requestPromise = transport.request('test', { method: 'GET' });
      if (mockXhrInstance.onerror) mockXhrInstance.onerror();

      await expect(requestPromise).rejects.toEqual({
        reason: 'Network error',
        request: mockXhrInstance,
      });
    });

    it('should assign configured thresholds onto the instance and reject on timeouts', async () => {
      const requestPromise = transport.request(
        'slow-endpoint',
        { method: 'GET' },
        3000
      );

      expect(mockXhrInstance.timeout).toBe(3000);

      if (mockXhrInstance.ontimeout) mockXhrInstance.ontimeout();

      await expect(requestPromise).rejects.toEqual({
        reason: 'Request timeout',
        timeout: 3000,
        request: mockXhrInstance,
      });
    });
  });
});
