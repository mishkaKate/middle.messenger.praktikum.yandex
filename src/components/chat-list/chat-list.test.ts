import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { ChatItemState, State } from '../../store';
import type { BlockOwnProps } from '../block/block';
import type { ChatListItem } from './__item/chat-list__item';
import { ChatList, mapStateToProps } from './chat-list';
interface MockConnectedComponent {
  Component: typeof ChatListItem;
  mapper: (state: State) => { chats: Array<Record<string, unknown>> };
}

const mockHelperMethods = vi.hoisted(() => ({
  getImageSource: vi.fn<(avatar: string) => string>(),
}));

vi.mock('../../utils/helpers', () => ({
  getImageSource: mockHelperMethods.getImageSource,
}));

vi.mock('../block/block', () => {
  return {
    Block: class<P extends BlockOwnProps = BlockOwnProps> {
      public props: P;
      constructor(props: P) {
        this.props = props;
      }
    },
  };
});

vi.mock('../../utils/connect', () => ({
  connect: <C, M>(component: C, mapper: M) => {
    return { Component: component, mapper } as unknown;
  },
}));

vi.mock('./chat-list.hbs?raw', () => ({
  default: '',
}));

describe('ChatList Component & mapStateToProps', () => {
  const connectedWrapper = ChatList as unknown as MockConnectedComponent;
  const RawComponent = connectedWrapper.Component;

  beforeEach(() => {
    mockHelperMethods.getImageSource.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('ChatListComponent Structure', () => {
    it('should maintain the accurate static componentName label metadata contract', () => {
      expect(RawComponent.componentName).toBe('ChatList');
    });

    it('should bind its internal protected template field to the mocked layout string asset', () => {
      const instance = new RawComponent({});
      expect(instance['template' as keyof typeof instance]).toBe('');
    });
  });

  describe('mapStateToProps() conversion pipeline', () => {
    it('should map active user chats and compile absolute avatar asset resources when available', () => {
      const mockState: State = {
        userProfile: undefined,
        messages: [],
        chats: [
          {
            id: 1,
            title: 'General Chat',
            avatar: 'chat_pic_1.png',
            unread_count: 0,
            created_by: 12,
            last_message: null,
          } as ChatItemState,
          {
            id: 2,
            title: 'Private Messages',
            avatar: '',
            unread_count: 5,
            created_by: 34,
            last_message: null,
          } as ChatItemState,
        ],
      };

      mockHelperMethods.getImageSource.mockImplementation(
        (_avatar: string) => `https://ya-praktikum.tech{avatar}`
      );

      const result = mapStateToProps(mockState);

      expect(result.chats).toEqual([
        {
          id: 1,
          title: 'General Chat',
          avatar: 'https://ya-praktikum.tech{avatar}',
          unread_count: 0,
          created_by: 12,
          last_message: null,
        },
        {
          id: 2,
          title: 'Private Messages',
          avatar: '',
          unread_count: 5,
          created_by: 34,
          last_message: null,
        },
      ]);
      expect(mockHelperMethods.getImageSource).toHaveBeenCalledWith(
        'chat_pic_1.png'
      );
      expect(mockHelperMethods.getImageSource).toHaveBeenCalledTimes(1); // Should not be called for the second chat since it has no avatar
    });

    it('should return a clean empty array fallback structural sequence if state chats configuration is missing', () => {
      const emptyState: State = {
        userProfile: undefined,
        messages: [],
        chats: undefined,
      };

      const result = mapStateToProps(emptyState);

      expect(result.chats).toEqual([]);
      expect(mockHelperMethods.getImageSource).not.toHaveBeenCalled();
    });
  });

  describe('Component Connect Strategy', () => {
    it('should correctly attach the global mapping configuration strategy during module connection integration', () => {
      const mapperRef = connectedWrapper.mapper;
      expect(mapperRef).toBeDefined();
      expect(typeof mapperRef).toBe('function');
    });
  });
});
