import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WebSocketClient } from './websocket-client';
import { formatSoketMessage } from './chats';
import store from '../store';

vi.mock('../store', () => ({
  default: {
    getState: vi.fn(() => ({ messages: [] })),
    setState: vi.fn(),
  },
}));

vi.mock('./chats', () => ({
  formatSoketMessage: vi.fn((data) => ({ ...data, formatted: true })),
}));

class MockWebSocket {
  url: string;
  readyState: number = 0;
  static OPEN = 1;
  static CLOSED = 3;

  onopen: (() => void) | null = null;
  onmessage: ((event: unknown) => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: ((error: unknown) => void) | null = null;

  send = vi.fn();
  close = vi.fn(() => {
    this.readyState = MockWebSocket.CLOSED;
    if (this.onclose) this.onclose();
  });

  constructor(url: string) {
    this.url = url;

    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN;
      if (this.onopen) this.onopen();
    }, 0);
  }
}

globalThis.WebSocket = MockWebSocket as unknown as typeof WebSocket;

describe('WebSocketClient', () => {
  const userId = 123;
  const chatId = '456';
  const token = 'secret-token';
  let client: WebSocketClient;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    if (client) {
      client.close();
    }
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  describe('Connection & Initialization', () => {
    it('should construct correct URL and initiate connection', () => {
      client = new WebSocketClient(userId, chatId, token);

      expect(client['url']).toBe(
        'wss://ya-praktikum.tech/ws/chats/123/456/secret-token'
      );
      expect(client['ws']).toBeInstanceOf(MockWebSocket);
    });

    it('should setup ping interval and request old messages on open', async () => {
      client = new WebSocketClient(userId, chatId, token);
      const wsMock = client['ws'];
      if (wsMock) {
        const sendSpy = vi.spyOn(wsMock, 'send');

        await vi.advanceTimersByTimeAsync(0);

        expect(sendSpy).toHaveBeenCalledWith(
          JSON.stringify({ content: 0, type: 'get old' })
        );

        await vi.advanceTimersByTimeAsync(3000);
        expect(sendSpy).toHaveBeenCalledWith(JSON.stringify({ type: 'ping' }));
      }
    });
  });

  describe('Messages Handling (onmessage)', () => {
    it('should handle incoming single message and update store', async () => {
      client = new WebSocketClient(userId, chatId, token);
      await vi.advanceTimersByTimeAsync(0);

      const wsMock = client['ws'];

      const mockEvent = {
        type: 'message',
        data: JSON.stringify({ type: 'message', id: 1, content: 'Hello' }),
      };

      if (wsMock && wsMock.onmessage) {
        wsMock.onmessage(mockEvent as MessageEvent);
      }

      expect(formatSoketMessage).toHaveBeenCalled();
      expect(store.setState).toHaveBeenCalledWith(
        'messages',
        expect.any(Array)
      );
    });

    it('should handle incoming array of old messages and add them if store is empty', async () => {
      client = new WebSocketClient(userId, chatId, token);
      await vi.advanceTimersByTimeAsync(0);

      const wsMock = client['ws'];

      const mockArrayData = [
        { id: 1, content: 'Old 1' },
        { id: 2, content: 'Old 2' },
      ];

      const mockEvent = {
        type: 'message',
        data: JSON.stringify(mockArrayData),
      };

      if (wsMock && wsMock.onmessage) {
        wsMock.onmessage(mockEvent as MessageEvent);
      }

      expect(store.setState).toHaveBeenCalled();
    });

    it('should log error if incoming message is invalid JSON', async () => {
      client = new WebSocketClient(userId, chatId, token);
      await vi.advanceTimersByTimeAsync(0);

      const wsMock = client['ws'];

      if (wsMock && wsMock.onmessage) {
        wsMock.onmessage({
          type: 'message',
          data: 'invalid json',
        } as MessageEvent);
      }

      expect(console.error).toHaveBeenCalledWith(
        'Ошибка парсинга JSON из WebSocket:',
        expect.any(Error)
      );
    });
  });

  describe('Methods', () => {
    it('should send message if socket is open', async () => {
      client = new WebSocketClient(userId, chatId, token);
      await vi.advanceTimersByTimeAsync(0);

      const wsMock = client['ws'];
      client.send('Test message');

      expect(wsMock?.send).toHaveBeenCalledWith(
        JSON.stringify({
          content: 'Test message',
          type: 'message',
        })
      );
    });

    it('should log error on send if socket is not connected', () => {
      client = new WebSocketClient(userId, chatId, token);

      client.send('Test message');
      expect(console.error).toHaveBeenCalledWith(
        'Невозможно отправить сообщение: WebSocket не подключен'
      );
    });

    it('should correctly subscribe/unsubscribe to events without throwing errors', () => {
      client = new WebSocketClient(userId, chatId, token);
      const callback = vi.fn();

      expect(() => client.subscribe('custom-event', callback)).not.toThrow();
      expect(() => client.unsubscribe('custom-event', callback)).not.toThrow();
    });
  });

  describe('Close & Reconnection', () => {
    it('should clear resources and clear store on explicit close', async () => {
      client = new WebSocketClient(userId, chatId, token);
      await vi.advanceTimersByTimeAsync(0);

      const wsMock = client['ws'];
      client.close();

      expect(wsMock?.close).toHaveBeenCalled();
      expect(store.setState).toHaveBeenCalledWith('messages', []);
      expect(client['ws']).toBeNull();
    });

    it('should attempt reconnection after 3 seconds if closed unexpectedly', async () => {
      client = new WebSocketClient(userId, chatId, token);
      await vi.advanceTimersByTimeAsync(0);

      const wsMock = client['ws'];

      if (wsMock && wsMock.onclose) {
        wsMock.onclose({ type: 'message' } as CloseEvent);
      }

      expect(console.warn).toHaveBeenCalledWith(
        'WebSocket соединение разорвано. Переподключение через 3 секунды...'
      );

      await vi.advanceTimersByTimeAsync(3000);

      expect(client['ws']).not.toBe(wsMock);
    });
  });
});
