import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MainPage } from './main-page'; // Adjust the relative import path based on your folder structure
import router from '../../router/router';
import type { BlockProps } from '../../components/block/block';

const mockControllerMethods = vi.hoisted(() => ({
  addChat: vi.fn(),
  setChatAvatar: vi.fn(),
}));

vi.mock('./chats-controller', () => {
  return {
    ChatsController: class {
      addChat = mockControllerMethods.addChat;
      setChatAvatar = mockControllerMethods.setChatAvatar;
    },
  };
});

vi.mock('../../router/router', () => ({
  default: {
    go: vi.fn(),
  },
}));

vi.mock('../../components/block/block', () => ({
  Block: class {
    props: BlockProps;
    constructor(props: BlockProps) {
      this.props = props;
    }
  },
}));

vi.mock('./main-page.hbs?raw', () => ({
  default: '',
}));

describe('MainPage Component', () => {
  let page: MainPage;

  beforeEach(() => {
    mockControllerMethods.addChat.mockReset();
    mockControllerMethods.setChatAvatar.mockReset();
    vi.mocked(router.go).mockReset();
    document.body.innerHTML = '';
    page = new MainPage({ chats: [] });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('onProfileClick() & profile redirection', () => {
    it('should instantly navigate to /settings when invoking onProfileClick explicitly', () => {
      page.onProfileClick();

      expect(router.go).toHaveBeenCalledWith('/settings');
      expect(router.go).toHaveBeenCalledTimes(1);
    });

    it('should ignore click events entirely if target id does not map to known hooks', () => {
      const mockEvent = {
        target: { id: 'some-random-button' } as unknown as EventTarget,
      } as Event;

      page['events'].click(mockEvent);

      expect(router.go).not.toHaveBeenCalled();
    });

    it('should safely bypass click events if target reference is not an HTMLElement instance', () => {
      const mockEvent = {
        target: null,
      } as unknown as Event;

      expect(() => page['events'].click(mockEvent)).not.toThrow();
      expect(router.go).not.toHaveBeenCalled();
    });
  });

  describe('Submit Events (`submit`) & Chat Creation', () => {
    it('should call controller.addChat and close the dialog popover if modal form is submitted with a valid chat name', () => {
      const formElement = document.createElement('form');
      formElement.id = 'chat-name-dialog-form';

      const inputElement = document.createElement('input');
      inputElement.id = 'modal-input-chat-name-dialog';
      inputElement.value = 'My New Secret Chat';
      formElement.appendChild(inputElement);

      const dialogElement = document.createElement('div');
      dialogElement.id = 'chat-name-dialog';
      const hidePopoverSpy = vi.fn();
      (dialogElement as unknown as HTMLDialogElement).hidePopover =
        hidePopoverSpy;

      document.body.appendChild(formElement);
      document.body.appendChild(dialogElement);

      const mockEvent = {
        preventDefault: vi.fn(),
        target: formElement,
      } as unknown as Event;

      page['events'].submit(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1);
      expect(mockControllerMethods.addChat).toHaveBeenCalledWith(
        'My New Secret Chat'
      );
      expect(mockControllerMethods.addChat).toHaveBeenCalledTimes(1);
      expect(hidePopoverSpy).toHaveBeenCalledTimes(1);
    });

    it('should prevent default form behavior but skip chat creation if chat name input element is blank', () => {
      const formElement = document.createElement('form');
      formElement.id = 'chat-name-dialog-form';

      const inputElement = document.createElement('input');
      inputElement.id = 'modal-input-chat-name-dialog';
      inputElement.value = '';
      formElement.appendChild(inputElement);

      document.body.appendChild(formElement);

      const mockEvent = {
        preventDefault: vi.fn(),
        target: formElement,
      } as unknown as Event;

      page['events'].submit(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1);
      expect(mockControllerMethods.addChat).not.toHaveBeenCalled();
    });

    it('should ignore form submissions targeting different form layout modules', () => {
      const formElement = document.createElement('form');
      formElement.id = 'another-unrelated-form-id';

      const mockEvent = {
        preventDefault: vi.fn(),
        target: formElement,
      } as unknown as Event;

      page['events'].submit(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1);
      expect(mockControllerMethods.addChat).not.toHaveBeenCalled();
    });
  });

  describe('Change Events (`change`) & Avatar Updates', () => {
    it('should forward data bundle payload to controller when avatar input updates inside an authentic form wrapper', () => {
      const formElement = document.createElement('form');
      formElement.id = 'avatar-form';

      const fileInput = document.createElement('input');
      fileInput.id = 'avatar';
      fileInput.type = 'file';
      fileInput.name = 'avatarFile';
      formElement.appendChild(fileInput);

      document.body.appendChild(formElement);

      const mockEvent = {
        target: fileInput,
      } as unknown as Event;

      page['events'].change(mockEvent);

      expect(mockControllerMethods.setChatAvatar).toHaveBeenCalledWith(
        expect.any(FormData)
      );
      expect(mockControllerMethods.setChatAvatar).toHaveBeenCalledTimes(1);
    });

    it('should bypass profile avatar operations if target element identifier matches but wrapper node is not an HTMLFormElement', () => {
      const invalidFormWrapper = document.createElement('div');
      invalidFormWrapper.id = 'avatar-form';
      document.body.appendChild(invalidFormWrapper);

      const fileInput = document.createElement('input');
      fileInput.id = 'avatar';

      const mockEvent = {
        target: fileInput,
      } as unknown as Event;

      page['events'].change(mockEvent);

      expect(mockControllerMethods.setChatAvatar).not.toHaveBeenCalled();
    });

    it('should immediately terminate workflow actions if change originates from random non-avatar elements', () => {
      const simpleInput = document.createElement('input');
      simpleInput.id = 'chat-message-search-input';

      const mockEvent = {
        target: simpleInput,
      } as unknown as Event;

      page['events'].change(mockEvent);

      expect(mockControllerMethods.setChatAvatar).not.toHaveBeenCalled();
    });
  });
});
