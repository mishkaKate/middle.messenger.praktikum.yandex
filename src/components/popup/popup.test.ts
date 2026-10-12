import { describe, it, expect, vi } from 'vitest';
import { Popup } from './popup';
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

vi.mock('./popup.hbs?raw', () => ({
  default: '',
}));

describe('Popup Component', () => {
  it('should maintain the accurate static componentName label metadata contract', () => {
    expect(Popup.componentName).toBe('Popup');
  });

  it('should cleanly instantiate and accurately preserve provided prop arguments', () => {
    const mockProps: BlockOwnProps = {};

    const instance = new Popup(mockProps);

    expect(instance['props']).toBeDefined();
    expect(instance['props']).toEqual(mockProps);
  });

  it('should bind the internal template reference property to the mocked layout wrapper', () => {
    const instance = new Popup({});

    expect(instance['template' as keyof typeof instance]).toBe('');
  });
});
