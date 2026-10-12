import { describe, it, expect, vi } from 'vitest';
import { SearchInput } from './search-input';
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

vi.mock('./search-input.hbs?raw', () => ({
  default: '',
}));

describe('SearchInput Component', () => {
  it('should maintain the accurate static componentName label metadata contract', () => {
    expect(SearchInput.componentName).toBe('SearchInput');
  });

  it('should cleanly instantiate and accurately preserve provided prop arguments', () => {
    const mockProps: BlockOwnProps = {};

    const instance = new SearchInput(mockProps);

    expect(instance['props']).toBeDefined();
    expect(instance['props']).toEqual(mockProps);
  });

  it('should bind the internal template reference property to the mocked layout wrapper', () => {
    const instance = new SearchInput({});

    expect(instance['template' as keyof typeof instance]).toBe('');
  });
});
