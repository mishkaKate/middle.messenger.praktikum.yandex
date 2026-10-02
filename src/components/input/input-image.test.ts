import { describe, it, expect, vi } from 'vitest';
import { InputImage } from './input-image';
import type { Props } from './input-image';

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

vi.mock('./input-image.hbs?raw', () => ({
  default: '',
}));

describe('InputImage Component', () => {
  it('should maintain the accurate static componentName label metadata contract', () => {
    expect(InputImage.componentName).toBe('InputImage');
  });

  it('should cleanly instantiate and accurately preserve provided prop arguments', () => {
    const mockProps: Props = {
      name: 'avatar_upload',
      id: 'avatar_image_input',
    };

    const instance = new InputImage(mockProps);

    expect(instance['props']).toBeDefined();
    expect(instance['props']).toEqual(mockProps);
  });

  it('should bind the internal template reference property to the mocked layout wrapper', () => {
    const instance = new InputImage({});

    expect(instance['template' as keyof typeof instance]).toBe('');
  });
});
