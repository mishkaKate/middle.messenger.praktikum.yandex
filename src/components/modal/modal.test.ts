import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Modal } from './modal';
import { ChatsController } from '../../pages/main/chats-controller';

const mockControllerMethods = vi.hoisted(() => ({
  addChatUser: vi.fn<(login: string) => Promise<void>>(),
  deleteChatUser: vi.fn<(login: string) => Promise<void>>(),
}));

vi.mock('../../pages/main/chats-controller', () => {
  return {
    ChatsController: class {
      addChatUser = mockControllerMethods.addChatUser;
      deleteChatUser = mockControllerMethods.deleteChatUser;
    },
  };
});

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

vi.mock('./modal.hbs?raw', () => ({
  default: '',
}));

describe('Modal Component', () => {
  let modalInstance: Modal;

  beforeEach(() => {
    mockControllerMethods.addChatUser.mockReset();
    mockControllerMethods.deleteChatUser.mockReset();

    document.body.innerHTML = '';

    modalInstance = new Modal({});
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should maintain the accurate static componentName label metadata', () => {
    expect(Modal.componentName).toBe('Modal');
  });

  it('should instantiate with an active instance of ChatsController', () => {
    const internalController = modalInstance['controller' as keyof Modal];
    expect(internalController).toBeInstanceOf(ChatsController);
  });

  describe('Submit Events Handling (`submit`)', () => {
    it('should invoke controller.addChatUser and invoke hidePopover when add-user-dialog-form triggers successfully', () => {
      const formNode = document.createElement('form');
      formNode.id = 'add-user-dialog-form';

      const inputNode = document.createElement('input');
      inputNode.id = 'modal-input-add-user-dialog';
      inputNode.value = 'john_doe_companion';
      formNode.appendChild(inputNode);

      const dialogNode = document.createElement('div'); // regular div to simulate native component safely
      dialogNode.id = 'add-user-dialog';
      const hidePopoverSpy = vi.fn<() => void>();

      (
        dialogNode as unknown as {
          hidePopover: import('vitest').Mock<() => void>;
        }
      ).hidePopover = hidePopoverSpy;

      document.body.appendChild(formNode);
      document.body.appendChild(dialogNode);

      const mockEvent = {
        target: formNode,
      } as unknown as Event;

      modalInstance.events.submit(mockEvent);

      expect(mockControllerMethods.addChatUser).toHaveBeenCalledWith(
        'john_doe_companion'
      );
      expect(mockControllerMethods.addChatUser).toHaveBeenCalledTimes(1);
      expect(hidePopoverSpy).toHaveBeenCalledTimes(1);
    });

    it('should invoke controller.deleteChatUser and invoke hidePopover when delete-user-dialog-form triggers successfully', () => {
      const formNode = document.createElement('form');
      formNode.id = 'delete-user-dialog-form';

      const inputNode = document.createElement('input');
      inputNode.id = 'modal-input-delete-user-dialog';
      inputNode.value = 'ex_member_login';
      formNode.appendChild(inputNode);

      const dialogNode = document.createElement('div');
      dialogNode.id = 'delete-user-dialog';
      const hidePopoverSpy = vi.fn<() => void>();

      (
        dialogNode as unknown as {
          hidePopover: import('vitest').Mock<() => void>;
        }
      ).hidePopover = hidePopoverSpy;

      document.body.appendChild(formNode);
      document.body.appendChild(dialogNode);

      const mockEvent = {
        target: formNode,
      } as unknown as Event;

      modalInstance.events.submit(mockEvent);

      expect(mockControllerMethods.deleteChatUser).toHaveBeenCalledWith(
        'ex_member_login'
      );
      expect(mockControllerMethods.deleteChatUser).toHaveBeenCalledTimes(1);
      expect(hidePopoverSpy).toHaveBeenCalledTimes(1);
    });

    it('should skip all action pathways if targeted forms match expected keys but query inputs are entirely blank', () => {
      const formNode = document.createElement('form');
      formNode.id = 'add-user-dialog-form';

      const inputNode = document.createElement('input');
      inputNode.id = 'modal-input-add-user-dialog';
      inputNode.value = ''; // empty structural input value context
      formNode.appendChild(inputNode);

      document.body.appendChild(formNode);

      const mockEvent = {
        target: formNode,
      } as unknown as Event;

      modalInstance.events.submit(mockEvent);

      expect(mockControllerMethods.addChatUser).not.toHaveBeenCalled();
    });

    it('should completely ignore submission events originating from unexpected or unmapped forms', () => {
      const genericForm = document.createElement('form');
      genericForm.id = 'some-other-unrelated-form-id';

      const mockEvent = {
        target: genericForm,
      } as unknown as Event;

      modalInstance.events.submit(mockEvent);

      expect(mockControllerMethods.addChatUser).not.toHaveBeenCalled();
      expect(mockControllerMethods.deleteChatUser).not.toHaveBeenCalled();
    });

    it('should gracefully exit execution flow if the event target is not an instance of HTMLFormElement', () => {
      const arbitraryDiv = document.createElement('div');
      arbitraryDiv.id = 'add-user-dialog-form'; // matching id string but non-conforming tag element shape

      const mockEvent = {
        target: arbitraryDiv,
      } as unknown as Event;

      expect(() => modalInstance.events.submit(mockEvent)).not.toThrow();
      expect(mockControllerMethods.addChatUser).not.toHaveBeenCalled();
    });
  });
});
