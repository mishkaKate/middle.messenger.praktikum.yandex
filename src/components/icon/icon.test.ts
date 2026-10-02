import { describe, it, expect, vi } from 'vitest';
import { Icon } from './icon';
import type { Props } from './icon';

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

vi.mock('./icon.hbs?raw', () => ({
  default: '',
}));

describe('Icon Component', () => {
  it('should maintain the accurate static componentName label metadata contract', () => {
    expect(Icon.componentName).toBe('Icon');
  });

  it('should cleanly instantiate and accurately preserve provided prop arguments', () => {
    const mockProps: Props = {
      source: '/public/img/chat-avatar.svg',
    };

    const instance = new Icon(mockProps);

    expect(instance['props']).toBeDefined();
    expect(instance['props']).toEqual(mockProps);
  });

  it('should bind the internal template reference property to the mocked layout wrapper', () => {
    const instance = new Icon({});

    expect(instance['template' as keyof typeof instance]).toBe('');
  });
});
