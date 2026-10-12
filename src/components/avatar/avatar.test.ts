import { describe, it, expect, vi } from 'vitest';
import { Avatar } from './avatar';
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

vi.mock('./avatar.hbs?raw', () => ({
  default: '',
}));

describe('Avatar Component', () => {
  it('should maintain the accurate static componentName label metadata contract', () => {
    expect(Avatar.componentName).toBe('Avatar');
  });

  it('should cleanly instantiate and accurately preserve provided prop arguments', () => {
    const mockProps: BlockOwnProps = {
      source: 'https://ya-praktikum.tech',
      alt: 'User profile image avatar',
    };

    const instance = new Avatar(mockProps);

    expect(instance['props']).toBeDefined();
    expect(instance['props']).toEqual(mockProps);
  });

  it('should bind the internal template reference property to the mocked layout wrapper string', () => {
    const instance = new Avatar({});
    const typedInstance = instance as unknown as { template: string };

    expect(typedInstance.template).toBe('');
  });
});
