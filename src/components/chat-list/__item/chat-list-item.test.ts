import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ChatListItem } from './chat-list__item';
import type { Props } from './chat-list__item';

const mockControllerMethods = vi.hoisted(() => ({
  setActiveChat: vi.fn<(id: string) => Promise<void>>(),
}));

vi.mock('../../../pages/main/chats-controller', () => {
  return {
    ChatsController: class {
      setActiveChat = mockControllerMethods.setActiveChat;
    },
  };
});

vi.mock('../../block/block', () => {
  return {
    Block: class<P> {
      public props: P;
      constructor(props: P) {
        this.props = props;
      }
    },
  };
});

vi.mock('./chat-list__item.hbs?raw', () => ({
  default: '',
}));

describe('ChatListItem Component', () => {
  beforeEach(() => {
    mockControllerMethods.setActiveChat.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should maintain the accurate static componentName label metadata contract', () => {
    expect(ChatListItem.componentName).toBe('ChatListItem');
  });

  describe('Constructor fallback configurations', () => {
    it('should preserve the verified avatar resource pointer if provided inside constructor properties', () => {
      const targetProps: Props = {
        avatar: 'https://ya-praktikum.tech',
      };

      const itemInstance = new ChatListItem(targetProps);

      expect(itemInstance['props'].avatar).toBe('https://ya-praktikum.tech');
    });

    it('should dynamically inject a standard local favicon path fallback if the avatar parameter is null or completely missing', () => {
      const missingAvatarProps: Props = {
        avatar: null,
      };

      const itemInstance = new ChatListItem(missingAvatarProps);

      expect(itemInstance['props'].avatar).toBe('./public/favicon.svg');
    });
  });

  describe('Click event handling handlers (`click`)', () => {
    it('should extract target node IDs and forward execution into the controller if click triggers from a valid class selector', () => {
      const itemInstance = new ChatListItem({});

      const simulatedTargetNode = document.createElement('div');
      simulatedTargetNode.className = 'chat-item-block';
      simulatedTargetNode.id = '707'; // Active chat mock identifier string

      const mockEvent = {
        target: simulatedTargetNode,
      } as unknown as Event;

      type ComponentEventsStructure = {
        click: (e: Event) => void;
      };

      const eventsObject = (
        itemInstance as unknown as { events: ComponentEventsStructure }
      ).events;
      eventsObject.click(mockEvent);

      expect(mockControllerMethods.setActiveChat).toHaveBeenCalledWith('707');
      expect(mockControllerMethods.setActiveChat).toHaveBeenCalledTimes(1);
    });

    it('should completely ignore execution workflows if the action target does not match the exact class footprint selector', () => {
      const itemInstance = new ChatListItem({});
      const mismatchedTargetNode = document.createElement('div');
      mismatchedTargetNode.className = 'unrelated-layout-wrapper-element';
      mismatchedTargetNode.id = '707';

      const mockEvent = {
        target: mismatchedTargetNode,
      } as unknown as Event;

      type ComponentEventsStructure = {
        click: (e: Event) => void;
      };

      const eventsObject = (
        itemInstance as unknown as { events: ComponentEventsStructure }
      ).events;
      eventsObject.click(mockEvent);

      expect(mockControllerMethods.setActiveChat).not.toHaveBeenCalled();
    });

    it('should gracefully exit without throwing exceptions if the event target structure is not an instance of HTMLElement', () => {
      const itemInstance = new ChatListItem({});
      const mockEvent = {
        target: null,
      } as unknown as Event;

      type ComponentEventsStructure = {
        click: (e: Event) => void;
      };

      const eventsObject = (
        itemInstance as unknown as { events: ComponentEventsStructure }
      ).events;

      expect(() => eventsObject.click(mockEvent)).not.toThrow();
      expect(mockControllerMethods.setActiveChat).not.toHaveBeenCalled();
    });
  });
});
