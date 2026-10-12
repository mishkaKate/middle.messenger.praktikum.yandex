import { describe, it, expect, vi } from 'vitest';
import { ChatContentMessege } from './chat-content__messege';
import type { BlockOwnProps } from '../../block/block';

vi.mock('../../block/block', () => {
  return {
    Block: class<P extends BlockOwnProps = BlockOwnProps> {
      public props: P;
      constructor(props: P) {
        this.props = props;
      }
    },
  };
});

vi.mock('./chat-content__messege.hbs?raw', () => ({
  default: '',
}));

describe('ChatContentMessege Component', () => {
  it('should maintain the accurate static componentName label metadata contract', () => {
    expect(ChatContentMessege.componentName).toBe('ChatContentMessege');
  });

  it('should cleanly instantiate and accurately preserve provided prop arguments', () => {
    const mockProps: BlockOwnProps = {};
    const instance = new ChatContentMessege(mockProps);

    expect(instance['props']).toBeDefined();
    expect(instance['props']).toEqual(mockProps);
  });

  it('should bind the internal template reference property to the mocked layout wrapper string', () => {
    const instance = new ChatContentMessege({});

    expect(instance['template' as keyof typeof instance]).toBe('');
  });
});
