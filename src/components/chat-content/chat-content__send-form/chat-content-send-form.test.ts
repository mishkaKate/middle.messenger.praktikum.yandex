import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ChatContentSendForm } from './chat-content__send-form';
import type { Messege } from './chat-content__send-form';

const mockChatServices = vi.hoisted(() => ({
  sendMessege: vi.fn<(message: string) => void>(),
}));

vi.mock('../../../services/chats', () => ({
  sendMessege: mockChatServices.sendMessege,
}));

vi.mock('../../form/form', () => {
  return {
    Form: class<_T> {
      protected template: string = '';
      constructor(..._args: unknown[]) {}
    },
  };
});

vi.mock('./chat-content__send-form.hbs?raw', () => ({
  default: '',
}));

describe('ChatContentSendForm Component', () => {
  let formInstance: ChatContentSendForm;

  beforeEach(() => {
    mockChatServices.sendMessege.mockReset();
    formInstance = new ChatContentSendForm();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should maintain the accurate static componentName label contract metadata', () => {
    expect(ChatContentSendForm.componentName).toBe('ChatContentSendForm');
  });

  describe('onSubmit() delegation workflow', () => {
    it('should forward the custom text payload straight to the global sendMessege utility handler', () => {
      const sampleMessage: Messege = {
        messege: 'Hello, this is a strongly-typed test message!',
      };

      formInstance.onSubmit(sampleMessage);

      expect(mockChatServices.sendMessege).toHaveBeenCalledWith(
        'Hello, this is a strongly-typed test message!'
      );
      expect(mockChatServices.sendMessege).toHaveBeenCalledTimes(1);
    });

    it('should pass an empty string down if message parameter attributes resolve blank', () => {
      const emptyMessage: Messege = {
        messege: '',
      };

      formInstance.onSubmit(emptyMessage);

      expect(mockChatServices.sendMessege).toHaveBeenCalledWith('');
      expect(mockChatServices.sendMessege).toHaveBeenCalledTimes(1);
    });
  });

  describe('Internal Component Layout State', () => {
    it('should capture its internal protected template field and map it cleanly to the asset mock', () => {
      expect(formInstance['template' as keyof ChatContentSendForm]).toBe('');
    });
  });
});
