import { describe, it, expect, vi } from 'vitest';
import { ErrorPage } from './error-page';
import type { BlockProps } from '../../components/block/block';

vi.mock('../../components/block/block', () => {
  return {
    Block: class {
      public props: BlockProps;
      constructor(props: BlockProps) {
        this.props = props;
      }
    },
  };
});

vi.mock('./error-page.hbs?raw', () => ({
  default: '',
}));

describe('ErrorPage Component', () => {
  it('should maintain the accurate static componentName label metadata', () => {
    expect(ErrorPage.componentName).toBe('ErrorPage');
  });

  it('should cleanly initialize and accurately store passed error message properties', () => {
    const mockProps = {
      messege: '404 - Page Not Found',
    };

    const page = new ErrorPage(mockProps);

    expect(page['props']).toBeDefined();
    expect(page['props'].messege).toBe('404 - Page Not Found');
  });

  it('should map the internal template variable structure to the asset string placeholder context', () => {
    const page = new ErrorPage({ messege: '500 - Internal Server Error' });

    expect(page['template']).toBe('');
  });
});
