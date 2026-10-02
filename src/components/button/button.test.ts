import { describe, it, expect, vi } from 'vitest';
import { Button } from './button';
import type { BlockOwnProps } from '../block/block';

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

vi.mock('./button.hbs?raw', () => ({
  default: '',
}));

describe('Button Component', () => {
  it('should maintain the accurate static componentName label metadata contract', () => {
    expect(Button.componentName).toBe('Button');
  });

  it('should cleanly instantiate and accurately preserve provided prop arguments', () => {
    const mockProps: BlockOwnProps = {};
    const instance = new Button(mockProps);

    expect(instance['props']).toBeDefined();
    expect(instance['props']).toEqual(mockProps);
  });

  it('should bind the internal template reference property to the mocked layout wrapper', () => {
    const instance = new Button({});

    expect(instance['template' as keyof typeof instance]).toBe('');
  });
});
