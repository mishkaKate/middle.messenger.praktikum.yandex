import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import router from '../../router/router';
import store, { type State } from '../../store';
import { ChatsController } from './chats-controller';

const mockApiMethods = vi.hoisted(() => ({
  request: vi.fn(),
  create: vi.fn(),
  getToken: vi.fn(),
  addUser: vi.fn(),
  deleteUser: vi.fn(),
  getUserByLogin: vi.fn(),
  setAvatar: vi.fn(),
  getUsers: vi.fn(),
}));

vi.mock('./chats.api', () => {
  return {
    ChatsAPI: class {
      request = mockApiMethods.request;
      create = mockApiMethods.create;
      getToken = mockApiMethods.getToken;
      addUser = mockApiMethods.addUser;
      deleteUser = mockApiMethods.deleteUser;
      getUserByLogin = mockApiMethods.getUserByLogin;
      setAvatar = mockApiMethods.setAvatar;
      getUsers = mockApiMethods.getUsers;
    },
  };
});

vi.mock('../../router/router', () => ({
  default: {
    go: vi.fn(),
  },
}));

vi.mock('../../store', () => ({
  default: {
    getState: vi.fn(() => ({})),
    setState: vi.fn(),
  },
}));

vi.mock('../../decorators/handle-error', () => ({
  handleError:
    () => (_target: unknown, _key: string, descriptor: PropertyDescriptor) =>
      descriptor,
  errorHandlerDefault: vi.fn(),
}));

describe('ChatsController', () => {
  let controller: ChatsController;

  beforeEach(() => {
    controller = new ChatsController();

    mockApiMethods.request.mockReset();
    mockApiMethods.create.mockReset();
    mockApiMethods.addUser.mockReset();
    mockApiMethods.deleteUser.mockReset();
    mockApiMethods.getUserByLogin.mockReset();
    mockApiMethods.setAvatar.mockReset();
    mockApiMethods.getUsers.mockReset();

    vi.mocked(router.go).mockReset();
    vi.mocked(store.getState).mockReset();
    vi.mocked(store.setState).mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getChats()', () => {
    it('should directly call api.request and return fetched chats list', async () => {
      const mockChats = [{ id: 1, title: 'Chat 1' }];
      mockApiMethods.request.mockResolvedValue(mockChats);

      const result = await controller.getChats();

      expect(mockApiMethods.request).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockChats);
    });
  });

  describe('addChat()', () => {
    it('should create a chat, refetch list, and successfully update store states', async () => {
      const mockNewChat = { id: 42 };
      const mockChatsList = [{ id: 42, title: 'New Chat' }];
      const mockUserProfile = { id: 7, login: 'creator' };

      mockApiMethods.create.mockResolvedValue(mockNewChat);
      mockApiMethods.request.mockResolvedValue(mockChatsList);
      vi.mocked(store.getState).mockReturnValue({
        userProfile: mockUserProfile,
      } as State);

      await controller.addChat('Test Chat Name');

      expect(mockApiMethods.create).toHaveBeenCalledWith({
        name: 'Test Chat Name',
      });
      expect(mockApiMethods.request).toHaveBeenCalledTimes(1);
      expect(store.setState).toHaveBeenCalledWith('chats', mockChatsList);
      expect(store.setState).toHaveBeenCalledWith('activeChat', 42);
      expect(store.setState).toHaveBeenCalledWith('activeChatUsers', [
        mockUserProfile,
      ]);
    });

    it('should gracefully skip state mutations if api.create returns null/falsy response', async () => {
      mockApiMethods.create.mockResolvedValue(null);

      await controller.addChat('Failed Chat');

      expect(mockApiMethods.request).not.toHaveBeenCalled();
      expect(store.setState).not.toHaveBeenCalled();
    });
  });

  describe('setActiveChat()', () => {
    it('should forward the navigation request to specific dynamic route via router', async () => {
      await controller.setActiveChat('999');

      expect(router.go).toHaveBeenCalledWith('/messenger/999');
      expect(router.go).toHaveBeenCalledTimes(1);
    });
  });

  describe('addChatUser()', () => {
    it('should search user by login, add to chat, and call updateChatUsers sequence', async () => {
      vi.mocked(store.getState).mockReturnValue({ activeChat: 101 } as State);
      mockApiMethods.getUserByLogin.mockResolvedValue([
        { id: 777, login: 'friend' },
      ]);
      mockApiMethods.getUsers.mockResolvedValue([]);

      const updateUsersSpy = vi.spyOn(controller, 'updateChatUsers');

      await controller.addChatUser('friend');

      expect(store.getState).toHaveBeenCalled();
      expect(mockApiMethods.getUserByLogin).toHaveBeenCalledWith('friend');
      expect(mockApiMethods.addUser).toHaveBeenCalledWith(101, 777);
      expect(updateUsersSpy).toHaveBeenCalledTimes(1);
    });

    it('should return instantly if no activeChat exists in the current state', async () => {
      vi.mocked(store.getState).mockReturnValue({
        activeChat: undefined,
      } as State);

      await controller.addChatUser('anyone');

      expect(mockApiMethods.getUserByLogin).not.toHaveBeenCalled();
    });

    it('should do nothing if searching for a user returns empty payload/array', async () => {
      vi.mocked(store.getState).mockReturnValue({ activeChat: 101 } as State);
      mockApiMethods.getUserByLogin.mockResolvedValue([]);
      await controller.addChatUser('ghost');

      expect(mockApiMethods.addUser).not.toHaveBeenCalled();
    });
  });

  describe('deleteChatUser()', () => {
    it('should intercept execution if current logged in user tries to delete themselves', async () => {
      vi.mocked(store.getState).mockReturnValue({
        activeChat: 101,
        userProfile: { login: 'myself' },
      } as State);

      await controller.deleteChatUser('myself');

      expect(mockApiMethods.getUserByLogin).not.toHaveBeenCalled();
      expect(mockApiMethods.deleteUser).not.toHaveBeenCalled();
    });

    it('should seamlessly execute deletion flow if parameters represent a different user', async () => {
      vi.mocked(store.getState).mockReturnValue({
        activeChat: 101,
        userProfile: { login: 'myself' },
      } as State);
      mockApiMethods.getUserByLogin.mockResolvedValue([
        { id: 888, login: 'target' },
      ]);
      mockApiMethods.getUsers.mockResolvedValue([]);

      const updateUsersSpy = vi.spyOn(controller, 'updateChatUsers');

      await controller.deleteChatUser('target');

      expect(mockApiMethods.deleteUser).toHaveBeenCalledWith(101, 888);
      expect(updateUsersSpy).toHaveBeenCalledTimes(1);
    });

    it('should bypass workflow operations if activeChat configuration is missing', async () => {
      vi.mocked(store.getState).mockReturnValue({
        activeChat: undefined,
        userProfile: { login: 'myself' },
      } as State);

      await controller.deleteChatUser('other');

      expect(mockApiMethods.getUserByLogin).not.toHaveBeenCalled();
    });
  });

  describe('setChatAvatar()', () => {
    it('should correctly attach chatId parameter to FormData, call API, and locally map updated chats list state', async () => {
      const mockChats = [
        { id: 10, title: 'Chat 10', avatar: 'old_pic.jpg' },
        { id: 20, title: 'Chat 20', avatar: 'stay_same.jpg' },
      ];
      vi.mocked(store.getState).mockReturnValue({
        activeChat: 10,
        chats: mockChats,
      } as State);

      mockApiMethods.setAvatar.mockResolvedValue({ avatar: 'new_pic.jpg' });

      const testFormData = new FormData();
      const appendSpy = vi.spyOn(testFormData, 'append');

      await controller.setChatAvatar(testFormData);

      expect(appendSpy).toHaveBeenCalledWith('chatId', '10');
      expect(mockApiMethods.setAvatar).toHaveBeenCalledWith(testFormData);
      expect(store.setState).toHaveBeenCalledWith('chats', [
        { id: 10, title: 'Chat 10', avatar: 'new_pic.jpg' },
        { id: 20, title: 'Chat 20', avatar: 'stay_same.jpg' },
      ]);
    });

    it('should skip operation if activeChat identifier is not present', async () => {
      vi.mocked(store.getState).mockReturnValue({
        activeChat: undefined,
      } as State);
      const testFormData = new FormData();

      await controller.setChatAvatar(testFormData);

      expect(mockApiMethods.setAvatar).not.toHaveBeenCalled();
      expect(store.setState).not.toHaveBeenCalled();
    });
  });

  describe('updateChatUsers()', () => {
    it('should look up user collection by id and dispatch action to update state activeChatUsers', async () => {
      vi.mocked(store.getState).mockReturnValue({ activeChat: 55 } as State);
      const mockUsersList = [
        { id: 1, login: 'user1' },
        { id: 2, login: 'user2' },
      ];
      mockApiMethods.getUsers.mockResolvedValue(mockUsersList);

      await controller.updateChatUsers();

      expect(mockApiMethods.getUsers).toHaveBeenCalledWith(55);
      expect(store.setState).toHaveBeenCalledWith(
        'activeChatUsers',
        mockUsersList
      );
    });

    it('should completely skip api dispatch operations if activeChat state context is not present', async () => {
      vi.mocked(store.getState).mockReturnValue({
        activeChat: undefined,
      } as State);

      await controller.updateChatUsers();

      expect(mockApiMethods.getUsers).not.toHaveBeenCalled();
      expect(store.setState).not.toHaveBeenCalled();
    });
  });
});
