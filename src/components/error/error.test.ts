import { describe, it, expect, vi } from 'vitest';
import { Error as ErrorComponent } from './error';
import type { Props } from './error';

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

vi.mock('./error.hbs?raw', () => ({
  default: '',
}));

describe('Error Component', () => {
  it('should maintain the accurate static componentName label metadata contract', () => {
    expect(ErrorComponent.componentName).toBe('Error');
  });

  it('should cleanly instantiate and accurately preserve provided prop arguments', () => {
    const mockProps: Props = {
      text: 'This field is required',
    };

    const instance = new ErrorComponent(mockProps);

    expect(instance['props']).toBeDefined();
    expect(instance['props']).toEqual(mockProps);
  });

  it('should bind the internal template reference property to the mocked layout wrapper', () => {
    const instance = new ErrorComponent({});

    expect(instance['template' as keyof typeof instance]).toBe('');
  });
});
