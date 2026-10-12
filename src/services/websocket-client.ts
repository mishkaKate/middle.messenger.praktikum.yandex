import store from '../store';
import { formatSoketMessage, type SoketMessage } from './chats';

interface WSMessage<T = string, P = unknown> {
  event: T;
  payload: P;
  type: string;
}

type MessageCallback<P> = (payload: P) => void;
const WSURL = 'wss://ya-praktikum.tech/ws/chats/';

export class WebSocketClient<
  Events extends Record<string, unknown> = Record<string, unknown>,
> {
  private ws: WebSocket | null = null;
  private url: string;
  private isExplicitlyClosed = false;
  private oldRead = 0;
  private listeners: {
    [K in keyof Events]?: Set<MessageCallback<Events[K]>>;
  } = {};
  private timer: number | undefined;

  constructor(userId: number, chatId: string, token: string) {
    this.url = `${WSURL}${userId}/${chatId}/${token}`;
    this.connect();
  }

  private connect(): void {
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      this.timer = setInterval(() => {
        this.ping();
      }, 3000);
      this.getOld();
    };

    this.ws.onmessage = (event: MessageEvent<string>) => {
      try {
        const data = JSON.parse(event.data) as WSMessage<
          keyof Events,
          Events[keyof Events]
        >;

        if (data && event.type == 'message') {
          if (data.type == 'message') {
            const { messages = [] } = store.getState();
            const messageStore = formatSoketMessage(
              data as unknown as SoketMessage
            );

            store.setState('messages', [messageStore, ...messages]);
          } else {
            if (Array.isArray(data)) {
              const messagesStore = data.map((m) => formatSoketMessage(m));
              const { messages = [] } = store.getState(); //todo добавить сортировку по времени
              if (
                messages.length === 0 ||
                messages[messages.length - 1].id < data[0].id
              ) {
                store.setState('messages', [...messages, ...messagesStore]);
              }
            }
          }
        }
      } catch (error) {
        console.error('Ошибка парсинга JSON из WebSocket:', error);
      }
    };

    this.ws.onclose = () => {
      if (this.isExplicitlyClosed) {
        console.log('WebSocket соединение успешно закрыто пользователем.');
        return;
      }

      console.warn(
        'WebSocket соединение разорвано. Переподключение через 3 секунды...'
      );
      setTimeout(() => this.connect(), 3000);
    };

    this.ws.onerror = (error) => {
      console.error('Ошибка WebSocket:', error);
    };
  }

  ping() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('Невозможно отправить запрос: WebSocket не подключен');
      return;
    }

    this.ws.send(
      JSON.stringify({
        type: 'ping',
      })
    );
  }

  public getOld(id?: number) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('Невозможно отправить запрос: WebSocket не подключен');
      return;
    }

    this.ws.send(
      JSON.stringify({
        content: id ?? this.oldRead,
        type: 'get old',
      })
    );
  }

  public subscribe<K extends keyof Events>(
    event: K,
    callback: MessageCallback<Events[K]>
  ): void {
    if (!this.listeners[event]) {
      this.listeners[event] = new Set();
    }
    this.listeners[event]?.add(callback);
  }

  public unsubscribe<K extends keyof Events>(
    event: K,
    callback: MessageCallback<Events[K]>
  ): void {
    this.listeners[event]?.delete(callback);
  }

  public send(messege: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('Невозможно отправить сообщение: WebSocket не подключен');
      return;
    }

    this.ws.send(
      JSON.stringify({
        content: messege,
        type: 'message',
      })
    );
  }

  public close(): void {
    if (this.ws) {
      this.isExplicitlyClosed = true;
      this.ws.close();
      clearInterval(this.timer);
      this.ws = null;
      store.setState('messages', []);
    }
  }
}
