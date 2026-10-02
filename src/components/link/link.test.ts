import { describe, it, expect, vi } from 'vitest';
import { Link } from './link';
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

vi.mock('./link.hbs?raw', () => ({
  default: '',
}));

describe('Link Component', () => {
  it('should maintain the accurate static componentName label metadata contract', () => {
    expect(Link.componentName).toBe('Link');
  });

  it('should cleanly instantiate and accurately preserve provided prop arguments', () => {
    const mockProps: BlockOwnProps = {};

    const instance = new Link(mockProps);

    expect(instance['props']).toBeDefined();
    expect(instance['props']).toEqual(mockProps);
  });

  it('should bind the internal template reference property to the mocked layout wrapper', () => {
    const instance = new Link({});

    expect(instance['template' as keyof typeof instance]).toBe('');
  });
});
