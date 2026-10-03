import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ChatContent, mapStateToProps } from './chat-content';
import type { State } from '../../store';
import type { BlockOwnProps } from '../block/block';
import type { Indexed } from '../../utils/helpers';

interface MockConnectedComponent {
  Component: new (...args: unknown[]) => {
    props: BlockOwnProps & { avatar?: string | null };
  };
  mapper: (state: State) => Record<string, unknown>;
}

const mockHelperMethods = vi.hoisted(() => ({
  getImageSource: vi.fn<(avatar: string) => string>(),
}));

vi.mock('../../utils/helpers', () => ({
  getImageSource: mockHelperMethods.getImageSource,
}));

vi.mock('../block/block', () => {
  return {
    Block: class<P> {
      public props: P;
      constructor(props: P) {
        this.props = props;
      }
    },
  };
});

vi.mock('../../utils/connect', () => ({
  connect: <_P, C, M>(component: C, mapper: M) => {
    return { Component: component, mapper } as unknown;
  },
}));

vi.mock('./chat-content.hbs?raw', () => ({
  default: '',
}));

describe('ChatContent Component & mapStateToProps', () => {
  const connectedWrapper = ChatContent as unknown as MockConnectedComponent;
  const RawComponent = connectedWrapper.Component;

  beforeEach(() => {
    mockHelperMethods.getImageSource.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('ChatContentComponent Constructor Logic', () => {
    it('should retain the configured avatar parameter if it is already present in props', () => {
      const instance = new RawComponent({
        avatar: 'https://ya-praktikum.tech',
      });
      expect(instance.props.avatar).toBe('https://ya-praktikum.tech');
    });

    it('should inject a local placeholder favicon fallback path if the avatar property evaluates to falsy or null', () => {
      const instance = new RawComponent({ avatar: null });
      expect(instance.props.avatar).toBe('./public/favicon.svg');
    });
  });

  describe('mapStateToProps() evaluation paths', () => {
    const mockChats = [
      {
        id: 10,
        title: 'First Channel',
        avatar: 'pic_10.jpg',
        unread_count: 0,
        created_by: 1,
        last_message: null,
      },
      {
        id: 20,
        title: 'Second Channel',
        avatar: '',
        unread_count: 3,
        created_by: 2,
        last_message: null,
      },
    ];
    const mockUsers = [{ id: 99, login: 'companion' }];
    const mockMessages = [{ id: 1, content: 'Hi', time: '12:00' }];

    it('should immediately yield an empty object context if state chats are completely missing', () => {
      const invalidState: State = {
        chats: undefined,
        activeChat: undefined,
        activeChatUsers: [],
        messages: [],
      };

      const result = mapStateToProps(invalidState);
      expect(result).toEqual({});
    });

    it('should default to the very first chat element in the collection if activeChat is not explicitly defined', () => {
      const unselectedState: State = {
        chats: mockChats,
        activeChat: undefined,
        activeChatUsers: [],
        messages: [],
      };

      const result = mapStateToProps(unselectedState);
      expect(result).toEqual(mockChats[0]);
    });

    it('should locate the active chat record, format its avatar link, and bundle message and user slices when valid', () => {
      const activeState: State = {
        chats: mockChats,
        activeChat: 10,
        activeChatUsers: mockUsers,
        messages: mockMessages as State['messages'],
      };

      mockHelperMethods.getImageSource.mockReturnValue(
        'https://ya-praktikum.tech'
      );

      const result = mapStateToProps(activeState);

      expect(mockHelperMethods.getImageSource).toHaveBeenCalledWith(
        'pic_10.jpg'
      );
      expect(result).toEqual({
        id: 10,
        title: 'First Channel',
        avatar: 'https://ya-praktikum.tech',
        unread_count: 0,
        created_by: 1,
        last_message: null,
        messages: mockMessages,
        users: mockUsers,
      });
    });

    it('should fallback onto a local placeholder layout path if the matched channel does not possess an avatar key string', () => {
      const activeStateNoAvatar: State = {
        chats: mockChats,
        activeChat: 20,
        activeChatUsers: mockUsers,
        messages: [],
      };

      const result = mapStateToProps(activeStateNoAvatar) as Indexed;

      expect(mockHelperMethods.getImageSource).not.toHaveBeenCalled();
      expect(result.avatar).toBe('/public/favicon.svg');
    });

    it('should supply a clean empty array container fallback if the global message slice structure is falsy or null', () => {
      const stateWithNullMessages: State = {
        chats: mockChats,
        activeChat: 20,
        activeChatUsers: mockUsers,
        messages: undefined,
      };

      const result = mapStateToProps(stateWithNullMessages) as Indexed;
      expect(result.messages).toEqual([]);
    });
  });
});
