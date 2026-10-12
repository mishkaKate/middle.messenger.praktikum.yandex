import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  checkChats,
  getChatUsers,
  sendMessege,
  formatSoketMessage,
} from './chats';
import router from '../router/router';
import store, { type State } from '../store';

const mocks = vi.hoisted(() => ({
  request: vi.fn(),
  create: vi.fn(),
  getToken: vi.fn(),
  addUser: vi.fn(),
  deleteUser: vi.fn(),
  getUserByLogin: vi.fn(),
  setAvatar: vi.fn(),
  getUsers: vi.fn(),
}));

vi.mock('../pages/main/chats.api', () => {
  return {
    ChatsAPI: class {
      request = mocks.request;
      create = mocks.create;
      getToken = mocks.getToken;
      addUser = mocks.addUser;
      deleteUser = mocks.deleteUser;
      getUserByLogin = mocks.getUserByLogin;
      setAvatar = mocks.setAvatar;
      getUsers = mocks.getUsers;
    },
  };
});

vi.mock('../router/router', () => ({
  default: { go: vi.fn() },
}));

vi.mock('../store', () => ({
  default: {
    getState: vi.fn(() => ({})),
    setState: vi.fn(),
  },
}));

const wsSpy = vi.hoisted(() => ({
  constructor: vi.fn<(userId: number, chatId: string, token: string) => void>(),
  send: vi.fn<(message: string) => void>(),
  close: vi.fn<() => void>(),
}));

vi.mock('./websocket-client', () => {
  return {
    WebSocketClient: class {
      constructor(...args: [number, string, string] | unknown[]) {
        const [userId, chatId, token] = args as [number, string, string];
        wsSpy.constructor(userId, chatId, token);
      }
      send = wsSpy.send;
      close = wsSpy.close;
    },
  };
});

describe('Chats Logic', () => {
  beforeEach(() => {
    wsSpy.constructor.mockClear();
    wsSpy.send.mockClear();
    wsSpy.close.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('checkChats()', () => {
    it('should fetch chats from API and save to store if state chats are missing', async () => {
      vi.mocked(store.getState).mockReturnValue({ chats: [] } as State);
      const mockChatsList = [{ id: 101, title: 'Chat 1' }];

      mocks.request.mockResolvedValue(mockChatsList);
      mocks.getToken.mockResolvedValue({ token: 'mock-token' });
      mocks.getUsers.mockResolvedValue([]);

      await checkChats('/messenger/101');

      expect(mocks.request).toHaveBeenCalledTimes(1);
      expect(store.setState).toHaveBeenCalledWith('chats', mockChatsList);
    });

    it('should redirect via router if no explicit chatId is present in the pathname', async () => {
      const fallbackChats = [{ id: 42, title: 'Fallback Chat', avatar: '' }];
      vi.mocked(store.getState).mockReturnValue({
        chats: fallbackChats,
      } as State);

      await checkChats('/messenger');

      expect(router.go).toHaveBeenCalledWith('/messenger/42');
      expect(mocks.getToken).not.toHaveBeenCalled();
    });

    it('should open a new web socket connection with the correct parameters', async () => {
      vi.mocked(store.getState).mockReturnValue({
        chats: [{ id: 99 }],
        userProfile: { id: 777 },
        ws: null,
      } as unknown as State);

      mocks.getToken.mockResolvedValue({ token: 'new-token' });
      mocks.getUsers.mockResolvedValue([]);

      await checkChats('/messenger/99');

      expect(wsSpy.constructor).toHaveBeenCalledWith(777, '99', 'new-token');
    });
  });

  describe('getChatUsers()', () => {
    it('should fetch active chat users and update state if activeChat is present', async () => {
      vi.mocked(store.getState).mockReturnValue({ activeChat: 202 } as State);
      const mockUsers = [{ id: 1, login: 'test_user' }];
      mocks.getUsers.mockResolvedValue(mockUsers);

      await getChatUsers();

      expect(mocks.getUsers).toHaveBeenCalledWith(202);
      expect(store.setState).toHaveBeenCalledWith('activeChatUsers', mockUsers);
    });
  });

  describe('sendMessege()', () => {
    it('should dispatch the string through active WebSocketClient instance', () => {
      const spySend = vi.fn();

      vi.mocked(store.getState).mockReturnValue({
        ws: { send: spySend },
      } as unknown as State);

      sendMessege('Hello world!');

      expect(spySend).toHaveBeenCalledWith('Hello world!');
    });

    it('should safely bypass dispatch if active ws state is missing or invalid', () => {
      vi.mocked(store.getState).mockReturnValue({ ws: undefined } as State);

      expect(() => sendMessege('Lost message')).not.toThrow();
    });
  });

  describe('formatSoketMessage()', () => {
    const mockSoketMsg = {
      id: 5,
      content: 'Hey there',
      time: '2026-10-03T14:30:00.000Z',
      type: 'message',
      user_id: 10,
    };

    it('should return undefined if userProfile or activeChatUsers state elements are missing', () => {
      vi.mocked(store.getState).mockReturnValue({
        userProfile: undefined,
      } as State);

      const result = formatSoketMessage(mockSoketMsg);
      expect(result).toBeUndefined();
    });

    it('should format message properly and label author matching recipient as "my"', () => {
      vi.mocked(store.getState).mockReturnValue({
        userProfile: { id: 10 },
        activeChatUsers: [{ id: 10, login: 'sender_one' }],
      } as unknown as State);

      const result = formatSoketMessage(mockSoketMsg);

      expect(result).toBeDefined();
      expect(result?.content).toBe('Hey there');
      expect(result?.author).toBe('sender_one');
      expect(result?.modificator).toBe('my');
      expect(result?.time).toMatch(/\d{2}:\d{2}/);
    });

    it('should label author metadata as "Unknown" if mismatching database profiles occur', () => {
      vi.mocked(store.getState).mockReturnValue({
        userProfile: { id: 999 },
        activeChatUsers: [{ id: 888, login: 'other_user' }],
      } as unknown as State);

      const result = formatSoketMessage(mockSoketMsg);

      expect(result?.author).toBe('Unknown');
      expect(result?.modificator).toBe('');
    });
  });
});
